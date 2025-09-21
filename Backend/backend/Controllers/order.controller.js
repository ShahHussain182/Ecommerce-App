import { Order } from '../Models/Order.model.js';
import { Cart } from '../Models/Cart.model.js';
import { Product } from '../Models/Product.model.js';
import { Counter } from '../Models/Counter.model.js'; // Import Counter model
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