import { z } from "zod";

export const variantSchema = z.object({
  _id: z.string().optional(), // Optional for new variants, required for existing ones
  size: z.string().optional(), // Made optional
  color: z.string().optional(), // Made optional
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
  // For creation, we'll use a separate field for files, and then map them to imageUrls on backend
  // Frontend validation for files will be handled manually in the component
  imageFiles: z.any() // This will hold the FileList or File[] from the input
    .refine((files) => files?.length > 0, "At least one image is required.")
    .refine((files) => files?.length <= 5, "Maximum of 5 images allowed."),
  isFeatured: z.boolean().default(false),
  variants: z.array(variantSchema).optional(), // Made optional
});

export const updateProductSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters.").optional(),
  description: z.string().min(10, "Product description must be at least 10 characters.").optional(),
  category: z.string().min(1, "Category is required.").optional(),
  imageUrls: z.array(imageUrlSchema)
    .min(1, "At least one image URL is required.") // Enforce minimum 1 image for existing products
    .max(5, "Maximum of 5 images allowed.") // Enforce maximum 5 images for updates
    .optional(), // Still optional for updates, as you might not update images every time
  isFeatured: z.boolean().optional(),
  variants: z.array(variantSchema).optional(), // Made optional
}).partial(); // Allow partial updates