import express from 'express';
import { getProducts, getProductById, getFeaturedProducts } from '../Controllers/product.controller.js';

const productRouter = express.Router();

// Note: More specific routes should be defined before more general ones.
// '/featured' comes before '/:id' to avoid 'featured' being treated as an ID.
productRouter.get('/featured', getFeaturedProducts);
productRouter.get('/:id', getProductById);
productRouter.get('/', getProducts);

export default productRouter;