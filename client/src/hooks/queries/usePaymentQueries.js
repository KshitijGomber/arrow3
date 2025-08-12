import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, API_ENDPOINTS } from '../../utils';
import toast from 'react-hot-toast';

// Query keys
export const PAYMENT_QUERY_KEYS = {
  all: ['payments'],
  status: (orderId) => [...PAYMENT_QUERY_KEYS.all, 'status', orderId],
};

// Fetch payment status
export const usePaymentStatus = (orderId, options = {}) => {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.status(orderId),
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.PAYMENT_STATUS(orderId));
      return response.data.data;
    },
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: (data) => {
      // Stop refetching if payment is completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 5000; // Refetch every 5 seconds for pending payments
    },
    ...options,
  });
};

// Create payment intent
export const useCreatePaymentIntent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentData) => {
      const response = await api.post(API_ENDPOINTS.CREATE_PAYMENT_INTENT, paymentData);
      return response.data.paymentIntent;
    },
    onSuccess: (paymentIntent) => {
      // Cache the payment intent
      if (paymentIntent.metadata?.order_id) {
        queryClient.setQueryData(
          PAYMENT_QUERY_KEYS.status(paymentIntent.metadata.order_id),
          paymentIntent
        );
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create payment intent';
      toast.error(message);
    },
  });
};

// Confirm payment
export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (confirmationData) => {
      const response = await api.post(API_ENDPOINTS.CONFIRM_PAYMENT, confirmationData);
      return response.data;
    },
    onSuccess: (result) => {
      // Update payment status in cache
      if (result.order) {
        queryClient.setQueryData(
          PAYMENT_QUERY_KEYS.status(result.order._id),
          result.payment
        );
        
        // Invalidate order data to get updated status
        queryClient.invalidateQueries({ 
          queryKey: ['orders', 'detail', result.order._id] 
        });
        
        // Invalidate user orders to refresh the list
        queryClient.invalidateQueries({ 
          queryKey: ['orders', 'user'] 
        });
      }
      
      if (result.success) {
        toast.success('Payment completed successfully!');
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || 
                     error.response?.data?.error?.message || 
                     'Payment confirmation failed';
      toast.error(message);
    },
  });
};

// Process mock payment (for demonstration)
export const useMockPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, paymentMethod, amount }) => {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await api.post(API_ENDPOINTS.CONFIRM_PAYMENT, {
        orderId,
        paymentMethod,
        amount,
        mockPayment: true
      });
      
      return response.data.data;
    },
    onSuccess: (paymentResult) => {
      // Update payment status in cache
      if (paymentResult.orderId) {
        queryClient.setQueryData(
          PAYMENT_QUERY_KEYS.status(paymentResult.orderId),
          paymentResult
        );
        
        // Invalidate order data to get updated status
        queryClient.invalidateQueries({ 
          queryKey: ['orders', 'detail', paymentResult.orderId] 
        });
      }
      
      toast.success('Mock payment completed successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Mock payment failed';
      toast.error(message);
    },
  });
};