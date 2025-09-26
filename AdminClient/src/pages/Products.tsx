import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Edit, Trash2, Eye, Star, Package, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService, CreateProductData, UpdateProductData } from '@/services/productService';
import { Product, ProductVariant } from '@/types';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, updateProductSchema } from '@/schemas/productSchema';
import { z } from 'zod';

// Type for the form data, combining create and update schemas
type ProductFormValues = z.infer<typeof createProductSchema>;

const categories = ['All', 'Electronics', 'Clothing', 'Accessories', 'Home Goods', 'Wearables'];

const getTotalStock = (variants: ProductVariant[]) => {
  return variants.reduce((total, variant) => total + variant.stock, 0);
};

const getMinPrice = (variants: ProductVariant[]) => {
  return variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0;
};

const getStockStatus = (totalStock: number) => {
  if (totalStock === 0) return { status: 'Out of Stock', variant: 'destructive' as const };
  if (totalStock < 10) return { status: 'Low Stock', variant: 'secondary' as const };
  return { status: 'In Stock', variant: 'default' as const };
};

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormValues) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

const ProductForm = ({ product, onSubmit, onClose, isSubmitting }: ProductFormProps) => {
  const formSchema = product ? updateProductSchema : createProductSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || 'Electronics',
      imageUrls: product?.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [''],
      isFeatured: product?.isFeatured || false,
      variants: product?.variants && product.variants.length > 0 ? product.variants : [{ size: '', color: '', price: 0, stock: 0 }],
    },
  });

  // Reset form when product prop changes (for edit mode)
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        category: product.category,
        imageUrls: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [''],
        isFeatured: product.isFeatured,
        variants: product.variants && product.variants.length > 0 ? product.variants : [{ size: '', color: '', price: 0, stock: 0 }],
      });
    } else {
      // Reset to empty for new product form
      reset({
        name: '',
        description: '',
        category: 'Electronics',
        imageUrls: [''],
        isFeatured: false,
        variants: [{ size: '', color: '', price: 0, stock: 0 }],
      });
    }
  }, [product, reset]);

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  const { fields: imageUrlFields, append: appendImageUrl, remove: removeImageUrl } = useFieldArray({
    control,
    name: 'imageUrls',
  });

  const handleFormSubmit = (data: ProductFormValues) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            {...register('name')}
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            {...register('category')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={isSubmitting}
          >
            {categories.filter(c => c !== 'All').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
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
          disabled={isSubmitting}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Image URLs</Label>
          <Button type="button" onClick={() => appendImageUrl('')} size="sm" disabled={isSubmitting}>
            <Plus className="mr-2 h-3 w-3" />
            Add Image
          </Button>
        </div>
        {imageUrlFields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input
              {...register(`imageUrls.${index}`)}
              placeholder="https://example.com/image.jpg"
              disabled={isSubmitting}
            />
            {imageUrlFields.length > 1 && (
              <Button
                type="button"
                onClick={() => removeImageUrl(index)}
                variant="ghost"
                size="icon"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {errors.imageUrls?.[index] && <p className="text-sm text-destructive">{errors.imageUrls[index]?.message}</p>}
          </div>
        ))}
        {errors.imageUrls?.root && <p className="text-sm text-destructive">{errors.imageUrls.root.message}</p>}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Product Variants</Label>
          <Button type="button" onClick={() => appendVariant({ size: '', color: '', price: 0, stock: 0 })} size="sm" disabled={isSubmitting}>
            <Plus className="mr-2 h-3 w-3" />
            Add Variant
          </Button>
        </div>
        
        {variantFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-5 gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Size</Label>
              <Input
                {...register(`variants.${index}.size`)}
                placeholder="S, M, L"
                disabled={isSubmitting}
              />
              {errors.variants?.[index]?.size && <p className="text-sm text-destructive">{errors.variants[index]?.size?.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Color</Label>
              <Input
                {...register(`variants.${index}.color`)}
                placeholder="Black, White"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              {errors.variants?.[index]?.price && <p className="text-sm text-destructive">{errors.variants[index]?.price?.message}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stock</Label>
              <Input
                type="number"
                {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                min="0"
                disabled={isSubmitting}
              />
              {errors.variants?.[index]?.stock && <p className="text-sm text-destructive">{errors.variants[index]?.stock?.message}</p>}
            </div>
            <Button
              type="button"
              onClick={() => removeVariant(index)}
              variant="ghost"
              size="icon"
              disabled={variantFields.length === 1 || isSubmitting}
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
          disabled={isSubmitting}
        />
        <Label htmlFor="featured">Featured Product</Label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
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
  const limit = 10; // Number of items per page

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page on new search term
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Query for products from API
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit }],
    queryFn: () => productService.getProducts({
      page,
      limit,
      searchTerm: debouncedSearchTerm || undefined,
      categories: selectedCategory === 'All' ? undefined : selectedCategory || undefined,
      sortBy: 'name-asc'
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const products = productsData?.products || [];
  const totalProducts = productsData?.totalProducts || 0;
  const totalPages = Math.ceil(totalProducts / limit);

  // Mutations for CRUD operations
  const createProductMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
      setIsAddDialogOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create product');
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductData }) => productService.updateProduct(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches for the products query
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit }]);

      // Optimistically update the product in the cache
      queryClient.setQueryData(
        ['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit }],
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
    onSuccess: () => {
      toast.success('Product updated successfully');
      setIsEditDialogOpen(false);
    },
    onError: (err: any, variables, context) => {
      toast.error(err.response?.data?.message || 'Failed to update product');
      // Rollback to the previous cache state
      if (context?.previousProducts) {
        queryClient.setQueryData(
          ['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit }],
          context.previousProducts
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state is reflected
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productService.deleteProduct,
    onMutate: async (productIdToDelete) => {
      // Cancel any outgoing refetches for the products query
      await queryClient.cancelQueries({ queryKey: ['products'] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit }]);

      // Optimistically remove the product from the cache
      queryClient.setQueryData(
        ['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit }],
        (oldData: { products: Product[], totalProducts: number, nextPage: number | null } | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            products: oldData.products.filter((product) => product._id !== productIdToDelete),
            totalProducts: oldData.totalProducts - 1, // Adjust total count
          };
        }
      );

      return { previousProducts };
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
    },
    onError: (err: any, variables, context) => {
      toast.error(err.response?.data?.message || 'Failed to delete product');
      // Rollback to the previous cache state
      if (context?.previousProducts) {
        queryClient.setQueryData(
          ['products', { searchTerm: debouncedSearchTerm, category: selectedCategory, page, limit }],
          context.previousProducts
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state is reflected
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleToggleFeatured = async (product: Product) => {
    updateProductMutation.mutate({
      id: product._id,
      data: { isFeatured: !product.isFeatured },
    });
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Create a new product with variants, pricing, and inventory details.
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              onSubmit={(data) => createProductMutation.mutate(data)}
              onClose={() => setIsAddDialogOpen(false)}
              isSubmitting={createProductMutation.isPending}
            />
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
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category || (category === 'All' && selectedCategory === '') ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedCategory(category === 'All' ? '' : category);
                setPage(1); // Reset to first page on category change
              }}
            >
              {category}
            </Button>
          ))}
        </div>
        
        <Button variant="outline" className="ml-auto">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
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
          <div className="overflow-x-auto"> {/* Wrapper for horizontal scroll */}
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[250px]">Product</TableHead>
                  <TableHead className="min-w-[120px]">Category</TableHead>
                  <TableHead className="min-w-[120px]">Price Range</TableHead>
                  <TableHead className="min-w-[80px]">Stock</TableHead>
                  <TableHead className="min-w-[100px]">Rating</TableHead>
                  <TableHead className="min-w-[150px]">Status</TableHead>
                  <TableHead className="min-w-[180px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                          <h3 className="mt-4 text-lg font-semibold">Loading products...</h3>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Package className="mx-auto h-12 w-12 text-destructive" />
                          <h3 className="mt-4 text-lg font-semibold">Error loading products</h3>
                          <p className="text-muted-foreground mb-4">There was an issue fetching the products.</p>
                          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}>Try Again</Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                          <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
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
                              src={product.imageUrls[0]}
                              alt={product.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            ${minPrice.toFixed(2)}
                            {product.variants.length > 1 && <span className="text-muted-foreground">+</span>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{totalStock}</div>
                          <div className="text-sm text-muted-foreground">units</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{product.averageRating.toFixed(1)}</span>
                            <span className="text-muted-foreground">({product.numberOfReviews})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
                            {product.isFeatured && (
                              <Badge variant="outline">
                                <Star className="mr-1 h-3 w-3" />
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
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
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedProduct(product);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleFeatured(product)}
                              disabled={updateProductMutation.isPending}
                            >
                              <Star className={`h-4 w-4 ${product.isFeatured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteProductMutation.mutate(product._id)}
                              disabled={deleteProductMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div> {/* End of overflow-x-auto wrapper */}
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
          <ProductForm
            product={selectedProduct || undefined}
            onSubmit={(data) => {
              if (selectedProduct) {
                updateProductMutation.mutate({ id: selectedProduct._id, data });
              }
            }}
            onClose={() => setIsEditDialogOpen(false)}
            isSubmitting={updateProductMutation.isPending}
          />
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
                    src={selectedProduct.imageUrls[0]}
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
                  {selectedProduct.variants.map((variant: ProductVariant, index: number) => (
                    <div key={variant._id || index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{variant.size} - {variant.color}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${variant.price.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">{variant.stock} in stock</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}