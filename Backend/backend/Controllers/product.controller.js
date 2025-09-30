import { Product } from '../Models/Product.model.js';
import catchErrors from '../Utils/catchErrors.js';
import mongoose from 'mongoose';
import { createProductSchema, updateProductSchema } from '../Schemas/productSchema.js';

/**
 * @description Get all products with advanced filtering, sorting, and pagination using Atlas Search.
 */
export const getProducts = catchErrors(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const { searchTerm, categories, priceRange, colors, sizes, sortBy } = req.query;

  const searchPipeline = [];
  const compoundClauses = [];

  // 1. Search Term (Text and Fuzzy)
  if (searchTerm) {
    compoundClauses.push({
      text: {
        query: searchTerm,
        path: ["name", "description"],
        fuzzy: {
          maxEdits: 1,
          prefixLength: 2
        },
        score: { boost: { value: 2 } } // Boost relevance for text matches
      }
    });
  }

  // 2. Category Filter
  if (categories) {
    const categoryArray = categories.split(',');
    compoundClauses.push({
      filter: {
        text: {
          query: categoryArray,
          path: "category",
          score: { boost: { value: 1.5 } } // Boost relevance for category matches
        }
      }
    });
  }

  // 3. Price Range Filter
  if (priceRange) {
    const [min, max] = priceRange.split(',').map(Number);
    if (!isNaN(min) && !isNaN(max)) {
      compoundClauses.push({
        filter: {
          range: {
            path: "variants.price",
            gte: min,
            lte: max
          }
        }
      });
    }
  }

  // 4. Color Filter
  if (colors) {
    const colorArray = colors.split(',');
    compoundClauses.push({
      filter: {
        text: {
          query: colorArray,
          path: "variants.color"
        }
      }
    });
  }

  // 5. Size Filter
  if (sizes) {
    const sizeArray = sizes.split(',');
    compoundClauses.push({
      filter: {
        text: {
          query: sizeArray,
          path: "variants.size"
        }
      }
    });
  }

  // Construct the $search stage if there are any clauses
  if (compoundClauses.length > 0) {
    searchPipeline.push({
      $search: {
        index: "default", // Use your Atlas Search index name here
        compound: {
          must: compoundClauses.filter(clause => clause.text), // Must match search term/category
          filter: compoundClauses.filter(clause => clause.filter), // Filters that don't affect score
        },
        highlight: {
          path: ["name", "description"] // Enable highlighting for search terms
        }
      }
    });
  } else {
    // If no search term or filters, perform a basic match to get all products
    // This ensures the pipeline still works for /products without search
    searchPipeline.push({ $match: {} });
  }

  // Add default values for averageRating and numberOfReviews if they are missing
  searchPipeline.push({
    $addFields: {
      averageRating: { $ifNull: ["$averageRating", 0] },
      numberOfReviews: { $ifNull: ["$numberOfReviews", 0] },
    },
  });

  // Build the sorting stage
  const sortStage = {};
  switch (sortBy) {
    case 'price-desc':
      sortStage['variants.0.price'] = -1;
      break;
    case 'name-asc':
      sortStage.name = 1;
      break;
    case 'name-desc':
      sortStage.name = -1;
      break;
    case 'relevance-desc': // Default sort when searchTerm is present
      if (searchTerm) {
        sortStage.score = { $meta: "searchScore" }; // Sort by Atlas Search relevance score
      } else {
        sortStage['variants.0.price'] = 1; // Fallback if no search term
      }
      break;
    case 'price-asc':
    default:
      sortStage['variants.0.price'] = 1;
      break;
  }

  // Add the sorting, skip, and limit stages
  searchPipeline.push(
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limit }
  );

  // Execute the aggregation pipeline
  const products = await Product.aggregate(searchPipeline);

  // For total count, we need to run a separate aggregation without skip/limit
  const countPipeline = [...searchPipeline];
  countPipeline.pop(); // Remove $limit
  countPipeline.pop(); // Remove $skip
  countPipeline.push({ $count: 'total' });
  const totalResult = await Product.aggregate(countPipeline);
  const totalProducts = totalResult.length > 0 ? totalResult[0].total : 0;

  res.status(200).json({
    success: true,
    products,
    totalProducts,
    nextPage: totalProducts > skip + products.length ? page + 1 : null,
  });
});

/**
 * @description Get autocomplete suggestions using Atlas Search.
 */
export const getAutocompleteSuggestions = catchErrors(async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) { // Require at least 2 characters for suggestions
    return res.status(200).json({ success: true, suggestions: [] });
  }

  const suggestions = await Product.aggregate([
    {
      $search: {
        index: "default", // Use your Atlas Search index name here
        autocomplete: {
          query: query,
          path: "name_autocomplete", // The dedicated autocomplete field
          tokenOrder: "any",
          fuzzy: {
            maxEdits: 1,
            prefixLength: 1
          }
        }
      }
    },
    { $limit: 5 }, // Limit the number of suggestions
    { $project: { _id: 0, name: "$name" } } // Return just the product name
  ]);

  res.status(200).json({ success: true, suggestions: suggestions.map(s => s.name) });
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

/**
 * @description Create a new product (Admin only)
 */
export const createProduct = catchErrors(async (req, res) => {
  const productData = createProductSchema.parse(req.body);

  // If no variants are provided, add a default one
  if (!productData.variants || productData.variants.length === 0) {
    productData.variants = [{
      size: "N/A",
      color: "N/A",
      price: 0, // Default price, can be updated later
      stock: 0, // Default stock, can be updated later
    }];
  }

  const product = await Product.create(productData);

  res.status(201).json({ success: true, message: 'Product created successfully!', product });
});

/**
 * @description Update an existing product (Admin only)
 */
export const updateProduct = catchErrors(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
  }

  const updates = updateProductSchema.parse(req.body);

  // If variants array is explicitly set to empty, add a default one
  if (updates.variants && updates.variants.length === 0) {
    updates.variants = [{
      size: "N/A",
      color: "N/A",
      price: 0, // Default price, can be updated later
      stock: 0, // Default stock, can be updated later
    }];
  }

  const product = await Product.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  res.status(200).json({ success: true, message: 'Product updated successfully!', product });
});

/**
 * @description Delete a product (Admin only)
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

  res.status(200).json({ success: true, message: 'Product deleted successfully!' });
});