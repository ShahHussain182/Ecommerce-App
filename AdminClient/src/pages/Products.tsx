import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Edit, Trash2, Eye, Star, Package, Loader2, ChevronLeft, ChevronRight, MoreHorizontal, Check, X, Image as ImageIcon, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService, CreateProductData, UpdateProductData } from '../services/productService'; // Corrected import path
import type { Product, ProductVariant, Category, ProductsFilterState, ApiResponse } from '@/types'; 
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, updateProductSchema } from '../schemas/productSchema'; // Corrected import path
import { z } from 'zod';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCategories } from '@/hooks/useCategories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Type for the form data, combining create and update schemas
// For creation, imageFiles will be used. For update, imageUrls will be used.
type ProductFormValues = z.infer<typeof createProductSchema> & z.infer<typeof updateProductSchema>;

const getTotalStock = (variants?: ProductVariant[]) => {
  return variants?.reduce((total, variant) => total + variant.stock, 0) || 0;
};

const getMinPrice = (variants?: ProductVariant[]) => {
  return variants && variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0;
};

const getStockStatus = (totalStock: number) => {
  if (totalStock === 0) return { status: 'Out of Stock', variant: 'destructive' as const };
  if (totalStock < 10) return { status: 'Low Stock', variant: 'secondary' as const };
  return { status: 'In Stock', variant: 'default' as const };
};

const MAX_IMAGES = 5; // Defined MAX_IMAGES here

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductData | UpdateProductData | FormData) => void; // Updated type to accept FormData or UpdateProductData
  onClose: () => void;
  isSubmitting: boolean;
  categories: Category[];
  onProductUpdated?: (updatedProduct: Product) => void; // Callback for when product is updated (e.g., after image upload)
}

const ProductForm = ({ product, onSubmit, onClose, isSubmitting, categories, onProductUpdated }: ProductFormProps) => {
  const queryClient = useQueryClient();
  // Use different schemas based on whether we are creating or editing
  const formSchema = product ? updateProductSchema : createProductSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    getValues,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || (categories.length > 0 ? categories[0].name : ''),
      imageUrls: product?.imageUrls || [], // For existing images
      imageFiles: undefined, // For new files to upload
      isFeatured: product?.isFeatured || false,
      variants: product?.variants && product.variants.length > 0
        ? product.variants
        : [{ size: '', color: '', price: 0, stock: 0 }],
    },
  });

  const existingImageUrls = watch('imageUrls'); // Watch the existing S3 image URLs
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // For newly selected files
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false); // New state for image deletion

  // Effect to reset form and image states when product prop changes
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        category: product.category,
        imageUrls: product.imageUrls || [],
        imageFiles: undefined, // Clear file input
        isFeatured: product.isFeatured,
        variants: product.variants && product.variants.length > 0 ? product.variants : [{ size: '', color: '', price: 0, stock: 0 }],
      });
      setSelectedFiles([]); // Clear selected files when editing a new product
    } else {
      reset({
        name: '',
        description: '',
        category: categories.length > 0 ? categories[0].name : '',
        imageUrls: [],
        imageFiles: undefined,
        isFeatured: false,
        variants: [{ size: '', color: '', price: 0, stock: 0 }],
      });
      setSelectedFiles([]);
    }
  }, [product, reset, categories]);

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  // Handle file selection for new uploads
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const currentTotalImages = (existingImageUrls?.length || 0) + selectedFiles.length;
      const newTotalImages = currentTotalImages + filesArray.length;

      if (newTotalImages > MAX_IMAGES) {
        toast.error(`You can only have a maximum of ${MAX_IMAGES} images. You are trying to add ${filesArray.length} more, which would exceed the limit.`);
        return;
      }

      setSelectedFiles(prev => [...prev, ...filesArray]);
      // Also update the form's imageFiles field for validation during creation
      setValue('imageFiles', [...selectedFiles, ...filesArray], { shouldValidate: true });
      // Clear the input value so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove a newly selected local file (not yet uploaded to S3)
  const handleRemoveSelectedFile = (indexToRemove: number) => {
    setSelectedFiles(prev => {
      const updatedFiles = prev.filter((_, index) => index !== indexToRemove);
      setValue('imageFiles', updatedFiles, { shouldValidate: true }); // Update form field for validation
      return updatedFiles;
    });
  };

  // Mutation for uploading images (used for adding images to an existing product)
  const uploadImagesMutation = useMutation({
    mutationFn: ({ productId, files }: { productId: string; files: File[] }) =>
      productService.uploadProductImages(productId, files),
    onSuccess: (response: ApiResponse<Product>) => {
      toast.success(response.message);
      // Update the form's imageUrls with the new list from the backend
      setValue('imageUrls', response.product?.imageUrls || [], { shouldDirty: true }); // Use response.product
      setSelectedFiles([]); // Clear selected files after successful upload
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Invalidate products query
      onProductUpdated?.(response.product as Product); // Notify parent of product update
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload images to S3.');
    },
    onSettled: () => {
      setIsUploadingImages(false);
    },
  });

  const handleUploadNewImages = () => {
    if (!product?._id) {
      toast.error("Product must be created before uploading images.");
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please select images to upload.");
      return;
    }
    setIsUploadingImages(true);
    uploadImagesMutation.mutate({ productId: product._id, files: selectedFiles });
  };

  // Mutation for deleting an individual image
  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageUrl }: { productId: string; imageUrl: string }) =>
      productService.deleteProductImage(productId, imageUrl),
    onSuccess: (response: ApiResponse<Product>) => {
      toast.success(response.message);
      setValue('imageUrls', response.product?.imageUrls || [], { shouldDirty: true }); // Use response.product
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onProductUpdated?.(response.product as Product);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete image.');
    },
    onSettled: () => {
      setIsDeletingImage(false);
    },
  });

  const handleRemoveExistingImage = (imageUrlToRemove: string) => {
    if (!product?._id) {
      toast.error("Cannot delete image from a product that hasn't been created.");
      return;
    }
    if ((existingImageUrls?.length || 0) + selectedFiles.length <= 1) {
      toast.error("A product must have at least one image.");
      return;
    }
    setIsDeletingImage(true);
    deleteImageMutation.mutate({ productId: product._id, imageUrl: imageUrlToRemove });
  };

  const handleFormSubmit = async (data: ProductFormValues) => {
    const cleanedVariants = data.variants?.filter(
      (v) => v.size || v.color || v.price > 0 || v.stock > 0
    );

    if (product) {
      // Update existing product
      // For updates, we don't send imageFiles in the main product update payload
      // Image updates are handled by separate upload/delete mutations
      const { imageFiles, ...rest } = data; // Exclude imageFiles from the update payload
      onSubmit({ ...rest, variants: cleanedVariants, imageUrls: existingImageUrls } as UpdateProductData);
    } else {
      // Create new product
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('isFeatured', String(data.isFeatured));
      
      // Append variants as a JSON string
      if (cleanedVariants && cleanedVariants.length > 0) {
        formData.append('variants', JSON.stringify(cleanedVariants));
      }

      // Append image files
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      onSubmit(formData); // Call the onSubmit prop with FormData
    }
  };

  const allImagePreviews = [
    ...(existingImageUrls || []),
    ...selectedFiles.map(file => URL.createObjectURL(file))
  ];

  const totalImagesCount = (existingImageUrls?.length || 0) + selectedFiles.length;
  const canAddMoreImages = totalImagesCount < MAX_IMAGES;
  const canDeleteImages = totalImagesCount > 1;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            {...register('name')}
            disabled={isSubmitting || isUploadingImages || isDeletingImage}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...register('category')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={isSubmitting || isUploadingImages || isDeletingImage || categories.length === 0}
          >
            {categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))
            )}
          </select>
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          {...register('description')}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
          disabled={isSubmitting || isUploadingImages || isDeletingImage}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      {/* Image Upload Section */}
      <div className="space-y-3 border p-4 rounded-md">
        <div className="flex items-center justify-between">
          <Label>Product Images ({totalImagesCount}/{MAX_IMAGES})</Label>
          <div className="flex space-x-2">
            <Button type="button" onClick={() => fileInputRef.current?.click()} size="sm" disabled={isSubmitting || isUploadingImages || isDeletingImage || !canAddMoreImages}>
              <ImageIcon className="mr-2 h-3 w-3" />
              Select Files
            </Button>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={isSubmitting || isUploadingImages || isDeletingImage || !canAddMoreImages}
            />
            {product && selectedFiles.length > 0 && (
              <Button type="button" onClick={handleUploadNewImages} size="sm" disabled={isSubmitting || isUploadingImages || isDeletingImage || selectedFiles.length === 0}>
                {isUploadingImages ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-3 w-3" />
                )}
                Upload ({selectedFiles.length})
              </Button>
            )}
          </div>
        </div>
        {totalImagesCount === 0 && (
          <p className="text-sm text-destructive text-center py-2">
            At least one image is required.
          </p>
        )}
        {errors.imageFiles?.message && <p className="text-sm text-destructive">{errors.imageFiles.message}</p>}
        {errors.imageUrls?.message && <p className="text-sm text-destructive">{errors.imageUrls.message}</p>}

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {allImagePreviews.map((url, index) => (
            <div key={url} className="relative w-24 h-24 rounded-md overflow-hidden border">
              <img src={url} alt={`Product preview ${index}`} className="w-full h-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={() => {
                  // Determine if it's an existing S3 URL or a new local file
                  if (index < (existingImageUrls?.length || 0)) {
                    handleRemoveExistingImage(url); // Pass the URL for deletion
                  } else {
                    handleRemoveSelectedFile(index - (existingImageUrls?.length || 0));
                  }
                }}
                disabled={isSubmitting || isUploadingImages || isDeletingImage || !canDeleteImages}
              >
                {isDeletingImage && index < (existingImageUrls?.length || 0) ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
          {allImagePreviews.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-4">
              No images selected or uploaded.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Product Variants (Optional)</Label>
          <Button type="button" onClick={() => appendVariant({ size: '', color: '', price: 0, stock: 0 })} size="sm" disabled={isSubmitting || isUploadingImages || isDeletingImage}>
            <Plus className="mr-2 h-3 w-3" />
            Add Variant
          </Button>
        </div>

        {variantFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-5 gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Size (Optional)</Label>
              <Input
                {...register(`variants.${index}.size`)}
                placeholder="S, M, L"
                disabled={isSubmitting || isUploadingImages || isDeletingImage}
              />
              {errors.variants?.[index]?.size && <p className="text-sm text-destructive">{errors.variants[index]?.size?.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Color (Optional)</Label>
              <Input
                {...register(`variants.${index}.color`)}
                placeholder="Black, White"
                disabled={isSubmitting || isUploadingImages || isDeletingImage}
              />
              {errors.variants?.[index]?.color && <p className="text-sm text-destructive">{errors.variants[index]?.color?.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Price</Label>
              <Input
                type="number"
                {...register(`variants.${index}.price`, { valueAsNumber: true })}
                step="0.01"
                min="0"
                disabled={isSubmitting || isUploadingImages || isDeletingImage}
              />
              {errors.variants?.[index]?.price && <p className="text-sm text-destructive">{errors.variants[index]?.price?.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stock</Label>
              <Input
                type="number"
                {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                min="0"
                disabled={isSubmitting || isUploadingImages || isDeletingImage}
              />
              {errors.variants?.[index]?.stock && <p className="text-sm text-destructive">{errors.variants[index]?.stock?.message}</p>}
            </div>
            <Button
              type="button"
              onClick={() => removeVariant(index)}
              variant="ghost"
              size="icon"
              disabled={variantFields.length === 1 || isSubmitting || isUploadingImages || isDeletingImage}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {errors.variants?.root && <p className="text-sm text-destructive">{errors.variants.root.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          {...register('isFeatured')}
          className="h-4 w-4"
          disabled={isSubmitting || isUploadingImages || isDeletingImage}
        />
        <Label htmlFor="featured">Featured Product</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isUploadingImages || isDeletingImage}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploadingImages || isDeletingImage}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Update' : 'Create'} Product
        </Button>
      </DialogFooter>
    </form>
  );
};

export function Products() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  const createProductMutation = useMutation({
    mutationFn: productService.createProduct, // Now expects FormData
    onSuccess: (response: ApiResponse<Product>) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
      setIsAddDialogOpen(false);
      // No need to open edit dialog automatically, as images are part of creation now
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
      setSelectedProduct(response.product as Product); // Update selected product with latest data
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

  const deleteProductMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onMutate: async (productIdToDelete: string) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData(['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit, sortBy }]);

      queryClient.setQueryData(
        ['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit, sortBy }],
        (oldData: { products: Product[], totalProducts: number, nextPage: number | null } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            products: oldData.products.filter((product) => product._id !== productIdToDelete),
            totalProducts: oldData.totalProducts - 1,
          };
        }
      );
      toast.loading('Deleting product...', { id: productIdToDelete });
      return { previousProducts };
    },
    onSuccess: (data: ApiResponse<null>, productIdToDelete: string) => {
      toast.success('Product deleted successfully', { id: productIdToDelete });
    },
    onError: (err: any, productIdToDelete: string, context) => {
      toast.error(err.response?.data?.message || 'Failed to delete product', { id: productIdToDelete });
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

  const handleToggleFeatured = async (product: Product) => {
    updateProductMutation.mutate({
      id: product._id,
      data: { isFeatured: !product.isFeatured },
    });
  };

  const handleSortChange = (value: ProductsFilterState['sortBy']) => {
    setSortBy(value);
    setPage(1);
  };

  const handleProductFormUpdate = (updatedProduct: Product) => {
    setSelectedProduct(updatedProduct); // Keep selectedProduct up-to-date
    queryClient.invalidateQueries({ queryKey: ['products'] }); // Ensure table reflects changes
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory and details</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={categoriesLoading || !!categoriesError || categoryNames.length === 0}
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
            ) : categoryNames.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No categories available. Please create categories first.</p>
            ) : (
              <ProductForm
                onSubmit={(data) => createProductMutation.mutate(data as FormData)} // Cast to FormData
                onClose={() => setIsAddDialogOpen(false)}
                isSubmitting={createProductMutation.isPending}
                categories={categories || []}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4 flex-wrap gap-y-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('');
              setPage(1);
            }}
          >
            All
          </Button>
          {categoriesLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : categoriesError ? (
            <span className="text-destructive text-sm">Error loading categories</span>
          ) : (
            categories?.map((category) => (
              <Button
                key={category._id}
                variant={selectedCategory === category.name ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category.name);
                  setPage(1);
                }}
              >
                {category.name}
              </Button>
            ))
          )}
        </div>

        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
            <SelectItem value="averageRating-desc">Top Rated</SelectItem>
            <SelectItem value="numberOfReviews-desc">Most Reviewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({totalProducts})</CardTitle>
          <CardDescription>
            View and manage all your products in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Product</TableHead><TableHead className="min-w-[100px]">Category</TableHead><TableHead className="min-w-[100px]">Price</TableHead><TableHead className="min-w-[80px]">Stock</TableHead><TableHead className="min-w-[100px]">Rating</TableHead><TableHead className="min-w-[120px]">Status</TableHead><TableHead className="min-w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7}>
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                          <h3 className="mt-4 text-lg font-semibold">Loading products...</h3>
                        </div>
                      </div>
                    </TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={7}>
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Package className="mx-auto h-12 w-12 text-destructive" />
                          <h3 className="mt-4 text-lg font-semibold">Error loading products</h3>
                          <p className="text-muted-foreground mb-4">There was an issue fetching the products.</p>
                          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}>Try Again</Button>
                        </div>
                      </div>
                    </TableCell></TableRow>
                ) : products.length === 0 ? (
                  <TableRow><TableCell colSpan={7}>
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                        </div>
                      </div>
                    </TableCell></TableRow>
                ) : (
                  products.map((product) => {
                    const totalStock = getTotalStock(product.variants);
                    const minPrice = getMinPrice(product.variants);
                    const stockStatus = getStockStatus(totalStock);

                    return (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.imageUrls[0] || '/placeholder.svg'}
                              alt={product.name}
                              className="h-8 w-8 rounded-md object-cover"
                            />
                            <div className="font-medium">{product.name}</div>
                          </div>
                        </TableCell><TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell><TableCell>
                          <div className="font-medium">
                            {product.variants && product.variants.length > 0 ? `$${minPrice.toFixed(2)}` : 'N/A'}
                          </div>
                        </TableCell><TableCell>
                          <div className="font-medium">{totalStock}</div>
                        </TableCell><TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{product.averageRating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({product.numberOfReviews})</span>
                          </div>
                        </TableCell><TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
                            {product.isFeatured && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Star className="h-3 w-3" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell><TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedProduct(product);
                                  setIsEditDialogOpen(true);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleFeatured(product)} disabled={updateProductMutation.isPending}>
                                  {product.isFeatured ? (
                                    <>
                                      <X className="mr-2 h-4 w-4" /> Unfeature
                                    </>
                                  ) : (
                                    <>
                                      <Check className="mr-2 h-4 w-4" /> Feature
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the product "{product.name}".
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteProductMutation.mutate(product._id)} disabled={deleteProductMutation.isPending}>
                                        {deleteProductMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details, variants, and inventory.
            </DialogDescription>
          </DialogHeader>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading categories...
            </div>
          ) : categoriesError ? (
            <p className="text-destructive text-center py-8">Error loading categories: {categoriesError.message}</p>
          ) : categoryNames.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No categories available. Please create categories first.</p>
          ) : (
            <ProductForm
              product={selectedProduct || undefined}
              onSubmit={(data) => {
                if (selectedProduct) {
                  // For updates, we don't send imageFiles in the main product update payload
                  // Image updates are handled by separate upload/delete mutations
                  const { imageFiles, ...rest } = data as ProductFormValues; // Exclude imageFiles from the update payload
                  updateProductMutation.mutate({ id: selectedProduct._id, data: rest as UpdateProductData });
                }
              }}
              onClose={() => setIsEditDialogOpen(false)}
              isSubmitting={updateProductMutation.isPending}
              categories={categories || []}
              onProductUpdated={handleProductFormUpdate} // Pass callback
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
            <DialogDescription>{selectedProduct?.description}</DialogDescription>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <img
                    src={selectedProduct.imageUrls[0] || '/placeholder.svg'}
                    alt={selectedProduct.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Rating</Label>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedProduct.averageRating.toFixed(1)} ({selectedProduct.numberOfReviews} reviews)</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStockStatus(getTotalStock(selectedProduct.variants)).variant}>
                        {getStockStatus(getTotalStock(selectedProduct.variants)).status}
                      </Badge>
                      {selectedProduct.isFeatured && <Badge variant="outline">Featured</Badge>}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Variants</Label>
                <div className="mt-2 space-y-2">
                  {selectedProduct.variants && selectedProduct.variants.length > 0 ? (
                    selectedProduct.variants.map((variant: ProductVariant, index: number) => (
                      <div key={variant._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">
                            {variant.size || 'N/A'} {variant.color && `/ ${variant.color}`}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${variant.price.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">{variant.stock} in stock</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No variants for this product.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}