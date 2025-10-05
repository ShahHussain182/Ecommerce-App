import { Product } from '../Models/Product.model.js';
import catchErrors from '../Utils/catchErrors.js';
import mongoose from 'mongoose';
import { createProductSchema, updateProductSchema } from '../Schemas/productSchema.js';
import { productIndex } from '../Utils/meilisearchClient.js';
import { uploadFileToS3 } from '../Utils/s3Upload.js';
import {logger} from '../Utils/logger.js';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../Utils/s3Client.js";
import { imageProcessingQueue } from '../Queues/imageProcessing.queue.js'; // Import the queue

const S3_BUCKET_NAME = process.env.MINIO_BUCKET_NAME || "e-store-images";
const MINIO_URL = process.env.MINIO_URL || "http://localhost:9000";
const MAX_IMAGES = 5;

/**
 * @description Get all products with advanced filtering, sorting, and pagination using Meilisearch.
 */
export const getProducts = catchErrors(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;

  const { searchTerm, categories, priceRange, colors, sizes, sortBy } = req.query;

  // Build Meilisearch filter string
  const filters = [];

  // Only show products that have completed image processing
  filters.push(`imageProcessingStatus = "completed"`);

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
    case 'averageRating-desc':
      sort = ['averageRating:desc'];
      break;
    case 'numberOfReviews-desc':
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
    attributesToRetrieve: [ // Ensure imageRenditions is included here
      '_id', 'name', 'description', 'category', 'imageUrls', 'imageRenditions',
      'imageProcessingStatus', 'isFeatured', 'variants', 'averageRating', 'numberOfReviews',
      'price', 'colors', 'sizes', 'createdAt', 'updatedAt'
    ],
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
    filter: 'imageProcessingStatus = "completed"', // Only suggest processed products
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
  const products = await Product.find({ isFeatured: true, imageProcessingStatus: 'completed' }).limit(4);
  res.status(200).json({ success: true, products });
});

/**
 * @description Create a new product (Admin only) — also index in Meilisearch.
 */
export const createProduct = catchErrors(async (req, res) => {
  logger.debug(`[createProduct] Raw req.body: ${JSON.stringify(req.body)}`);
  logger.debug(`[createProduct] Raw req.files: ${JSON.stringify(req.files?.map(f => f.originalname))}`);

  const parsedBody = {
    ...req.body,
    isFeatured: req.body.isFeatured === 'true',
    variants: req.body.variants ? JSON.parse(req.body.variants) : undefined,
  };
  logger.debug(`[createProduct] Parsed body before Zod: ${JSON.stringify(parsedBody)}`);

  const uploadedOriginalImageUrls = [];
  const originalS3Keys = [];

  if (req.files && req.files.length > 0) {
    if (req.files.length > MAX_IMAGES) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot upload more than ${MAX_IMAGES} images. You are trying to add ${req.files.length}.` 
      });
    }
    for (const file of req.files) {
      try {
        const s3Key = `products/originals/${mongoose.Types.ObjectId()}-${Date.now()}.${file.mimetype.split('/')[1]}`;
        const url = await uploadFileToS3(file.buffer, file.mimetype, s3Key); 
        uploadedOriginalImageUrls.push(url);
        originalS3Keys.push(s3Key);
      } catch (error) {
        logger.error(`Failed to upload file ${file.originalname} during product creation: ${error.message}`);
        return res.status(500).json({ success: false, message: `Failed to upload image: ${error.message}` });
      }
    }
  } else {
    return res.status(400).json({ success: false, message: 'At least one image is required.' });
  }

  const productDataForValidation = {
    ...parsedBody,
    imageUrls: uploadedOriginalImageUrls, // Store original URLs initially
    imageProcessingStatus: 'pending', // Mark as pending
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

  // Add jobs to the image processing queue
  for (let i = 0; i < uploadedOriginalImageUrls.length; i++) {
    await imageProcessingQueue.add(
      `process-image-${product._id}-${i}`,
      {
        productId: product._id.toString(),
        originalS3Key: originalS3Keys[i],
        imageIndex: i,
      }
    );
  }

  // Sync with Meilisearch (initial entry, will be updated by worker)
  await productIndex.addDocuments([{
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrls: product.imageUrls || [],
    imageRenditions: product.imageRenditions || [], // Include imageRenditions here
    imageProcessingStatus: product.imageProcessingStatus, // Include status
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
  

  res.status(201).json({ success: true, message: 'Product created successfully! Images are being processed.', product });
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
    imageRenditions: product.imageRenditions || [], // Include imageRenditions here
    imageProcessingStatus: product.imageProcessingStatus, // Include status
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

  // Delete all associated image renditions from S3
  if (product.imageRenditions && product.imageRenditions.length > 0) {
    const deletePromises = product.imageRenditions.flatMap(renditionSet => {
      const keysToDelete = [];
      if (renditionSet.original) keysToDelete.push(renditionSet.original.replace(`${MINIO_URL}/${S3_BUCKET_NAME}/`, ''));
      if (renditionSet.medium) keysToDelete.push(renditionSet.medium.replace(`${MINIO_URL}/${S3_BUCKET_NAME}/`, ''));
      if (renditionSet.thumbnail) keysToDelete.push(renditionSet.thumbnail.replace(`${MINIO_URL}/${S3_BUCKET_NAME}/`, ''));
      if (renditionSet.webp) keysToDelete.push(renditionSet.webp.replace(`${MINIO_URL}/${S3_BUCKET_NAME}/`, ''));
      if (renditionSet.avif) keysToDelete.push(renditionSet.avif.replace(`${MINIO_URL}/${S3_BUCKET_NAME}/`, ''));
      
      return keysToDelete.map(async (s3Key) => {
        try {
          await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: s3Key }));
          logger.info(`Deleted S3 object: ${s3Key}`);
        } catch (s3Error) {
          logger.error(`Failed to delete S3 object ${s3Key}: ${s3Error.message}`);
        }
      });
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
  const { id } = req.params;

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

  const currentImageCount = product.imageUrls ? product.imageUrls.length : 0;
  if (currentImageCount + req.files.length > MAX_IMAGES) {
    return res.status(400).json({ 
      success: false, 
      message: `Cannot upload more than ${MAX_IMAGES} images. You currently have ${currentImageCount} and are trying to add ${req.files.length}.` 
    });
  }

  const uploadedOriginalImageUrls = [];
  const originalS3Keys = [];
  const newImageIndices = [];

  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    try {
      const s3Key = `products/originals/${mongoose.Types.ObjectId()}-${Date.now()}.${file.mimetype.split('/')[1]}`;
      const url = await uploadFileToS3(file.buffer, file.mimetype, s3Key); 
      uploadedOriginalImageUrls.push(url);
      originalS3Keys.push(s3Key);
      newImageIndices.push(currentImageCount + i); // Track index for new images
    } catch (error) {
      logger.error(`Failed to upload file ${file.originalname} for product ${id}: ${error.message}`);
    }
  }

  if (uploadedOriginalImageUrls.length === 0) {
    return res.status(500).json({ success: false, message: 'No images were successfully uploaded.' });
  }

  // Append new original URLs to existing ones
  product.imageUrls = [...(product.imageUrls || []), ...uploadedOriginalImageUrls];
  // Initialize new image renditions as empty for now
  product.imageRenditions = [...(product.imageRenditions || []), ...Array(uploadedOriginalImageUrls.length).fill({})];
  product.imageProcessingStatus = 'pending'; // Mark as pending as new images need processing
  await product.save();

  // Add jobs to the image processing queue for new images
  for (let i = 0; i < uploadedOriginalImageUrls.length; i++) {
    await imageProcessingQueue.add(
      `process-image-${product._id}-${newImageIndices[i]}`,
      {
        productId: product._id.toString(),
        originalS3Key: originalS3Keys[i],
        imageIndex: newImageIndices[i],
      }
    );
  }

  // Update Meilisearch (will be updated again by worker when processing completes)
  await productIndex.addDocuments([{
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrls: product.imageUrls,
    imageRenditions: product.imageRenditions, // Include imageRenditions here
    imageProcessingStatus: product.imageProcessingStatus,
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
    message: `${uploadedOriginalImageUrls.length} image(s) uploaded. Processing in background.`,
    product: product,
  });
});

/**
 * @description Delete a specific product image from S3 and update the product document.
 */
export const deleteProductImage = catchErrors(async (req, res) => {
  const { id } = req.params;
  const { imageUrl } = req.query; // This is the URL of the *main* image (e.g., medium.webp)

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

  const imageIndex = product.imageUrls.indexOf(imageUrl);
  if (imageIndex === -1) {
    return res.status(404).json({ success: false, message: 'Image not found in product\'s main image list.' });
  }

  if (product.imageUrls.length <= 1) {
    return res.status(400).json({ success: false, message: 'A product must have at least one image.' });
  }

  // Get the renditions associated with this image
  const renditionsToDelete = product.imageRenditions[imageIndex];

  // Delete all renditions from S3
  if (renditionsToDelete) {
    const deletePromises = [];
    for (const key in renditionsToDelete) {
      if (renditionsToDelete[key]) {
        const s3Key = renditionsToDelete[key].replace(`${MINIO_URL}/${S3_BUCKET_NAME}/`, '');
        deletePromises.push(
          s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET_NAME, Key: s3Key }))
            .then(() => logger.info(`Deleted S3 object: ${s3Key}`))
            .catch(s3Error => logger.error(`Failed to delete S3 object ${s3Key}: ${s3Error.message}`))
        );
      }
    }
    await Promise.all(deletePromises);
  }

  // Remove image URL and renditions from product document
  product.imageUrls.splice(imageIndex, 1);
  product.imageRenditions.splice(imageIndex, 1);
  
  // If there are no more images, set status to pending (or handle as error)
  if (product.imageUrls.length === 0) {
    product.imageProcessingStatus = 'pending'; // Or 'failed' depending on desired behavior
  } else {
    // Re-evaluate processing status if needed, e.g., if all remaining are completed
    const allRemainingCompleted = product.imageRenditions.every(r => r.medium);
    if (allRemainingCompleted) {
      product.imageProcessingStatus = 'completed';
    } else {
      product.imageProcessingStatus = 'pending';
    }
  }

  await product.save();

  // Update Meilisearch
  await productIndex.addDocuments([{
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrls: product.imageUrls,
    imageRenditions: product.imageRenditions, // Include imageRenditions here
    imageProcessingStatus: product.imageProcessingStatus,
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