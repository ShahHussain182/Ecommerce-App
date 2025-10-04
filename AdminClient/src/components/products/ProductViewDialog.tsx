import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import type { Product, ProductVariant } from '../../types'; // Corrected import path

const getTotalStock = (variants?: ProductVariant[]) => {
  return variants?.reduce((total, variant) => total + variant.stock, 0) || 0;
};

const getStockStatus = (totalStock: number) => {
  if (totalStock === 0) return { status: 'Out of Stock', variant: 'destructive' as const };
  if (totalStock < 10) return { status: 'Low Stock', variant: 'secondary' as const };
  return { status: 'In Stock', variant: 'default' as const };
};

interface ProductViewDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  product: Product | null;
}

export const ProductViewDialog = ({ isOpen, setIsOpen, product }: ProductViewDialogProps) => {
  if (!product) return null;

  const totalStock = getTotalStock(product.variants);
  const stockStatus = getStockStatus(totalStock);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <img
                src={product.imageUrls[0] || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <p className="text-sm">{product.category}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Rating</Label>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{product.averageRating.toFixed(1)} ({product.numberOfReviews} reviews)</span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="flex items-center space-x-2">
                  <Badge variant={stockStatus.variant}>
                    {stockStatus.status}
                  </Badge>
                  {product.isFeatured && <Badge variant="outline">Featured</Badge>}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Variants</Label>
            <div className="mt-2 space-y-2">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((variant: ProductVariant, index: number) => (
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
      </DialogContent>
    </Dialog>
  );
};