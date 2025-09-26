import { Product, ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StickyAddToCartBarProps {
  isVisible: boolean;
  product: Product;
  selectedVariant?: ProductVariant;
  quantity: number;
  onQuantityChange: (amount: number) => void;
  onAddToCart: () => void;
}

export const StickyAddToCartBar = ({
  isVisible,
  product,
  selectedVariant,
  quantity,
  onQuantityChange,
  onAddToCart,
}: StickyAddToCartBarProps) => {
  return (
    <div
      className={cn(
        "fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-sm border-b shadow-md z-40 transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <img src={product.imageUrls[0]} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              {selectedVariant && (
                <p className="text-sm text-gray-600">
                  ${selectedVariant.price.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Button variant="outline" size="icon" onClick={() => onQuantityChange(-1)} disabled={quantity <= 1}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input type="number" value={quantity} readOnly className="w-16 text-center h-10" />
              <Button variant="outline" size="icon" onClick={() => onQuantityChange(1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              onClick={onAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className="w-48"
            >
              {selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};