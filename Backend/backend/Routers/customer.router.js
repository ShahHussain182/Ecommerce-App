import express from 'express';
import { requireAuth } from '../Middleware/requireAuth.js';
import { requireAdmin } from '../Middleware/requireAdmin.js';
import { getAllCustomers } from '../Controllers/customer.controller.js';

const customerRouter = express.Router();

// All customer routes require authentication and admin role
customerRouter.use(requireAuth, requireAdmin);

customerRouter.route('/')
    .get(getAllCustomers); // Get all customers with filters and pagination

export default customerRouter;