import { useQuery } from '@tanstack/react-query';
import { api, API_ENDPOINTS } from '../../utils';

// Query keys
const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'],
  stats: () => [...DASHBOARD_QUERY_KEYS.all, 'stats'],
  alerts: () => [...DASHBOARD_QUERY_KEYS.all, 'alerts'],
};

// Fetch dashboard statistics
export const useDashboardStats = (options = {}) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.stats(),
    queryFn: async () => {
      try {
        const response = await api.get(API_ENDPOINTS.DASHBOARD_STATS);
        return response.data.data;
      } catch (error) {
        console.error('Dashboard stats fetch error:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

// Fetch dashboard alerts
export const useDashboardAlerts = (options = {}) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.alerts(),
    queryFn: async () => {
      try {
        const response = await api.get(API_ENDPOINTS.DASHBOARD_ALERTS);
        return response.data.data;
      } catch (error) {
        console.error('Dashboard alerts fetch error:', error);
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options,
  });
};