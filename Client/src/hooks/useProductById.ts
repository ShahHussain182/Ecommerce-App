import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '@/lib/api';

export const useProductById = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductById(productId),
    enabled: !!productId, // Ensures the query only runs when productId is valid
  });
};