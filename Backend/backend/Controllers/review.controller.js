import { Review } from '../Models/Review.model.js';
import { Product } from '../Models/Product.model.js';
import catchErrors from '../Utils/catchErrors.js';
import { createReviewSchema, updateReviewSchema } from '../Schemas/reviewSchema.js';
import mongoose from 'mongoose';

// Helper function to update product's average rating and number of reviews
const updateProductReviewStats = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numberOfReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats.length > 0 ? stats[0].averageRating : 0;
  const numberOfReviews = stats.length > 0 ? stats[0].numberOfReviews : 0;

  await Product.findByIdAndUpdate(
    productId,
    { averageRating, numberOfReviews },
    { new: true, runValidators: true }
  );
};

/**
 * @description Create a new product review.
 * Ensures a user can only review a product once.
 */
export const createReview = catchErrors(async (req, res) => {
  const userId = req.userId; // From requireAuth middleware
  const { productId, rating, title, comment } = createReviewSchema.parse(req.body);

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Check if user has already reviewed this product
  const existingReview = await Review.findOne({ productId, userId });
  if (existingReview) {
    return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });
  }

  const review = await Review.create({
    productId,
    userId,
    rating,
    title,
    comment,
  });

  // Update product's aggregated review stats
  await updateProductReviewStats(productId);

  res.status(201).json({ success: true, message: 'Review submitted successfully!', review });
});

/**
 * @description Get all reviews for a specific product.
 */
export const getProductReviews = catchErrors(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID format.' });
  }

  const reviews = await Review.find({ productId })
    .populate({
      path: 'userId',
      select: 'userName', // Only populate the username of the reviewer
    })
    .sort({ createdAt: -1 }) // Latest reviews first
    .skip(skip)
    .limit(limit);

  const totalReviews = await Review.countDocuments({ productId });

  res.status(200).json({
    success: true,
    reviews,
    totalReviews,
    nextPage: totalReviews > skip + reviews.length ? page + 1 : null,
  });
});

/**
 * @description Update a user's own review.
 */
export const updateReview = catchErrors(async (req, res) => {
  const userId = req.userId;
  const { reviewId } = req.params;
  const updates = updateReviewSchema.parse(req.body);

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ success: false, message: 'Invalid review ID format.' });
  }

  const review = await Review.findOneAndUpdate(
    { _id: reviewId, userId }, // Ensure user owns the review
    updates,
    { new: true, runValidators: true }
  );

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found or you do not have permission to update it.' });
  }

  // Update product's aggregated review stats if rating changed
  if (updates.rating !== undefined) {
    await updateProductReviewStats(review.productId);
  }

  res.status(200).json({ success: true, message: 'Review updated successfully!', review });
});

/**
 * @description Delete a user's own review.
 */
export const deleteReview = catchErrors(async (req, res) => {
  const userId = req.userId;
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ success: false, message: 'Invalid review ID format.' });
  }

  const review = await Review.findOneAndDelete({ _id: reviewId, userId }); // Ensure user owns the review

  if (!review) {
    return res.status(404).json({ success: false, message: 'Review not found or you do not have permission to delete it.' });
  }

  // Update product's aggregated review stats
  await updateProductReviewStats(review.productId);

  res.status(200).json({ success: true, message: 'Review deleted successfully!' });
});