import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Custom hook for optimistic updates with React Query
 * @param {string|array} queryKey - Query key to update
 * @returns {object} Functions for optimistic updates
 */
export const useOptimisticUpdate = (queryKey) => {
  const queryClient = useQueryClient();

  // Optimistically update data
  const optimisticUpdate = useCallback(async (updater) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Snapshot the previous value
    const previousData = queryClient.getQueryData(queryKey);

    // Optimistically update to the new value
    queryClient.setQueryData(queryKey, updater);

    // Return a context object with the snapshotted value
    return { previousData };
  }, [queryClient, queryKey]);

  // Rollback optimistic update
  const rollback = useCallback((context) => {
    queryClient.setQueryData(queryKey, context.previousData);
  }, [queryClient, queryKey]);

  // Settle the optimistic update
  const settle = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    optimisticUpdate,
    rollback,
    settle,
  };
};

/**
 * Custom hook for optimistic list updates (add, remove, update items)
 * @param {string|array} queryKey - Query key for the list
 * @returns {object} Functions for list operations
 */
export const useOptimisticList = (queryKey) => {
  const { optimisticUpdate, rollback, settle } = useOptimisticUpdate(queryKey);

  // Add item to list optimistically
  const addItem = useCallback(async (newItem) => {
    return optimisticUpdate((oldData) => {
      if (!oldData) return [newItem];
      return Array.isArray(oldData) ? [...oldData, newItem] : [newItem];
    });
  }, [optimisticUpdate]);

  // Remove item from list optimistically
  const removeItem = useCallback(async (itemId, idField = '_id') => {
    return optimisticUpdate((oldData) => {
      if (!oldData || !Array.isArray(oldData)) return oldData;
      return oldData.filter(item => item[idField] !== itemId);
    });
  }, [optimisticUpdate]);

  // Update item in list optimistically
  const updateItem = useCallback(async (itemId, updates, idField = '_id') => {
    return optimisticUpdate((oldData) => {
      if (!oldData || !Array.isArray(oldData)) return oldData;
      return oldData.map(item => 
        item[idField] === itemId 
          ? { ...item, ...updates }
          : item
      );
    });
  }, [optimisticUpdate]);

  return {
    addItem,
    removeItem,
    updateItem,
    rollback,
    settle,
  };
};