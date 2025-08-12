import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, API_ENDPOINTS } from '../../utils';
import toast from 'react-hot-toast';

// Query keys
export const DRONE_QUERY_KEYS = {
  all: ['drones'],
  lists: () => [...DRONE_QUERY_KEYS.all, 'list'],
  list: (filters) => [...DRONE_QUERY_KEYS.lists(), { filters }],
  details: () => [...DRONE_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...DRONE_QUERY_KEYS.details(), id],
};

// Fetch all drones
export const useDrones = (filters = {}) => {
  return useQuery({
    queryKey: DRONE_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await api.get(`${API_ENDPOINTS.DRONES}?${params}`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch single drone
export const useDrone = (droneId, options = {}) => {
  return useQuery({
    queryKey: DRONE_QUERY_KEYS.detail(droneId),
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.DRONE_BY_ID(droneId));
      return response.data.data;
    },
    enabled: !!droneId,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    ...options,
  });
};

// Create drone (admin only)
export const useCreateDrone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (droneData) => {
      const response = await api.post(API_ENDPOINTS.DRONES, droneData);
      return response.data.data;
    },
    onSuccess: (newDrone) => {
      // Invalidate and refetch drones list
      queryClient.invalidateQueries({ queryKey: DRONE_QUERY_KEYS.lists() });
      
      // Add the new drone to the cache
      queryClient.setQueryData(
        DRONE_QUERY_KEYS.detail(newDrone._id),
        newDrone
      );
      
      toast.success('Drone created successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create drone';
      toast.error(message);
    },
  });
};

// Update drone (admin only)
export const useUpdateDrone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ droneId, droneData }) => {
      const response = await api.put(API_ENDPOINTS.DRONE_BY_ID(droneId), droneData);
      return response.data.data;
    },
    onSuccess: (updatedDrone) => {
      // Update the drone in cache
      queryClient.setQueryData(
        DRONE_QUERY_KEYS.detail(updatedDrone._id),
        updatedDrone
      );
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: DRONE_QUERY_KEYS.lists() });
      
      toast.success('Drone updated successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update drone';
      toast.error(message);
    },
  });
};

// Delete drone (admin only)
export const useDeleteDrone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (droneId) => {
      await api.delete(API_ENDPOINTS.DRONE_BY_ID(droneId));
      return droneId;
    },
    onSuccess: (deletedDroneId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: DRONE_QUERY_KEYS.detail(deletedDroneId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: DRONE_QUERY_KEYS.lists() });
      
      toast.success('Drone deleted successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to delete drone';
      toast.error(message);
    },
  });
};

// Upload drone media (admin only)
export const useUploadDroneMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ droneId, mediaFiles }) => {
      const formData = new FormData();
      
      // Append files to form data
      mediaFiles.forEach((file, index) => {
        if (file.type.startsWith('image/')) {
          formData.append('images', file);
        } else if (file.type.startsWith('video/')) {
          formData.append('videos', file);
        }
      });
      
      const response = await api.post(
        API_ENDPOINTS.DRONE_MEDIA(droneId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    },
    onSuccess: (updatedDrone) => {
      // Update the drone in cache
      queryClient.setQueryData(
        DRONE_QUERY_KEYS.detail(updatedDrone._id),
        updatedDrone
      );
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: DRONE_QUERY_KEYS.lists() });
      
      toast.success('Media uploaded successfully!');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to upload media';
      toast.error(message);
    },
  });
};

// Search drones
export const useSearchDrones = (searchTerm, options = {}) => {
  return useQuery({
    queryKey: [...DRONE_QUERY_KEYS.lists(), 'search', searchTerm],
    queryFn: async () => {
      const response = await api.get(`${API_ENDPOINTS.DRONES}?search=${encodeURIComponent(searchTerm)}`);
      return response.data.data;
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    ...options,
  });
};