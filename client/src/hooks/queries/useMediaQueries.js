import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../../utils/api';

// Upload media files for a drone
export const useMediaUpload = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ droneId, formData }) => {
      const response = await api.post(`/media/drones/${droneId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Media files uploaded successfully!');
        // Invalidate related queries
        queryClient.invalidateQueries(['drone-media']);
        queryClient.invalidateQueries(['drones']);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to upload media files';
        toast.error(message);
      },
    }
  );
};

// Get media files for a specific drone
export const useDroneMedia = (droneId, options = {}) => {
  return useQuery(
    ['drone-media', droneId],
    async () => {
      if (!droneId) return null;
      const response = await api.get(`/media/drones/${droneId}`);
      return response.data.data;
    },
    {
      enabled: !!droneId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      ...options,
    }
  );
};

// Delete media files from a drone
export const useMediaDelete = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ droneId, imageUrls = [], videoUrls = [] }) => {
      const response = await api.delete(`/media/drones/${droneId}/media`, {
        data: { imageUrls, videoUrls }
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Media files deleted successfully!');
        // Invalidate related queries
        queryClient.invalidateQueries(['drone-media']);
        queryClient.invalidateQueries(['drones']);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to delete media files';
        toast.error(message);
      },
    }
  );
};

// Reorder media files for a drone
export const useMediaReorder = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ droneId, images, videos }) => {
      const response = await api.post(`/media/drones/${droneId}/reorder`, {
        images,
        videos
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success('Media files reordered successfully!');
        // Invalidate related queries
        queryClient.invalidateQueries(['drone-media']);
        queryClient.invalidateQueries(['drones']);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to reorder media files';
        toast.error(message);
      },
    }
  );
};

// Get all media files (for general media management)
export const useAllMedia = (filters = {}) => {
  return useQuery(
    ['all-media', filters],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/media?${params.toString()}`);
      return response.data.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
};

// Bulk delete media files
export const useBulkMediaDelete = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ mediaItems }) => {
      // Group media items by drone ID
      const groupedByDrone = mediaItems.reduce((acc, item) => {
        if (!acc[item.droneId]) {
          acc[item.droneId] = { imageUrls: [], videoUrls: [] };
        }
        
        if (item.type === 'image') {
          acc[item.droneId].imageUrls.push(item.url);
        } else {
          acc[item.droneId].videoUrls.push(item.url);
        }
        
        return acc;
      }, {});

      // Delete media for each drone
      const deletePromises = Object.entries(groupedByDrone).map(([droneId, urls]) =>
        api.delete(`/media/drones/${droneId}/media`, {
          data: urls
        })
      );

      const responses = await Promise.all(deletePromises);
      return responses.map(response => response.data);
    },
    {
      onSuccess: () => {
        toast.success('Selected media files deleted successfully!');
        // Invalidate related queries
        queryClient.invalidateQueries(['drone-media']);
        queryClient.invalidateQueries(['drones']);
        queryClient.invalidateQueries(['all-media']);
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Failed to delete selected media files';
        toast.error(message);
      },
    }
  );
};