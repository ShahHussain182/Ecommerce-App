import type { Cart } from '@/types';

export const calculateCartTotals = (cart: Cart) => {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 0 ? 5.00 : 0; // Example: $5 shipping if cart is not empty
  const taxRate = 0.08; // Example: 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;

  return { subtotal, shippingCost, tax, total };
};