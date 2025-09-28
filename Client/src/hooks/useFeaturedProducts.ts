import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedProducts } from '@/lib/productApi'; // Updated import

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: fetchFeaturedProducts,
  });
};