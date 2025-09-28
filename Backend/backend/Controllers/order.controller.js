import { Order } from '../Models/Order.model.js';
import { Cart } from '../Models/Cart.model.js';
import { Product } from '../Models/Product.model.js';
import { Counter } from '../Models/Counter.model.js';
import { User } from '../Models/user.model.js'; // Import User model
import catchErrors from '../Utils/catchErrors.js';
import { createOrderSchema, updateOrderStatusSchema } from '../Schemas/orderSchema.js';
import mongoose from 'mongoose';

// Helper function to get the next sequential value
async function getNextSequenceValue(sequenceName) {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, runValidators: true }
  );
  return sequenceDocument.seq;
}

/**
 * @description Create a new order from the user's cart.
 * This is a critical endpoint that handles stock management and transactional integrity.
 */
export const createOrder = catchErrors(async (req, res) => {
  const userId = req.userId;

  // 1. Validate incoming request body
  const { shippingAddress, paymentMethod } = createOrderSchema.parse(req.body);

  // 2. Fetch the user's current cart
  const cart = await Cart.findOne({ userId });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty.' });
  }

  // --- IMPORTANT: Removed transaction logic for standalone MongoDB compatibility ---
  // For a production-grade application, you should configure MongoDB as a replica set
  // and re-enable transactions to ensure atomicity.

  let totalAmount = 0;
  const orderItems = [];
  const productUpdates = [];

  // 3. Validate stock and prepare order items
  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.productId);
    if (!product) {
      throw new Error(`Product with ID ${cartItem.productId} not found.`);
    }

    const variant = product.variants.id(cartItem.variantId);
    if (!variant) {
      throw new Error(`Product variant with ID ${cartItem.variantId} not found for product ${product.name}.`);
    }

    if (variant.stock < cartItem.quantity) {
      throw new Error(`Not enough stock for ${product.name} (${variant.size} / ${variant.color}). Available: ${variant.stock}, Requested: ${cartItem.quantity}.`);
    }

    // Prepare order item snapshot
    orderItems.push({
      productId: cartItem.productId,
      variantId: cartItem.variantId,
      quantity: cartItem.quantity,
      nameAtTime: cartItem.nameAtTime,
      imageAtTime: cartItem.imageAtTime,
      priceAtTime: cartItem.priceAtTime,
      sizeAtTime: cartItem.sizeAtTime,
      colorAtTime: cartItem.colorAtTime,
    });

    totalAmount += cartItem.priceAtTime * cartItem.quantity;

    // Prepare stock decrement
    productUpdates.push({
      updateOne: {
        filter: { '_id': product._id, 'variants._id': variant._id },
        update: { $inc: { 'variants.$.stock': -cartItem.quantity } },
      },
    });
  }

  // 4. Decrement product stock
  if (productUpdates.length > 0) {
    // Note: Without a session, this is not atomic with order creation.
    // If the server crashes between this and order.save(), inconsistencies can occur.
    await Product.bulkWrite(productUpdates);
  }

  // 5. Generate sequential order number
  const orderNumber = await getNextSequenceValue('orderId');

  // 6. Create the new order
  const order = new Order({
    userId,
    orderNumber, // Assign the generated sequential number
    items: orderItems,
    shippingAddress,
    paymentMethod,
    totalAmount,
    status: 'Pending', // Initial status
  });
  await order.save();

  // 7. Clear the user's cart
  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, message: 'Order placed successfully!', order });
});

/**
 * @description Get all orders for the admin panel with pagination, search, and sorting.
 */
export const getAllOrders = catchErrors(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { searchTerm, statusFilter, sortBy, sortOrder } = req.query;

  const matchStage = {};

  // Apply status filter
  if (statusFilter && statusFilter !== 'All') {
    matchStage.status = statusFilter;
  }

  // Apply search term (by order number, customer name, or product name in items)
  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive search
    matchStage.$or = [
      { orderNumber: parseInt(searchTerm) || 0 }, // Search by order number if it's a number
      { 'shippingAddress.fullName': searchRegex },
      { 'items.nameAtTime': searchRegex },
    ];
  }

  const sortStage = {};
  if (sortBy === 'date') {
    sortStage.createdAt = sortOrder === 'asc' ? 1 : -1;
  } else if (sortBy === 'total') {
    sortStage.totalAmount = sortOrder === 'asc' ? 1 : -1;
  } else {
    sortStage.createdAt = -1; // Default sort
  }

  const orders = await Order.find(matchStage)
    .populate({
      path: 'userId',
      select: 'userName email' // Populate user details
    })
    .sort(sortStage)
    .skip(skip)
    .limit(limit);

  const totalOrders = await Order.countDocuments(matchStage);

  res.status(200).json({
    success: true,
    data: orders,
    totalOrders,
    nextPage: totalOrders > skip + orders.length ? page + 1 : null,
  });
});

/**
 * @description Get all orders for the authenticated user.
 */
export const getUserOrders = catchErrors(async (req, res) => {
  const userId = req.userId;
  const orders = await Order.find({ userId })
    .populate({
      path: 'items.productId',
      select: 'name imageUrls' // Populate minimal product details for display
    })
    .sort({ createdAt: -1 }); // Latest orders first

  res.status(200).json({ success: true, orders });
});

/**
 * @description Get a single order by its ID for the authenticated user.
 */
export const getOrderById = catchErrors(async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID format.' });
  }

  const order = await Order.findOne({ _id: id, userId })
    .populate({
      path: 'items.productId',
      select: 'name imageUrls'
    });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found or you do not have permission to view it.' });
  }

  res.status(200).json({ success: true, order });
});

/**
 * @description Update the status of an order (Admin only, or specific transitions).
 * For a production app, this would have robust authorization checks.
 */
export const updateOrderStatus = catchErrors(async (req, res) => {
  // In a real app, you'd check if the user is an admin or has permission
  // For now, we'll assume the authenticated user can update their own order status (e.g., cancel)
  const userId = req.userId;
  const { id } = req.params;
  const { status } = updateOrderStatusSchema.parse(req.body);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID format.' });
  }

  const order = await Order.findOneAndUpdate(
    { _id: id, userId }, // Ensure user owns the order
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found or you do not have permission to update it.' });
  }

  res.status(200).json({ success: true, message: 'Order status updated successfully.', order });
});

/**
 * @description Get order metrics for the admin dashboard.
 */
export const getOrderMetrics = catchErrors(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenueResult = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } }, // Only count non-cancelled orders for revenue
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ]);
  const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

  const totalCustomers = await User.countDocuments({ role: 'user' });
  const totalProducts = await Product.countDocuments();

  // Simplified growth metrics for now
  const revenueGrowth = 12.5; // Placeholder
  const ordersGrowth = 8.2; // Placeholder
  const customersGrowth = -2.3; // Placeholder
  const productsGrowth = 5.1; // Placeholder

  const statusCounts = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('userId', 'userName');

  res.status(200).json({
    success: true,
    totalOrders,
    totalRevenue,
    revenueGrowth,
    ordersGrowth,
    totalCustomers,
    customersGrowth,
    totalProducts,
    productsGrowth,
    statusCounts,
    recentOrders
  });
});