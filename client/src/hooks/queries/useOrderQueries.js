import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, API_ENDPOINTS } from '../../utils';
import toast from 'react-hot-toast';

// Query keys
export const ORDER_QUERY_KEYS = {
  all: ['orders'],
  lists: () => [...ORDER_QUERY_KEYS.all, 'list'],
  list: (filters) => [...ORDER_QUERY_KEYS.lists(), { filters }],
  details: () => [...ORDER_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...ORDER_QUERY_KEYS.details(), id],
  userOrders: (userId) => [...ORDER_QUERY_KEYS.all, 'user', userId],
};

// Fetch user orders
export const useUserOrders = (userId, options = {}) => {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.userOrders(userId),
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.USER_ORDERS(userId));
      return response.data.data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Fetch single order
export const useOrder = (orderId, options = {}) => {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.detail(orderId),
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.ORDER_BY_ID(orderId));
      return response.data.data;
    },
    enabled: !!orderId,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Fetch all orders (admin only)
export const useAllOrders = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`${API_ENDPOINTS.ORDERS}?${params}`);
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData) => {
      const response = await api.post(API_ENDPOINTS.ORDERS, orderData);
      return response.data.data;
    },
    onSuccess: (newOrder) => {
      // Invalidate user orders
      if (newOrder.userId) {
        queryClient.invalidateQueries({ 
          queryKey: ORDER_QUERY_KEYS.userOrders(newOrder.userId) 
        });
      }
      
      // Invalidate all orders list (for admin)
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() });
      
      // Add the new order to cache
      queryClient.setQueryData(
        ORDER_QUERY_KEYS.detail(newOrder._id),
        newOrder
      );
      
      toast.success('Order created successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create order';
      toast.error(message);
    },
  });
};

// Update order status (admin only)
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, status, notes }) => {
      const response = await api.put(API_ENDPOINTS.UPDATE_ORDER_STATUS(orderId), {
        status,
        notes
      });
      return response.data.data;
    },
    onSuccess: (updatedOrder) => {
      // Update the order in cache
      queryClient.setQueryData(
        ORDER_QUERY_KEYS.detail(updatedOrder._id),
        updatedOrder
      );
      
      // Invalidate user orders
      if (updatedOrder.userId) {
        queryClient.invalidateQueries({ 
          queryKey: ORDER_QUERY_KEYS.userOrders(updatedOrder.userId) 
        });
      }
      
      // Invalidate all orders list
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() });
      
      toast.success('Order status updated successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update order status';
      toast.error(message);
    },
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderId) => {
      const response = await api.put(API_ENDPOINTS.UPDATE_ORDER_STATUS(orderId), {
        status: 'cancelled'
      });
      return response.data.data;
    },
    onSuccess: (updatedOrder) => {
      // Update the order in cache
      queryClient.setQueryData(
        ORDER_QUERY_KEYS.detail(updatedOrder._id),
        updatedOrder
      );
      
      // Invalidate user orders
      if (updatedOrder.userId) {
        queryClient.invalidateQueries({ 
          queryKey: ORDER_QUERY_KEYS.userOrders(updatedOrder.userId) 
        });
      }
      
      // Invalidate all orders list
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.lists() });
      
      toast.success('Order cancelled successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to cancel order';
      toast.error(message);
    },
  });
};