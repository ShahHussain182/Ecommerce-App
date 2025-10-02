"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductGrid } from '@/components/ProductGrid';
import { useSearchProducts } from '@/hooks/useSearchProducts';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, SearchX } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { FilterState } from '@/types';
import { ProductFilterSidebar } from '@/components/ProductFilterSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  categories: [],
  priceRange: [0, 500],
  colors: [],
  sizes: [],
  sortBy: 'relevance-desc', // Default to relevance for search page
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearchTerm = searchParams.get('query') || '';
  const isMobile = useIsMobile();

  const [filters, setFilters] = useState<FilterState>({
    ...INITIAL_FILTERS,
    searchTerm: initialSearchTerm,
  });

  // Update filters when URL search term changes
  useEffect(() => {
    const currentSearchTerm = searchParams.get('query') || '';
    setFilters(prev => {
      if (prev.searchTerm !== currentSearchTerm) {
        return {
          ...prev,
          searchTerm: currentSearchTerm,
          sortBy: 'relevance-desc', // Always default to relevance for new search terms
        };
      }
      return prev;
    });
  }, [searchParams]);

  // Update URL when filters change (except for initial searchTerm)
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (filters.searchTerm) {
      newSearchParams.set('query', filters.searchTerm);
    }
    // Add other filters to URL if desired, e.g., category, sortBy
    // For now, we'll keep the URL clean for just the search query.
    // If you want filters to persist in URL, uncomment and implement here.
    // if (filters.categories && filters.categories.length > 0) {
    //   newSearchParams.set('category', filters.categories.join(','));
    // }
    // if (filters.sortBy && filters.sortBy !== 'relevance-desc') {
    //   newSearchParams.set('sortBy', filters.sortBy);
    // }
    setSearchParams(newSearchParams, { replace: true });
  }, [filters.searchTerm, setSearchParams]); // Only update URL for searchTerm for now

  const queryResult = useSearchProducts(filters.searchTerm, filters); // Pass filters to useSearchProducts
  const totalProducts = queryResult.data?.pages[0]?.totalProducts ?? 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [filters.searchTerm]);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({ ...INITIAL_FILTERS, searchTerm: filters.searchTerm }); // Keep search term, clear others
  };

  const sidebar = (
    <ProductFilterSidebar
      filters={filters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
    />
  );

  if (!filters.searchTerm) {
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
            <h1 className="text-4xl font-bold">Search Results for "{filters.searchTerm}"</h1>
            <p className="text-gray-600 mt-2">Found {totalProducts} products.</p>
          </div>

          {isMobile ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                    <div className="p-4">{sidebar}</div>
                  </SheetContent>
                </Sheet>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange({ sortBy: value as FilterState['sortBy'] })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance-desc">Relevance</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A-Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z-A</SelectItem>
                    <SelectItem value="averageRating-desc">Top Rated</SelectItem>
                    <SelectItem value="numberOfReviews-desc">Most Reviewed</SelectItem>
                  </SelectContent>
                </Select>
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
          ) : (
            <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border">
              <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                <div className="p-6 h-full overflow-y-auto">{sidebar}</div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75}>
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-gray-600">Showing {totalProducts} products</p>
                    <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange({ sortBy: value as FilterState['sortBy'] })}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance-desc">Relevance</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="name-asc">Name: A-Z</SelectItem>
                        <SelectItem value="name-desc">Name: Z-A</SelectItem>
                        <SelectItem value="averageRating-desc">Top Rated</SelectItem>
                        <SelectItem value="numberOfReviews-desc">Most Reviewed</SelectItem>
                      </SelectContent>
                    </Select>
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
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;