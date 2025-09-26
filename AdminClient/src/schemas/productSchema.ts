import { z } from "zod";

export const variantSchema = z.object({
  _id: z.string().optional(), // Optional for new variants, required for existing ones
  size: z.string().min(1, "Size is required."),
  color: z.string().min(1, "Color is required."),
  price: z.number().min(0, "Price cannot be negative."),
  stock: z.number().int().min(0, "Stock cannot be negative."),
});

// Custom URL validation to allow both absolute and relative paths
const imageUrlSchema = z.string().refine(
  (val) => {
    // Check if it's an absolute URL or a relative path starting with '/'
    return val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/');
  },
  {
    message: "Must be a valid URL or a relative path (e.g., /image.jpg).",
  }
);

export const createProductSchema = z.object({
  name: z.string().min(3, "Product name is required and must be at least 3 characters."),
  description: z.string().min(10, "Product description is required and must be at least 10 characters."),
  category: z.string().min(1, "Category is required."),
  imageUrls: z.array(imageUrlSchema).min(1, "At least one image URL is required."),
  isFeatured: z.boolean().default(false),
  variants: z.array(variantSchema).min(1, "At least one variant is required."),
});

export const updateProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters.").optional(),
  description: z.string().min(10, "Product description must be at least 10 characters.").optional(),
  category: z.string().min(1, "Category is required.").optional(),
  imageUrls: z.array(imageUrlSchema).min(1, "At least one image URL is required.").optional(),
  isFeatured: z.boolean().optional(),
  variants: z.array(variantSchema).min(1, "At least one variant is required.").optional(),
}).partial(); // Allow partial updates