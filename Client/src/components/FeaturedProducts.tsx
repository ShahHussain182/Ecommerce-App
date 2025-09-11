import { useFeaturedProducts } from '@/hooks/useFeaturedProducts';
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

export const FeaturedProducts = () => {
  const { data: products, isLoading, isError, error } = useFeaturedProducts();

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col space-y-3">
                <Skeleton className="h-[192px] w-full rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-gray-200" />
                  <Skeleton className="h-4 w-1/2 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load products. {error instanceof Error ? error.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};