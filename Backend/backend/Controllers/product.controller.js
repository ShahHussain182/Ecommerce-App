import { Product } from '../Models/Product.model.js';
import catchErrors from '../Utils/catchErrors.js';
import mongoose from 'mongoose';
import { createProductSchema, updateProductSchema } from '../Schemas/productSchema.js';
import { productIndex } from '../Utils/meilisearchClient.js'; // <-- import Meilisearch client
import { uploadFileToS3 } from '../Utils/s3Upload.js';
import {logger} from '../Utils/logger.js';
import { DeleteObjectCommand } from "@aws-sdk/client-s3"; // Import DeleteObjectCommand
import s3Client from "../Utils/s3Client.js"; // Import s3Client

const S3_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "e-store-images";
const MINIO_URL = process.env.MINIO_URL || "http://localhost:9000";
const MAX_IMAGES = 5; // Define max images here

/**
 * @description Get all products with advanced filtering, sorting, and pagination using Meilisearch.
 */
export const getProducts = catchErrors(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;

  const { searchTerm, categories, priceRange, colors, sizes, sortBy } = req.query;

  // Build Meilisearch filter string
  const filters = [];

  if (categories) {
    const categoryArray = categories.split(',');
    filters.push(`category IN [${categoryArray.map(c => `"${c}"`).join(', ')}]`);
  }

  if (priceRange) {
    const [min, max] = priceRange.split(',').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      filters.push(`price >= ${min} AND price <= ${max}`);
    }
  }

  if (colors) {
    const colorArray = colors.split(',');
    filters.push(`colors IN [${colorArray.map(c => `"${c}"`).join(', ')}]`);
  }

  if (sizes) {
    const sizeArray = sizes.split(',');
    filters.push(`sizes IN [${sizeArray.map(s => `"${s}"`).join(', ')}]`);
  }

  // Sorting mapping
  let sort = [];
  switch (sortBy) {
    case 'price-desc':
      sort = ['price:desc'];
      break;
    case 'name-asc':
      sort = ['name:asc'];
      break;
    case 'name-desc':
      sort = ['name:desc'];
      break;
    case 'averageRating-desc': // New sorting option
      sort = ['averageRating:desc'];
      break;
    case 'numberOfReviews-desc': // New sorting option
      sort = ['numberOfReviews:desc'];
      break;
    case 'relevance-desc':
      // Relevance is default in Meilisearch when query is present, no explicit sort needed
      break;
    case 'price-asc':
    default:
      sort = ['price:asc'];
      break;
  }

  const searchParams = {
    q: searchTerm || '',
    limit,
    offset: (page - 1) * limit,
    filter: filters.length > 0 ? filters.join(' AND ') : undefined,
    sort: sort.length > 0 ? sort : undefined,
  };

  const results = await productIndex.search(searchParams.q, searchParams);

  res.status(200).json({
    success: true,
    products: results.hits,
    totalProducts: results.estimatedTotalHits,
    nextPage: results.estimatedTotalHits > page * limit ? page + 1 : null,
  });
});

/**
 * @description Get autocomplete suggestions using Meilisearch.
 */
export const getAutocompleteSuggestions = catchErrors(async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  const results = await productIndex.search(query, {
    limit: 5,
    attributesToRetrieve: ['name'],
  });

  res.status(200).json({
    success: true,
    suggestions: results.hits.map((hit) => hit.name),
  });
});

/**
 * @description Get a single product by its ID (MongoDB source of truth).
 */
export const getProductById = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
  }

  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  res.status(200).json({ success: true, product });
});

/**
 * @description Get featured products (from MongoDB).
 */
export const getFeaturedProducts = catchErrors(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(4);
  res.status(200).json({ success: true, products });
});

/**
 * @description Create a new product (Admin only) — also index in Meilisearch.
 */
export const createProduct = catchErrors(async (req, res) => {
  logger.debug(`[createProduct] Raw req.body: ${JSON.stringify(req.body)}`);
  logger.debug(`[createProduct] Raw req.files: ${JSON.stringify(req.files?.map(f => f.originalname))}`);

  // Manually parse stringified boolean and array from FormData
  const parsedBody = {
    ...req.body,
    isFeatured: req.body.isFeatured === 'true', // Convert string "true"/"false" to boolean
    variants: req.body.variants ? JSON.parse(req.body.variants) : undefined, // Parse JSON string to array
  };
  logger.debug(`[createProduct] Parsed body before Zod: ${JSON.stringify(parsedBody)}`);

  // Handle image uploads from req.files
  const uploadedImageUrls = [];
  if (req.files && req.files.length > 0) {
    if (req.files.length > MAX_IMAGES) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot upload more than ${MAX_IMAGES} images. You are trying to add ${req.files.length}.` 
      });
    }
    for (const file of req.files) {
      try {
        // For initial product creation, we don't have a product ID yet for the folder.
        // We'll use a generic 'temp' folder or just 'products' and rely on S3's flat structure.
        // A more robust solution might involve updating the image path after product creation.
        const url = await uploadFileToS3(file.buffer, file.mimetype, 'products'); 
        uploadedImageUrls.push(url);
      } catch (error) {
        logger.error(`Failed to upload file ${file.originalname} during product creation: ${error.message}`);
        return res.status(500).json({ success: false, message: `Failed to upload image: ${error.message}` });
      }
    }
  }

  // Combine parsed body with uploaded image URLs for Zod validation
  const productDataForValidation = {
    ...parsedBody,
    imageUrls: uploadedImageUrls, // Add the generated image URLs
  };

  const productData = createProductSchema.parse(productDataForValidation);

  if (!productData.variants || productData.variants.length === 0) {
    productData.variants = [{
      size: "N/A",
      color: "N/A",
      price: 0,
      stock: 0,
    }];
  }

  const product = await Product.create(productData);

  // Sync with Meilisearch
  await productIndex.addDocuments([{
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrls: product.imageUrls || [],
    isFeatured: Boolean(product.isFeatured),
    variants: (product.variants || []).map(v => ({
      _id: v._id.toString(),
      size: String(v.size ?? ''),
      color: String(v.color ?? ''),
      price: Number(v.price ?? 0),
      stock: Number(v.stock ?? 0),
    })),
    price: product.variants[0]?.price ?? 0,
    colors: product.variants.map(v => v.color),
    sizes: product.variants.map(v => v.size),
    averageRating: product.averageRating ?? 0,
    numberOfReviews: product.numberOfReviews ?? 0,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : null,
  }]);
  

  res.status(201).json({ success: true, message: 'Product created successfully!', product });
});

/**
 * @description Update an existing product (Admin only) — also update Meilisearch.
 */
export const updateProduct = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
  }

  const updates = updateProductSchema.parse(req.body);

  if (updates.variants && updates.variants.length === 0) {
    updates.variants = [{
      size: "N/A",
      color: "N/A",
      price: 0,
      stock: 0,
    }];
  }

  const product = await Product.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Sync update with Meilisearch
  await productIndex.addDocuments([{
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrls: product.imageUrls || [],
    isFeatured: Boolean(product.isFeatured),
    variants: (product.variants || []).map(v => ({
      _id: v._id.toString(),
      size: String(v.size ?? ''),
      color: String(v.color ?? ''),
      price: Number(v.price ?? 0),
      stock: Number(v.stock ?? 0),
    })),
    price: product.variants[0]?.price ?? 0,
    colors: product.variants.map(v => v.color),
    sizes: product.variants.map(v => v.size),
    averageRating: product.averageRating ?? 0,
    numberOfReviews: product.numberOfReviews ?? 0,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : null,
  }]);
  

  res.status(200).json({ success: true, message: 'Product updated successfully!', product });
});

/**
 * @description Delete a product (Admin only) — also delete from Meilisearch.
 */
export const deleteProduct = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Optionally, delete all associated images from S3
  if (product.imageUrls && product.imageUrls.length > 0) {
    const deletePromises = product.imageUrls.map(async (imageUrl) => {
      try {
        const s3Key = imageUrl.replace(`${MINIO_URL}/${S3_BUCKET_NAME}/`, '');
        await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: s3Key }));
        logger.info(`Deleted S3 object: ${s3Key}`);
      } catch (s3Error) {
        logger.error(`Failed to delete S3 object ${imageUrl}: ${s3Error.message}`);
      }
    });
    await Promise.all(deletePromises);
  }

  await productIndex.deleteDocument(id.toString());

  res.status(200).json({ success: true, message: 'Product deleted successfully!' });
});

/**
 * @description Upload product images to S3 and update the product document.
 */
export const uploadProductImages = catchErrors(async (req, res) => {
  const { id } = req.params; // Get product ID from URL params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded.' });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Check if adding new images would exceed the MAX_IMAGES limit
  const currentImageCount = product.imageUrls ? product.imageUrls.length : 0;
  if (currentImageCount + req.files.length > MAX_IMAGES) {
    return res.status(400).json({ 
      success: false, 
      message: `Cannot upload more than ${MAX_IMAGES} images. You currently have ${currentImageCount} and are trying to add ${req.files.length}.` 
    });
  }

  const uploadedUrls = [];
  for (const file of req.files) {
    try {
      const url = await uploadFileToS3(file.buffer, file.mimetype, `products/${id}`); // Use product ID for folder
      uploadedUrls.push(url);
    } catch (error) {
      logger.error(`Failed to upload file ${file.originalname} for product ${id}: ${error.message}`);
      // Continue processing other files, but log the error
    }
  }

  if (uploadedUrls.length === 0) {
    return res.status(500).json({ success: false, message: 'No images were successfully uploaded.' });
  }

  // Append new URLs to existing ones
  product.imageUrls = [...(product.imageUrls || []), ...uploadedUrls];
  await product.save(); // Save the updated product

  // Update Meilisearch with the new image URLs
  await productIndex.addDocuments([{
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrls: product.imageUrls, // Use the updated imageUrls
    isFeatured: Boolean(product.isFeatured),
    variants: (product.variants || []).map(v => ({
      _id: v._id.toString(),
      size: String(v.size ?? ''),
      color: String(v.color ?? ''),
      price: Number(v.price ?? 0),
      stock: Number(v.stock ?? 0),
    })),
    price: product.variants[0]?.price ?? 0,
    colors: product.variants.map(v => v.color),
    sizes: product.variants.map(v => v.size),
    averageRating: product.averageRating ?? 0,
    numberOfReviews: product.numberOfReviews ?? 0,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : null,
  }]);

  res.status(200).json({
    success: true,
    message: `${uploadedUrls.length} image(s) uploaded and product updated successfully.`,
    product: product, // Return the full updated product document
  });
});

/**
 * @description Delete a specific product image from S3 and update the product document.
 */
export const deleteProductImage = catchErrors(async (req, res) => {
  const { id } = req.params; // Product ID
  const { imageUrl } = req.query; // Image URL to delete

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
  }
  if (!imageUrl) {
    return res.status(400).json({ success: false, message: 'Image URL is required.' });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Ensure the image exists in the product's imageUrls
  const imageIndex = product.imageUrls.indexOf(imageUrl);
  if (imageIndex === -1) {
    return res.status(404).json({ success: false, message: 'Image not found in product\'s image list.' });
  }

  // Enforce minimum 1 image rule
  if (product.imageUrls.length <= 1) {
    return res.status(400).json({ success: false, message: 'A product must have at least one image.' });
  }

  // Remove image from S3
  try {
    const s3Key = imageUrl.replace(`${MINIO_URL}/${S3_BUCKET_NAME}/`, '');
    await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: s3Key }));
    logger.info(`Deleted S3 object: ${s3Key}`);
  } catch (s3Error) {
    logger.error(`Failed to delete S3 object ${imageUrl}: ${s3Error.message}`);
    // Decide whether to proceed or return error. For now, we'll proceed with DB update.
    // In a real app, you might want to retry or alert admin.
  }

  // Remove image URL from product document
  product.imageUrls.splice(imageIndex, 1);
  await product.save();

  // Update Meilisearch
  await productIndex.addDocuments([{
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrls: product.imageUrls,
    isFeatured: Boolean(product.isFeatured),
    variants: (product.variants || []).map(v => ({
      _id: v._id.toString(),
      size: String(v.size ?? ''),
      color: String(v.color ?? ''),
      price: Number(v.price ?? 0),
      stock: Number(v.stock ?? 0),
    })),
    price: product.variants[0]?.price ?? 0,
    colors: product.variants.map(v => v.color),
    sizes: product.variants.map(v => v.size),
    averageRating: product.averageRating ?? 0,
    numberOfReviews: product.numberOfReviews ?? 0,
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : null,
  }]);

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully.',
    product: product,
  });
});