import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/productApi'; // Updated import
import { FilterState } from '@/types';

export const useProducts = (filters: Partial<FilterState>) => {
  return useInfiniteQuery({
    queryKey: ['products', filters],
    queryFn: ({ pageParam }) => fetchProducts({ pageParam, filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};