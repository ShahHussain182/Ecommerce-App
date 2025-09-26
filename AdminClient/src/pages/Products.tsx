import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Filter, Edit, Trash2, Eye, Star, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { productService } from '@/services/productService';
import { Product } from '@/types';

// Mock product data with more comprehensive structure
const initialProducts = [
  {
    _id: '1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality noise-cancelling wireless headphones with premium sound quality',
    category: 'Electronics',
    imageUrls: ['https://via.placeholder.com/300x300'],
    isFeatured: true,
    variants: [
      { _id: 'v1', size: 'One Size', color: 'Black', price: 199.99, stock: 45 },
      { _id: 'v2', size: 'One Size', color: 'White', price: 199.99, stock: 32 }
    ],
    averageRating: 4.5,
    numberOfReviews: 128,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    _id: '2',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt available in multiple colors and sizes',
    category: 'Clothing',
    imageUrls: ['https://via.placeholder.com/300x300'],
    isFeatured: false,
    variants: [
      { _id: 'v3', size: 'S', color: 'White', price: 29.99, stock: 40 },
      { _id: 'v4', size: 'M', color: 'White', price: 29.99, stock: 50 },
      { _id: 'v5', size: 'L', color: 'White', price: 29.99, stock: 30 },
      { _id: 'v6', size: 'S', color: 'Black', price: 29.99, stock: 25 }
    ],
    averageRating: 4.2,
    numberOfReviews: 85,
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-18T14:15:00Z'
  },
  {
    _id: '3',
    name: 'Stainless Steel Water Bottle',
    description: 'Eco-friendly stainless steel water bottle with double-wall insulation',
    category: 'Accessories',
    imageUrls: ['https://via.placeholder.com/300x300'],
    isFeatured: false,
    variants: [
      { _id: 'v7', size: '500ml', color: 'Silver', price: 24.99, stock: 0 },
      { _id: 'v8', size: '750ml', color: 'Silver', price: 29.99, stock: 15 }
    ],
    averageRating: 4.7,
    numberOfReviews: 42,
    createdAt: '2024-01-08T09:30:00Z',
    updatedAt: '2024-01-19T16:45:00Z'
  },
  {
    _id: '4',
    name: 'Adjustable Laptop Stand',
    description: 'Ergonomic laptop stand with adjustable height and angle for better posture',
    category: 'Electronics',
    imageUrls: ['https://via.placeholder.com/300x300'],
    isFeatured: true,
    variants: [
      { _id: 'v9', size: 'Standard', color: 'Aluminum', price: 79.99, stock: 23 }
    ],
    averageRating: 4.3,
    numberOfReviews: 67,
    createdAt: '2024-01-12T11:20:00Z',
    updatedAt: '2024-01-21T13:10:00Z'
  },
];

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  imageUrls: string[];
  isFeatured: boolean;
  variants: Array<{
    size: string;
    color: string;
    price: number;
    stock: number;
  }>;
}

export function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  // Query for products from API
  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ['products', { searchTerm, category: selectedCategory, page }],
    queryFn: () => productService.getProducts({
      page,
      limit: 20,
      searchTerm: searchTerm || undefined,
      categories: selectedCategory || undefined,
      sortBy: 'name-asc'
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const products = productsData?.products || localProducts;

  const categories = ['All', 'Electronics', 'Clothing', 'Accessories'];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTotalStock = (variants: any[]) => {
    return variants.reduce((total, variant) => total + variant.stock, 0);
  };

  const getMinPrice = (variants: any[]) => {
    return Math.min(...variants.map(v => v.price));
  };

  const getStockStatus = (totalStock: number) => {
    if (totalStock === 0) return { status: 'Out of Stock', variant: 'destructive' as const };
    if (totalStock < 10) return { status: 'Low Stock', variant: 'secondary' as const };
    return { status: 'In Stock', variant: 'default' as const };
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      // Update local state for immediate UI feedback
      setLocalProducts(prev => prev.filter(p => p._id !== productId));
      refetch(); // Refetch from API
      toast.success('Product deleted successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleFeatured = async (productId: string) => {
    try {
      const product = products.find(p => p._id === productId);
      if (product) {
        const updatedProduct = { ...product, isFeatured: !product.isFeatured };
        await productService.updateProduct(productId, updatedProduct);
        // Update local state for immediate UI feedback
        setLocalProducts(prev => prev.map(p => 
          p._id === productId ? updatedProduct : p
        ));
        refetch(); // Refetch from API
        toast.success('Product updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const ProductForm = ({ product, onSubmit, onClose }: {
    product?: any;
    onSubmit: (data: any) => void;
    onClose: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: product?.name || '',
      description: product?.description || '',
      category: product?.category || 'Electronics',
      imageUrls: product?.imageUrls || [''],
      isFeatured: product?.isFeatured || false,
      variants: product?.variants || [{ size: '', color: '', price: 0, stock: 0 }]
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
      onClose();
    };

    const addVariant = () => {
      setFormData({
        ...formData,
        variants: [...formData.variants, { size: '', color: '', price: 0, stock: 0 }]
      });
    };

    const removeVariant = (index: number) => {
      setFormData({
        ...formData,
        variants: formData.variants.filter((_, i) => i !== index)
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrls[0]}
            onChange={(e) => setFormData({ ...formData, imageUrls: [e.target.value] })}
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Product Variants</Label>
            <Button type="button" onClick={addVariant} size="sm">
              <Plus className="mr-2 h-3 w-3" />
              Add Variant
            </Button>
          </div>
          
          {formData.variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Size</Label>
                <Input
                  value={variant.size}
                  onChange={(e) => {
                    const newVariants = [...formData.variants];
                    newVariants[index].size = e.target.value;
                    setFormData({ ...formData, variants: newVariants });
                  }}
                  placeholder="S, M, L"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Color</Label>
                <Input
                  value={variant.color}
                  onChange={(e) => {
                    const newVariants = [...formData.variants];
                    newVariants[index].color = e.target.value;
                    setFormData({ ...formData, variants: newVariants });
                  }}
                  placeholder="Black, White"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Price</Label>
                <Input
                  type="number"
                  value={variant.price}
                  onChange={(e) => {
                    const newVariants = [...formData.variants];
                    newVariants[index].price = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, variants: newVariants });
                  }}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Stock</Label>
                <Input
                  type="number"
                  value={variant.stock}
                  onChange={(e) => {
                    const newVariants = [...formData.variants];
                    newVariants[index].stock = parseInt(e.target.value) || 0;
                    setFormData({ ...formData, variants: newVariants });
                  }}
                  min="0"
                  required
                />
              </div>
              <Button
                type="button"
                onClick={() => removeVariant(index)}
                variant="ghost"
                size="icon"
                disabled={formData.variants.length === 1}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="h-4 w-4"
          />
          <Label htmlFor="featured">Featured Product</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {product ? 'Update' : 'Create'} Product
          </Button>
        </DialogFooter>
      </form>
    );
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
              onSubmit={async (data) => {
                try {
                  const newProduct = await productService.createProduct({
                    ...data,
                    variants: data.variants.map((v: any, i: number) => ({ ...v, _id: `v${Date.now()}_${i}` })),
                    averageRating: 0,
                    numberOfReviews: 0,
                  });
                  setLocalProducts(prev => [...prev, newProduct.data]);
                  refetch();
                  toast.success('Product created successfully');
                } catch (error) {
                  toast.error('Failed to create product');
                }
              }}
              onClose={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category || (category === 'All' && selectedCategory === '') ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>
            View and manage all your products in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const totalStock = getTotalStock(product.variants);
                const minPrice = getMinPrice(product.variants);
                const stockStatus = getStockStatus(totalStock);
                
                return (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
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
                        ${minPrice}
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
                        <span className="font-medium">{product.averageRating}</span>
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
                    <TableCell>
                      <div className="flex items-center space-x-2">
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
                          onClick={() => handleToggleFeatured(product._id)}
                        >
                          <Star className={`h-4 w-4 ${product.isFeatured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <h3 className="mt-4 text-lg font-semibold">Loading products...</h3>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-destructive" />
                <h3 className="mt-4 text-lg font-semibold">Error loading products</h3>
                <p className="text-muted-foreground mb-4">There was an issue fetching the products.</p>
                <Button onClick={() => refetch()}>Try Again</Button>
              </div>
            </div>
          )}
          
          {!isLoading && !error && filteredProducts.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            </div>
          )}
        </CardContent>
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
            product={selectedProduct}
            onSubmit={async (data) => {
              try {
                if (selectedProduct) {
                  await productService.updateProduct(selectedProduct._id, data);
                  setLocalProducts(prev => prev.map(p => 
                    p._id === selectedProduct._id 
                      ? { ...p, ...data, updatedAt: new Date().toISOString() }
                      : p
                  ));
                  refetch();
                  toast.success('Product updated successfully');
                }
              } catch (error) {
                toast.error('Failed to update product');
              }
            }}
            onClose={() => setIsEditDialogOpen(false)}
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
              <div className="grid grid-cols-2 gap-4">
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
                      <span>{selectedProduct.averageRating} ({selectedProduct.numberOfReviews} reviews)</span>
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
                  {selectedProduct.variants.map((variant: any, index: number) => (
                    <div key={variant._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{variant.size} - {variant.color}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${variant.price}</div>
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
