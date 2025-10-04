import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/dialog'; // Keep Dialog for the main wrapper
import toast from 'react-hot-toast';
import { productService, CreateProductData, UpdateProductData } from '../services/productService';
import type { Product, ProductsFilterState, ApiResponse } from '../types';
import { useCategories } from '@/hooks/useCategories';

// Import the new modular components
import {
  ProductsHeader,
  ProductsFilterBar,
  ProductsTable,
  ProductFormDialog,
  ProductForm, // Keep ProductForm type for onSubmit
  ProductViewDialog, // Added ProductViewDialog import
} from '../components/products';
import { z } from 'zod';
import { createProductSchema, updateProductSchema, ProductFormValues } from '../schemas/productSchema'; // Import ProductFormValues

export function Products() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // State for add dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [sortBy, setSortBy] = useState<ProductsFilterState['sortBy']>('name-asc');

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const categoryNames = categories?.map(cat => cat.name) || [];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit, sortBy }],
    queryFn: () => productService.getProducts({
      page,
      limit,
      searchTerm: debouncedSearchTerm || undefined,
      categories: selectedCategory === 'All' ? undefined : selectedCategory || undefined,
      sortBy: sortBy,
    }),
    staleTime: 5 * 60 * 1000,
  });

  const products = productsData?.products || [];
  const totalProducts = productsData?.totalProducts || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  // Log product data when it changes
  useEffect(() => {
    console.log("[Products Page] Fetched products:", products);
  }, [products]);

  useEffect(() => {
    if (selectedProduct) {
      console.log("[Products Page] Selected product for view/edit:", selectedProduct);
    }
  }, [selectedProduct]);

  const createProductMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: (response: ApiResponse<Product>) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
      setIsAddDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create product');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) => productService.updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData(['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit, sortBy }]);

      queryClient.setQueryData(
        ['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit, sortBy }],
        (oldData: { products: Product[], totalProducts: number, nextPage: number | null } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            products: oldData.products.map((product) =>
              product._id === id ? { ...product, ...data } : product
            ),
          };
        }
      );
      return { previousProducts };
    },
    onSuccess: (response: ApiResponse<Product>) => {
      toast.success('Product updated successfully');
      setIsEditDialogOpen(false);
      setSelectedProduct(response.product as Product);
    },
    onError: (err: any, variables, context) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
      if (context?.previousProducts) {
        queryClient.setQueryData(
          ['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit, sortBy }],
          context.previousProducts
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleProductFormSubmit = (data: ProductFormValues) => {
    const cleanedVariants = data.variants?.filter(
      (v) => v.size || v.color || v.price > 0 || v.stock > 0
    );

    if (selectedProduct) {
      // This is an update operation
      const updateData: UpdateProductData = {
        name: data.name,
        description: data.description,
        category: data.category,
        imageUrls: data.imageUrls, // Existing image URLs
        isFeatured: data.isFeatured,
        variants: cleanedVariants,
      };
      updateProductMutation.mutate({ id: selectedProduct._id, data: updateData });
    } else {
      // This is a create operation
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('isFeatured', String(data.isFeatured)); // Ensure boolean is stringified for FormData
      
      if (cleanedVariants && cleanedVariants.length > 0) {
        formData.append('variants', JSON.stringify(cleanedVariants)); // Ensure array is stringified for FormData
      }

      // Append new image files
      if (data.imageFiles) {
        Array.from(data.imageFiles).forEach(file => {
          formData.append('images', file);
        });
      }
      createProductMutation.mutate(formData);
    }
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setSelectedProduct(updatedProduct);
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  return (
    <div className="space-y-6">
      <ProductsHeader
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        categories={categories || []} // Pass categories directly
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        onSubmit={handleProductFormSubmit} // This onSubmit now expects ProductFormValues
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
        sortBy={sortBy || 'name-asc'}
      />

      {/* ProductFormDialog for editing remains here */}
      <ProductFormDialog
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        product={selectedProduct}
        categories={categories || []}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        onSubmit={handleProductFormSubmit} // This onSubmit now expects ProductFormValues
        isSubmitting={updateProductMutation.isPending}
        onProductUpdated={handleProductUpdated}
      />

      <ProductViewDialog
        isOpen={isViewDialogOpen}
        setIsOpen={setIsViewDialogOpen}
        product={selectedProduct}
      />
    </div>
  );
}