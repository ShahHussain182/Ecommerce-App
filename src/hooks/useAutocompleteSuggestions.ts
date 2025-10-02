import { useQuery } from '@tanstack/react-query';
import { fetchAutocompleteSuggestions } from '@/lib/productApi';
import { useDebounce } from 'use-debounce'; // Import useDebounce

export const useAutocompleteSuggestions = (searchTerm: string) => {
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300); // Debounce the input

  return useQuery({
    queryKey: ['autocompleteSuggestions', debouncedSearchTerm],
    queryFn: () => fetchAutocompleteSuggestions(debouncedSearchTerm),
    enabled: !!debouncedSearchTerm && debouncedSearchTerm.length >= 2, // Only enable if debounced term is valid
    staleTime: 1000 * 60 * 1, // Suggestions can be stale for 1 minute
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};