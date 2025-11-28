import { useState, useEffect } from 'react';
import useDebounce from './useDebounce';
import { recordService } from '../services/recordService';

export function useVaccineAutocomplete(searchTerm: string, isVaccine: boolean) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!isVaccine || !debouncedSearch || debouncedSearch.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await recordService.searchVaccineNames(debouncedSearch.trim());
        setSuggestions(response.data || []);
      } catch (error) {
        console.error('Error fetching vaccine suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearch, isVaccine]);

  return {
    suggestions,
    isLoading,
  };
}