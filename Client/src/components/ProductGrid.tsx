import { useEffect, useRef } from 'react';
import { useInfiniteQuery, InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query'; // Import InfiniteData and UseInfiniteQueryResult
import { ProductCard } from './ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ShoppingBag, Loader2 } from "lucide-react"; // Import Loader2
import { Product, PaginatedProductsResponse } from '@/types'; // Import PaginatedProductsResponse
import { Button } from '@/components/ui/button'; // Import Button

interface ProductGridProps {
  queryResult: UseInfiniteQueryResult<InfiniteData<PaginatedProductsResponse>, Error>; // Corrected type definition
}

export const ProductGrid = ({ queryResult }: ProductGridProps) => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = queryResult;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(loadMoreRef.current); // Initialize with current ref

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, {
      rootMargin: '100px', // Start loading when 100px from bottom
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3 p-4 border rounded-lg shadow-sm bg-card dark:bg-gray-800">
            <Skeleton className="h-[192px] w-full rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
              <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load products. {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  const products = data?.pages.flatMap(page => page.products) ?? [];

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-gray-50">No products found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Infinite scroll trigger and feedback */}
      <div ref={loadMoreRef} className="mt-8 text-center">
        {isFetchingNextPage ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading more products...</span>
          </div>
        ) : hasNextPage ? (
          <Button 
            onClick={() => fetchNextPage()} 
            disabled={isFetchingNextPage}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Load More
          </Button>
        ) : products.length > 0 && (
          <p className="text-gray-500 dark:text-gray-400 py-4">You've reached the end of the list.</p>
        )}
      </div>
    </div>
  );
};