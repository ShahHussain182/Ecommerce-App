import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/productApi'; // Use fetchProducts for search
import { FilterState } from '@/types';

export const useSearchProducts = (searchTerm: string, filters: Partial<FilterState>) => {
  return useInfiniteQuery({
    queryKey: ['searchResults', searchTerm, filters], // Include filters in query key
    queryFn: ({ pageParam }) => fetchProducts({ pageParam, filters: { ...filters, searchTerm } }), // Pass searchTerm and other filters
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!searchTerm, // Only run the query if there's a search term
  });
};