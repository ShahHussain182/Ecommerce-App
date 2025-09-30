// controllers/products.controller.js
import { Product } from '../Models/Product.model.js';
import catchErrors from '../Utils/catchErrors.js';
import mongoose from 'mongoose';
import { createProductSchema, updateProductSchema } from '../Schemas/productSchema.js';
import { productIndex } from '../Utils/meilisearchClient.js'; // <-- import Meilisearch client

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
    case 'relevance-desc':
      // Relevance is default in Meilisearch when query is present
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
  const productData = createProductSchema.parse(req.body);

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
    imageUrls: product.imageUrls || [], // ADDED
    isFeatured: Boolean(product.isFeatured),
    variants: (product.variants || []).map(v => ({ // ADDED
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
    imageUrls: product.imageUrls || [], // ADDED
    isFeatured: Boolean(product.isFeatured),
    variants: (product.variants || []).map(v => ({ // ADDED
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

  await productIndex.deleteDocument(id.toString());

  res.status(200).json({ success: true, message: 'Product deleted successfully!' });
});