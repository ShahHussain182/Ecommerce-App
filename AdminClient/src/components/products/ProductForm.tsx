"use client";

import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, X, Image as ImageIcon, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '../../services/productService';
import type { Product, ProductVariant, Category, ApiResponse } from '../../types'; 
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, updateProductSchema, ProductFormValues } from '../../schemas/productSchema';
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MAX_IMAGES = 5;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormValues) => void;
  onClose: () => void;
  isSubmitting: boolean;
  categories: Category[];
  onProductUpdated?: (updatedProduct: Product) => void;
}

export const ProductForm = ({ product, onSubmit, onClose, isSubmitting, categories, onProductUpdated }: ProductFormProps) => {
  const queryClient = useQueryClient();
  const formSchema = product ? updateProductSchema : createProductSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || (categories.length > 0 ? categories[0].name : ''),
      imageUrls: product?.imageUrls || [],
      imageFiles: [],
      isFeatured: product?.isFeatured || false,
      variants: product?.variants && product.variants.length > 0
        ? product.variants
        : [{ size: '', color: '', price: 0, stock: 0 }],
    },
  });

  const existingImageUrls = watch('imageUrls');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [hasUnuploadedFiles, setHasUnuploadedFiles] = useState(false);

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        category: product.category,
        imageUrls: product.imageUrls || [],
        imageFiles: [],
        isFeatured: product.isFeatured,
        variants: product.variants && product.variants.length > 0 ? product.variants : [{ size: '', color: '', price: 0, stock: 0 }],
      });
      setSelectedFiles([]);
      setHasUnuploadedFiles(false);
    } else {
      reset({
        name: '',
        description: '',
        category: categories.length > 0 ? categories[0].name : '',
        imageUrls: [],
        imageFiles: [],
        isFeatured: false,
        variants: [{ size: '', color: '', price: 0, stock: 0 }],
      });
      setSelectedFiles([]);
      setHasUnuploadedFiles(false);
    }
  }, [product, reset, categories]);

  useEffect(() => {
    setHasUnuploadedFiles(selectedFiles.length > 0);
  }, [selectedFiles]);

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      const currentTotalImages = (existingImageUrls?.length || 0) + selectedFiles.length;
      const newTotalImages = currentTotalImages + filesArray.length;

      if (newTotalImages > MAX_IMAGES) {
        toast.error(`You can only have a maximum of ${MAX_IMAGES} images. You are trying to add ${filesArray.length} more, which would exceed the limit.`);
        return;
      }

      const updatedSelectedFiles = [...selectedFiles, ...filesArray];
      setSelectedFiles(updatedSelectedFiles);
      setValue('imageFiles', updatedSelectedFiles, { shouldValidate: true });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveSelectedFile = (indexToRemove: number) => {
    setSelectedFiles(prev => {
      const updatedFiles = prev.filter((_, index) => index !== indexToRemove);
      setValue('imageFiles', updatedFiles, { shouldValidate: true });
      return updatedFiles;
    });
  };

  const uploadImagesMutation = useMutation({
    mutationFn: ({ productId, files }: { productId: string; files: File[] }) =>
      productService.uploadProductImages(productId, files),
    onSuccess: (response: ApiResponse<Product>) => {
      toast.success(response.message);
      setValue('imageUrls', response.product?.imageUrls || [], { shouldDirty: true });
      // Also update imageRenditions if available in the response
      if (response.product?.imageRenditions) {
        // This is a bit tricky as imageRenditions is an array of objects.
        // For simplicity, we'll just trigger a refetch of the product to get the latest state.
        queryClient.invalidateQueries({ queryKey: ['product', response.product._id] });
      }
      setSelectedFiles([]);
      setHasUnuploadedFiles(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onProductUpdated?.(response.product as Product);
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

  const deleteImageMutation = useMutation({
    mutationFn: ({ productId, imageUrl }: { productId: string; imageUrl: string }) =>
      productService.deleteProductImage(productId, imageUrl),
    onSuccess: (response: ApiResponse<Product>) => {
      toast.success(response.message);
      setValue('imageUrls', response.product?.imageUrls || [], { shouldDirty: true });
      // Also update imageRenditions if available in the response
      if (response.product?.imageRenditions) {
        // Trigger a refetch of the product to get the latest state.
        queryClient.invalidateQueries({ queryKey: ['product', response.product._id] });
      }
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
    if (product && hasUnuploadedFiles) {
      toast.error("Please upload new images before updating the product.");
      return;
    }
    onSubmit(data);
  };

  const allImagePreviews = [
    ...(existingImageUrls || []).map((url, index) => product?.imageRenditions[index]?.thumbnail || url),
    ...selectedFiles.map(file => URL.createObjectURL(file))
  ];

  const totalImagesCount = (existingImageUrls?.length || 0) + selectedFiles.length;
  const canAddMoreImages = totalImagesCount < MAX_IMAGES;
  const canDeleteImages = totalImagesCount > 1;

  const isAnyOperationPending = isSubmitting || isUploadingImages || isDeletingImage;

  const isSubmitButtonDisabled = isAnyOperationPending || (product && hasUnuploadedFiles) || (product?.imageProcessingStatus === 'pending');

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            {...register('name')}
            disabled={isAnyOperationPending || product?.imageProcessingStatus === 'pending'}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...register('category')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={isAnyOperationPending || categories.length === 0 || product?.imageProcessingStatus === 'pending'}
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
        <Textarea
          id="description"
          {...register('description')}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          rows={3}
          disabled={isAnyOperationPending || product?.imageProcessingStatus === 'pending'}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      {/* Image Upload Section */}
      <div className="space-y-3 border p-4 rounded-md">
        <div className="flex items-center justify-between">
          <Label>Product Images ({totalImagesCount}/{MAX_IMAGES})</Label>
          <div className="flex space-x-2">
            <Button type="button" onClick={() => fileInputRef.current?.click()} size="sm" disabled={isAnyOperationPending || !canAddMoreImages || product?.imageProcessingStatus === 'pending'}>
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
              disabled={isAnyOperationPending || !canAddMoreImages || product?.imageProcessingStatus === 'pending'}
            />
            {product && selectedFiles.length > 0 && (
              <Button type="button" onClick={handleUploadNewImages} size="sm" disabled={isAnyOperationPending || selectedFiles.length === 0 || product?.imageProcessingStatus === 'pending'}>
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
        {errors.imageFiles?.message && <p className="text-sm text-destructive">{String(errors.imageFiles.message)}</p>}
        {errors.imageUrls?.message && <p className="text-sm text-destructive">{String(errors.imageUrls.message)}</p>}
        {product && hasUnuploadedFiles && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pending Image Uploads</AlertTitle>
            <AlertDescription>
              You have selected new images. Please click the "Upload" button to add them before updating the product.
            </AlertDescription>
          </Alert>
        )}
        {product?.imageProcessingStatus === 'pending' && (
          <Alert variant="default">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Image Processing in Progress</AlertTitle>
            <AlertDescription>
              Some images for this product are still being processed. They will appear once completed.
            </AlertDescription>
          </Alert>
        )}

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
                  if (index < (existingImageUrls?.length || 0)) {
                    handleRemoveExistingImage(url);
                  } else {
                    handleRemoveSelectedFile(index - (existingImageUrls?.length || 0));
                  }
                }}
                disabled={isAnyOperationPending || !canDeleteImages || product?.imageProcessingStatus === 'pending'}
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
          <Button type="button" onClick={() => appendVariant({ size: '', color: '', price: 0, stock: 0 })} size="sm" disabled={isAnyOperationPending || product?.imageProcessingStatus === 'pending'}>
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
                disabled={isAnyOperationPending || product?.imageProcessingStatus === 'pending'}
              />
              {errors.variants?.[index]?.size && <p className="text-sm text-destructive">{String(errors.variants[index]?.size?.message)}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Color (Optional)</Label>
              <Input
                {...register(`variants.${index}.color`)}
                placeholder="Black, White"
                disabled={isAnyOperationPending || product?.imageProcessingStatus === 'pending'}
              />
              {errors.variants?.[index]?.color && <p className="text-sm text-destructive">{String(errors.variants[index]?.color?.message)}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Price</Label>
              <Input
                type="number"
                {...register(`variants.${index}.price`, { valueAsNumber: true })}
                step="0.01"
                min="0"
                disabled={isAnyOperationPending || product?.imageProcessingStatus === 'pending'}
              />
              {errors.variants?.[index]?.price && <p className="text-sm text-destructive">{String(errors.variants[index]?.price?.message)}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stock</Label>
              <Input
                type="number"
                {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                min="0"
                disabled={isAnyOperationPending || product?.imageProcessingStatus === 'pending'}
              />
              {errors.variants?.[index]?.stock && <p className="text-sm text-destructive">{String(errors.variants[index]?.stock?.message)}</p>}
            </div>
            <Button
              type="button"
              onClick={() => removeVariant(index)}
              variant="ghost"
              size="icon"
              disabled={variantFields.length === 1 || isAnyOperationPending || product?.imageProcessingStatus === 'pending'}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {errors.variants?.root && <p className="text-sm text-destructive">{String(errors.variants.root.message)}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          {...register('isFeatured')}
          className="h-4 w-4"
          disabled={isAnyOperationPending || product?.imageProcessingStatus === 'pending'}
        />
        <Label htmlFor="featured">Featured Product</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={false}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitButtonDisabled}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? 'Update' : 'Create'} Product
        </Button>
      </DialogFooter>
    </form>
  );
};