import { Product } from '../Models/Product.model.js';
import catchErrors from '../Utils/catchErrors.js';
import mongoose from 'mongoose';

/**
 * @description Get all products with advanced filtering, sorting, and pagination
 * This function uses a MongoDB aggregation pipeline for powerful and efficient querying.
 */
export const getProducts = catchErrors(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  // Build the initial matching stage of the aggregation pipeline
  const matchStage = {};

  // 1. Text Search Filter
  if (req.query.searchTerm) {
    matchStage.$text = { $search: req.query.searchTerm };
  }

  // 2. Category Filter
  if (req.query.categories) {
    const categories = req.query.categories.split(',');
    matchStage.category = { $in: categories };
  }

  // 3. Variant-level Filters (Price, Color, Size)
  const elemMatchFilters = {};
  
  // Price Range Filter
  if (req.query.priceRange) {
    const [min, max] = req.query.priceRange.split(',').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      elemMatchFilters.price = { $gte: min, $lte: max };
    }
  }
  
  // Color Filter
  if (req.query.colors) {
    elemMatchFilters.color = { $in: req.query.colors.split(',') };
  }

  // Size Filter
  if (req.query.sizes) {
    elemMatchFilters.size = { $in: req.query.sizes.split(',') };
  }

  if (Object.keys(elemMatchFilters).length > 0) {
    matchStage.variants = { $elemMatch: elemMatchFilters };
  }

  // Build the sorting stage
  const sortStage = {};
  const sortBy = req.query.sortBy || 'price-asc';
  switch (sortBy) {
    case 'price-desc':
      sortStage['variants.0.price'] = -1; // Sort by the first variant's price
      break;
    case 'name-asc':
      sortStage.name = 1;
      break;
    case 'name-desc':
      sortStage.name = -1;
      break;
    case 'price-asc':
    default:
      sortStage['variants.0.price'] = 1; // Default sort
      break;
  }

  // Aggregation Pipeline
  const pipeline = [
    { $match: matchStage },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limit },
  ];

  // Execute queries in parallel for efficiency
  const [products, totalProducts] = await Promise.all([
    Product.aggregate(pipeline),
    Product.countDocuments(matchStage)
  ]);

  res.status(200).json({
    success: true,
    products,
    totalProducts,
    nextPage: totalProducts > skip + products.length ? page + 1 : null,
  });
});

/**
 * @description Get a single product by its ID
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
 * @description Get featured products
 */
export const getFeaturedProducts = catchErrors(async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(4);
  res.status(200).json({ success: true, products });
});