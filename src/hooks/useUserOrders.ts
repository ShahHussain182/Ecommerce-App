import { useQuery } from '@tanstack/react-query';
import * as orderApi from '@/lib/orderApi';

export const useUserOrders = () => {
  return useQuery({
    queryKey: ['userOrders'],
    queryFn: orderApi.fetchUserOrders,
    staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Cache data for 10 minutes
  });
};