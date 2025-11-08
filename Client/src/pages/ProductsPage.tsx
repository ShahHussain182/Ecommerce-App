"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Import useSearchParams
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductFilterSidebar } from '@/components/ProductFilterSidebar';
import { useProducts } from '@/hooks/useProducts';
import { FilterState } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  categories: [],
  priceRange: [0, 500],
  colors: [],
  sizes: [],
  sortBy: 'price-asc',
  searchTerm: '', // Initialize searchTerm
};

const ProductsPage = () => {
  const [searchParams] = useSearchParams(); // Initialize useSearchParams
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const isMobile = useIsMobile();
  const queryResult = useProducts(filters);
  const totalProducts = queryResult.data?.pages[0]?.totalProducts ?? 0;

  // Effect to read URL parameters and apply filters
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchTermParam = searchParams.get('query'); // Get search term from URL

    setFilters(prev => {
      const newCategories = categoryParam ? [categoryParam] : [];
      const newSearchTerm = searchTermParam || '';

      let updatedFilters = { ...prev };
      let changed = false;

      if (JSON.stringify(prev.categories) !== JSON.stringify(newCategories)) {
        updatedFilters.categories = newCategories;
        changed = true;
      }
      if (prev.searchTerm !== newSearchTerm) {
        updatedFilters.searchTerm = newSearchTerm;
        // When a search term is present, default to relevance sorting
        if (newSearchTerm && updatedFilters.sortBy !== 'relevance-desc') {
          updatedFilters.sortBy = 'relevance-desc';
        } else if (!newSearchTerm && updatedFilters.sortBy === 'relevance-desc') {
          // If search term is cleared, revert to default price sort
          updatedFilters.sortBy = 'price-asc';
        }
        changed = true;
      }
      
      return changed ? updatedFilters : prev;
    });
  }, [searchParams]); // Re-run when searchParams change

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const sidebar = (
    <ProductFilterSidebar
      filters={filters}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
    />
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow flex flex-col">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground">Our Products</h1>
            <p className="text-muted-foreground mt-2">Explore our curated collection of high-quality items.</p>
          </div>

          {isMobile ? (
            <div className="flex flex-col h-full">
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
                    {filters.searchTerm && <SelectItem value="relevance-desc">Relevance</SelectItem>}
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A-Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z-A</SelectItem>
                    <SelectItem value="averageRating-desc">Top Rated</SelectItem>
                    <SelectItem value="numberOfReviews-desc">Most Reviewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ProductGrid queryResult={queryResult} />
              </div>
            </div>
          ) : (
            <ResizablePanelGroup direction="horizontal" className="min-h-[600px] rounded-lg border bg-card flex-1">
              <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
                <div className="p-6 h-full overflow-y-auto">{sidebar}</div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75}>
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-muted-foreground">Showing {totalProducts} products</p>
                    <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange({ sortBy: value as FilterState['sortBy'] })}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {filters.searchTerm && <SelectItem value="relevance-desc">Relevance</SelectItem>}
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="name-asc">Name: A-Z</SelectItem>
                        <SelectItem value="name-desc">Name: Z-A</SelectItem>
                        <SelectItem value="averageRating-desc">Top Rated</SelectItem>
                        <SelectItem value="numberOfReviews-desc">Most Reviewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ProductGrid queryResult={queryResult} />
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

export default ProductsPage;