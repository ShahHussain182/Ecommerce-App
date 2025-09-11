import { useQuery } from '@tanstack/react-query';
import { fetchFeaturedProducts } from '@/lib/api';

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: fetchFeaturedProducts,
  });
};