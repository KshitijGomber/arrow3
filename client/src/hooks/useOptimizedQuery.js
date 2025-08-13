import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

/**
 * Optimized query hook with intelligent caching strategies
 * @param {string} queryKey - The query key
 * @param {Function} queryFn - The query function
 * @param {Object} options - Query options
 * @returns {Object} Query result with optimized settings
 */
export const useOptimizedQuery = (queryKey, queryFn, options = {}) => {
  // Determine cache strategy based on data type
  const getCacheStrategy = useCallback((key) => {
    const keyString = Array.isArray(key) ? key.join('-') : key;
    
    // Static data (rarely changes) - longer cache
    if (keyString.includes('drone') && !keyString.includes('user')) {
      return {
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
      };
    }
    
    // User-specific data - shorter cache
    if (keyString.includes('user') || keyString.includes('order')) {
      return {
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      };
    }
    
    // Real-time data - minimal cache
    if (keyString.includes('payment') || keyString.includes('status')) {
      return {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
      };
    }
    
    // Default strategy
    return {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    };
  }, []);

  const cacheStrategy = useMemo(() => getCacheStrategy(queryKey), [queryKey, getCacheStrategy]);

  const optimizedOptions = useMemo(() => ({
    ...cacheStrategy,
    // Enable background updates for better UX
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    // Intelligent retry strategy
    retry: (failureCount, error) => {
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    // Progressive retry delay
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  }), [cacheStrategy, options]);

  return useQuery({
    queryKey,
    queryFn,
    ...optimizedOptions,
  });
};

/**
 * Hook for prefetching data with optimized settings
 * @param {Object} queryClient - React Query client
 * @returns {Function} Prefetch function
 */
export const useOptimizedPrefetch = (queryClient) => {
  return useCallback((queryKey, queryFn, options = {}) => {
    const keyString = Array.isArray(queryKey) ? queryKey.join('-') : queryKey;
    
    // Determine if prefetching is beneficial
    const shouldPrefetch = !keyString.includes('user-specific') && 
                          !keyString.includes('real-time');
    
    if (shouldPrefetch) {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 10 * 60 * 1000, // 10 minutes for prefetched data
        ...options,
      });
    }
  }, [queryClient]);
};

export default useOptimizedQuery;