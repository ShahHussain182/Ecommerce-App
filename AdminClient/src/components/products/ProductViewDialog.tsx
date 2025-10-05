import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, Loader2 } from 'lucide-react'; // Import Loader2
import type { Product, ProductVariant } from '../../types';
import { useEffect } from 'react';

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
  useEffect(() => {
    if (isOpen && product) {
      console.log(`[ProductViewDialog] Viewing product: ${product.name}, Image URLs:`, product.imageUrls);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const totalStock = getTotalStock(product.variants);
  const stockStatus = getStockStatus(totalStock);
  const isImageProcessingPending = product.imageProcessingStatus === 'pending';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Images Gallery */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Product Images</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {isImageProcessingPending ? (
                <div className="col-span-full text-center text-muted-foreground py-4 border rounded-lg flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Images are being processed...</span>
                </div>
              ) : product.imageRenditions && product.imageRenditions.length > 0 ? (
                product.imageRenditions.map((renditionSet, index) => (
                  <img
                    key={index}
                    src={renditionSet.thumbnail || '/placeholder.svg'} // Use thumbnail for gallery view
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                      e.currentTarget.onerror = null;
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-4 border rounded-lg">
                  No images available.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {isImageProcessingPending && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Processing
                    </Badge>
                  )}
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