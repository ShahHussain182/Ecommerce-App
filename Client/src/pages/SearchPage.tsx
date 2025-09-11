"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductGrid } from '@/components/ProductGrid';
import { useSearchProducts } from '@/hooks/useSearchProducts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, SearchX } from "lucide-react";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('query') || '';

  const queryResult = useSearchProducts(searchTerm);
  const totalProducts = queryResult.data?.pages[0]?.totalProducts ?? 0;

  useEffect(() => {
    // Scroll to top when search term changes
    window.scrollTo(0, 0);
  }, [searchTerm]);

  if (!searchTerm) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <SearchX className="mx-auto h-24 w-24 text-gray-300 mb-6" />
          <h2 className="text-3xl font-bold mb-4">What are you looking for?</h2>
          <p className="text-gray-600 mb-8">Enter a search term to find products.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">Search Results for "{searchTerm}"</h1>
            <p className="text-gray-600 mt-2">Found {totalProducts} products.</p>
          </div>

          {queryResult.isError ? (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load search results. {queryResult.error instanceof Error ? queryResult.error.message : 'Unknown error'}
              </AlertDescription>
            </Alert>
          ) : (
            <ProductGrid queryResult={queryResult} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;