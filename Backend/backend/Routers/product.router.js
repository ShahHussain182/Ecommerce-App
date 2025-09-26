import express from 'express';
import { getProducts, getProductById, getFeaturedProducts, createProduct, updateProduct, deleteProduct } from '../Controllers/product.controller.js';
import { requireAuth } from '../Middleware/requireAuth.js'; // Import requireAuth
import { requireAdmin } from '../Middleware/requireAdmin.js'; // Import requireAdmin

const productRouter = express.Router();

// Public routes
productRouter.get('/featured', getFeaturedProducts);
productRouter.get('/:id', getProductById);
productRouter.get('/', getProducts);

// Protected routes (Admin only)
// These routes now require both authentication and admin role
productRouter.post('/', requireAuth, requireAdmin, createProduct);
productRouter.put('/:id', requireAuth, requireAdmin, updateProduct);
productRouter.delete('/:id', requireAuth, requireAdmin, deleteProduct);

export default productRouter;