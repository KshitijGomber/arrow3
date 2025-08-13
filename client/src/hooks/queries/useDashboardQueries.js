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
      const response = await api.get('/dashboard/stats');
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    ...options,
  });
};

// Fetch dashboard alerts
export const useDashboardAlerts = (options = {}) => {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.alerts(),
    queryFn: async () => {
      const response = await api.get('/dashboard/alerts');
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: true,
    ...options,
  });
};