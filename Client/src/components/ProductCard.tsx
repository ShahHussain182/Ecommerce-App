import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/store/cartStore';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItemToCart = useCartStore((state) => state.addItem);
  const defaultVariant = product.variants[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when button is clicked
    if (defaultVariant) {
      addItemToCart(product, defaultVariant);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <Link to={`/product/${product.id}`} className="flex-grow flex flex-col">
        <CardHeader className="p-0">
          <img src={product.imageUrls[0]} alt={product.name} className="w-full h-48 object-cover" />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-2 hover:text-primary">{product.name}</CardTitle>
          <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden text-ellipsis">
            {product.description}
          </p>
          <p className="text-xl font-bold text-gray-900">${defaultVariant?.price.toFixed(2)}</p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0 mt-auto">
        <Button className="w-full" onClick={handleAddToCart} disabled={!defaultVariant || defaultVariant.stock === 0}>
          {defaultVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
};