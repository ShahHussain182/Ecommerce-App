import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/lib/categoryApi';
import type { Category } from '@/types';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAllCategories(),
    select: (data) => data?.categories || [], // Safely extract categories, default to empty array
    staleTime: 0, // Set staleTime to 0 to always refetch categories
    gcTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
};