import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchProductReviews } from '@/lib/reviewApi';

export const useProductReviews = (productId: string) => {
  return useInfiniteQuery({
    queryKey: ['productReviews', productId],
    queryFn: ({ pageParam }) => fetchProductReviews(productId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!productId,
  });
};