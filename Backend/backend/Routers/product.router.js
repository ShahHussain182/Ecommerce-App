import express from 'express';
import { getProducts, getProductById, getFeaturedProducts, createProduct, updateProduct, deleteProduct } from '../Controllers/product.controller.js';
import { requireAuth } from '../Middleware/requireAuth.js'; // Import requireAuth

const productRouter = express.Router();

// Public routes
productRouter.get('/featured', getFeaturedProducts);
productRouter.get('/:id', getProductById);
productRouter.get('/', getProducts);

// Protected routes (Admin only)
// In a real app, you'd add a specific 'requireAdmin' middleware here
productRouter.post('/', requireAuth, createProduct);
productRouter.put('/:id', requireAuth, updateProduct);
productRouter.delete('/:id', requireAuth, deleteProduct);

export default productRouter;