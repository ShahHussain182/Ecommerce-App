"use client";

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productService, UpdateProductData } from '../services/productService';
import type { Product } from '@/types';
import { ProductFormValues } from '../schemas/productSchema';
import { ProductsHeader } from '../components/products/ProductsHeader';
import { ProductsFilterBar } from '../components/products/ProductsFilterBar';
import { ProductsTable } from '../components/products/ProductsTable';
import { ProductViewDialog } from '../components/products/ProductViewDialog';
import { ProductForm } from '../components/products/ProductForm';
import { useCategories } from '@/hooks/useCategories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDebounce } from 'use-debounce';

export function Products() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'averageRating-desc' | 'numberOfReviews-desc' | 'relevance-desc'>('name-asc');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Query for products from API
  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit, sortBy }],
    queryFn: () => productService.getProducts({
      page,
      limit,
      searchTerm: debouncedSearchTerm || undefined,
      categories: selectedCategory || undefined,
      sortBy,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData?.products || []; // Corrected: Access 'products' key
  const totalProducts = productsData?.totalProducts || 0; // Corrected: Access 'totalProducts' key
  const totalPages = Math.ceil(totalProducts / limit);

  // Mutations for CRUD operations
  const createProductMutation = useMutation({
    mutationFn: (formData: FormData) => productService.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully! Images are being processed in the background.');
      setIsAddDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create product');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) => productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
      setIsEditDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
    },
  });

  const handleCreateProduct = (data: ProductFormValues) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('isFeatured', String(data.isFeatured));

    data.imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    if (data.variants && data.variants.length > 0) {
      formData.append('variants', JSON.stringify(data.variants));
    }

    createProductMutation.mutate(formData);
  };

  const handleUpdateProduct = (data: ProductFormValues) => {
    if (selectedProduct) {
      const updateData: UpdateProductData = {
        name: data.name,
        description: data.description,
        category: data.category,
        isFeatured: data.isFeatured,
        variants: data.variants,
        imageUrls: data.imageUrls,
      };
      updateProductMutation.mutate({ id: selectedProduct._id, data: updateData });
    }
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setSelectedProduct(updatedProduct);
    // Invalidate product query to ensure latest data is fetched, especially after image uploads
    queryClient.invalidateQueries({ queryKey: ['product', updatedProduct._id] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  return (
    <div className="space-y-6">
      <ProductsHeader
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        categories={categories || []}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        onSubmit={handleCreateProduct}
        isSubmitting={createProductMutation.isPending}
      />

      <ProductsFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        categories={categories || []}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        setPage={setPage}
      />

      <ProductsTable
        products={products}
        isLoading={isLoading}
        error={error}
        totalProducts={totalProducts}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        onEditProduct={(product) => {
          setSelectedProduct(product);
          setIsEditDialogOpen(true);
        }}
        onViewProduct={(product) => {
          setSelectedProduct(product);
          setIsViewDialogOpen(true);
        }}
        debouncedSearchTerm={debouncedSearchTerm}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
      />

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details, variants, and images.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            product={selectedProduct || undefined}
            onSubmit={handleUpdateProduct}
            onClose={() => setIsEditDialogOpen(false)}
            isSubmitting={updateProductMutation.isPending}
            categories={categories || []}
            onProductUpdated={handleProductUpdated}
          />
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <ProductViewDialog
        isOpen={isViewDialogOpen}
        setIsOpen={setIsViewDialogOpen}
        product={selectedProduct}
      />
    </div>
  );
}