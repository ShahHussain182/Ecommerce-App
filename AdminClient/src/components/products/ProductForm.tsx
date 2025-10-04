import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Plus, Trash2, Loader2, X, Image as ImageIcon, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService, CreateProductData, UpdateProductData } from '../../services/productService'; // Corrected import path
import type { Product, ProductVariant, Category, ApiResponse } from '../../types'; // Corrected import path
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, updateProductSchema } from '../../schemas/productSchema'; // Corrected import path
import { z } from 'zod';
import { Textarea } from '@/components/ui/textarea';

const MAX_IMAGES = 5;

// Type for the form data, combining create and update schemas
type ProductFormValues = z.infer<typeof createProductSchema> & z.infer<typeof updateProductSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormValues | FormData) => void;
  onClose: () => void;
  isSubmitting: boolean;
  categories: Category[];
  onProductUpdated?: (updatedProduct: Product) => void; // Callback for when product is updated (e.g., after image upload)
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
      imageFiles: undefined,
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

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        category: product.category,
        imageUrls: product.imageUrls || [],
        imageFiles: undefined,
        isFeatured: product.isFeatured,
        variants: product.variants && product.variants.length > 0 ? product.variants : [{ size: '', color: '', price: 0, stock: 0 }],
      });
      setSelectedFiles([]);
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
      setValue('imageFiles', [...selectedFiles, ...filesArray], { shouldValidate: true });
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
      setSelectedFiles([]);
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
      const { imageFiles, ...rest } = data;
      onSubmit({ ...rest, variants: cleanedVariants, imageUrls: existingImageUrls } as UpdateProductData);
    } else {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('isFeatured', String(data.isFeatured));
      
      if (cleanedVariants && cleanedVariants.length > 0) {
        formData.append('variants', JSON.stringify(cleanedVariants));
      }

      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      onSubmit(formData);
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
        <Textarea
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
                  if (index < (existingImageUrls?.length || 0)) {
                    handleRemoveExistingImage(url);
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