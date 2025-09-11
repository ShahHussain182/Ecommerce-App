import { useFeaturedProducts } from '@/hooks/useFeaturedProducts';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';

interface RelatedProductsProps {
  currentProductId: number;
}

export const RelatedProducts = ({ currentProductId }: RelatedProductsProps) => {
  const { data: products, isLoading, isError } = useFeaturedProducts();

  if (isLoading || isError || !products) {
    // Return null to avoid showing a loading/error state for this non-critical section
    return null;
  }

  const relatedProducts = products
    .filter((product: Product) => product.id !== currentProductId)
    .slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};