"use client";

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Category, Product } from '@/types'; // Import Product type
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Keep DialogTrigger for the button
} from '@/components/ui/dialog';
import { ProductForm } from './ProductForm'; // Import ProductForm
import { ProductFormValues } from '../../schemas/productSchema'; // Import ProductFormValues
import { Loader2 } from 'lucide-react'; // Import Loader2

interface ProductsHeaderProps {
  categoriesLoading: boolean;
  categoriesError: Error | null;
  categories: Category[]; // Added categories prop
  isAddDialogOpen: boolean; // Pass dialog state
  setIsAddDialogOpen: (isOpen: boolean) => void; // Pass setter for dialog state
  onSubmit: (data: ProductFormValues) => void; // Changed type to ProductFormValues
  isSubmitting: boolean; // Pass submitting state
}

export const ProductsHeader = ({
  categoriesLoading,
  categoriesError,
  categories, // Destructure categories
  isAddDialogOpen,
  setIsAddDialogOpen,
  onSubmit,
  isSubmitting,
}: ProductsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Manage your product inventory and details</p>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            disabled={categoriesLoading || !!categoriesError || categories.length === 0}
            // onClick={() => setIsAddDialogOpen(true)} // Handled by onOpenChange
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product with variants, pricing, and inventory details. At least one image is required.
            </DialogDescription>
          </DialogHeader>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading categories...
            </div>
          ) : categoriesError ? (
            <p className="text-destructive text-center py-8">Error loading categories: {categoriesError.message}</p>
          ) : categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No categories available. Please create categories first.</p>
          ) : (
            <ProductForm
              product={undefined} // No product for creation
              onSubmit={onSubmit}
              onClose={() => setIsAddDialogOpen(false)}
              isSubmitting={isSubmitting}
              categories={categories} // Pass categories here
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};