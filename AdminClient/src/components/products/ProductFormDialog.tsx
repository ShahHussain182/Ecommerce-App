import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import type { Product, Category } from '@/types';
import { Loader2 } from 'lucide-react';
import { ProductFormValues } from '../../schemas/productSchema'; // Import ProductFormValues

interface ProductFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  product?: Product | null;
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: Error | null;
  onSubmit: (data: ProductFormValues) => void; // Changed type to ProductFormValues
  isSubmitting: boolean;
  onProductUpdated?: (updatedProduct: Product) => void;
}

export const ProductFormDialog = ({
  isOpen,
  setIsOpen,
  product,
  categories,
  categoriesLoading,
  categoriesError,
  onSubmit,
  isSubmitting,
  onProductUpdated,
}: ProductFormDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {product ? 'Update product details, variants, and inventory.' : 'Create a new product with variants, pricing, and inventory details. At least one image is required.'}
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
            product={product || undefined}
            onSubmit={onSubmit}
            onClose={() => setIsOpen(false)}
            isSubmitting={isSubmitting}
            categories={categories || []}
            onProductUpdated={onProductUpdated}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};