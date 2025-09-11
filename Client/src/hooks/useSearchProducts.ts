import { useInfiniteQuery } from '@tanstack/react-query';
import { searchProducts } from '@/lib/api';

export const useSearchProducts = (searchTerm: string) => {
  return useInfiniteQuery({
    queryKey: ['searchResults', searchTerm],
    queryFn: ({ pageParam }) => searchProducts({ pageParam, searchTerm }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!searchTerm, // Only run the query if there's a search term
  });
};