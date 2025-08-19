import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  Alert,
  Tooltip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  useTheme
} from '@mui/material';
import {
  PhotoLibrary as MediaIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  DragIndicator as DragIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useDrones } from '../../hooks/queries/useDroneQueries';
import { useMediaUpload, useMediaDelete, useDroneMedia } from '../../hooks/queries/useMediaQueries';
import { CloudinaryUploadField } from '../../components/common';
import cloudinaryService from '../../services/cloudinaryService';
import { adminStyles } from '../../utils/adminTheme';

const MediaManagement = () => {
  const theme = useTheme();
  const [selectedDroneId, setSelectedDroneId] = useState('');
  const [uploadDialog, setUploadDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, media: null });
  const [previewDialog, setPreviewDialog] = useState({ open: false, media: null });

  // Fetch drones for selection
  const { data: dronesData, isLoading: isLoadingDrones } = useDrones();
  
  // Fetch media for selected drone
  const { data: mediaData, isLoading: isLoadingMedia, refetch: refetchMedia } = useDroneMedia(selectedDroneId, {
    enabled: !!selectedDroneId
  });

  // Mutations
  const uploadMutation = useMediaUpload();
  const deleteMutation = useMediaDelete();

  const handleDroneSelect = (droneId) => {
    setSelectedDroneId(droneId);
  };

  const handleUploadClick = () => {
    if (!selectedDroneId) {
      alert('Please select a drone first');
      return;
    }
    setUploadDialog(true);
  };

  const handleDeleteClick = (media) => {
    setDeleteDialog({ open: true, media });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.media && selectedDroneId) {
      try {
        const isImage = deleteDialog.media.type === 'image';
        await deleteMutation.mutateAsync({
          droneId: selectedDroneId,
          imageUrls: isImage ? [deleteDialog.media.url] : [],
          videoUrls: isImage ? [] : [deleteDialog.media.url]
        });
        setDeleteDialog({ open: false, media: null });
        refetchMedia();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handlePreviewClick = (media) => {
    setPreviewDialog({ open: true, media });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMediaType = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (videoExtensions.includes(extension)) return 'video';
    return 'unknown';
  };

  const selectedDrone = dronesData?.drones?.find(drone => drone._id === selectedDroneId);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: 'white',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <MediaIcon sx={{ color: theme.palette.primary.main }} />
          Media Management
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Tooltip title="Refresh Media">
            <IconButton 
              onClick={() => refetchMedia()}
              sx={{ color: theme.palette.primary.main }}
              disabled={!selectedDroneId || isLoadingMedia}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleUploadClick}
            disabled={!selectedDroneId}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: '#000',
              '&:hover': {
                backgroundColor: '#00cc6a',
              },
              '&:disabled': {
                backgroundColor: '#333',
                color: '#666'
              }
            }}
          >
            Upload Media
          </Button>
        </Stack>
      </Box>

      {/* Drone Selection */}
      <Paper sx={{ p: 3, backgroundColor: '#2a2a2a', border: '1px solid #333', mb: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
          Select Drone
        </Typography>
        
        <FormControl fullWidth>
          <InputLabel sx={{ color: '#aaa' }}>Choose a drone to manage media</InputLabel>
          <Select
            value={selectedDroneId}
            onChange={(e) => handleDroneSelect(e.target.value)}
            label="Choose a drone to manage media"
            disabled={isLoadingDrones}
            sx={{
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main }
            }}
          >
            {dronesData?.drones?.map((drone) => (
              <MenuItem key={drone._id} value={drone._id}>
                {drone.name} ({drone.model})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedDrone && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#1a1a1a', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: '#aaa' }}>
              Selected: <strong style={{ color: theme.palette.primary.main }}>{selectedDrone.name}</strong>
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Current media: {mediaData?.drone?.totalImages || 0} images, {mediaData?.drone?.totalVideos || 0} videos
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Media Grid */}
      {selectedDroneId && (
        <Paper sx={{ p: 3, backgroundColor: '#2a2a2a', border: '1px solid #333' }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Media Files
          </Typography>

          {isLoadingMedia ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress sx={{ color: theme.palette.primary.main }} />
              <Typography sx={{ color: '#aaa', ml: 2 }}>
                Loading media...
              </Typography>
            </Box>
          ) : mediaData?.drone && (mediaData.drone.images.length > 0 || mediaData.drone.videos.length > 0) ? (
            <Grid container spacing={2}>
              {/* Images */}
              {mediaData.drone.images.map((imageUrl, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`image-${index}`}>
                  <MediaCard
                    media={{
                      url: imageUrl,
                      type: 'image',
                      name: `Image ${index + 1}`
                    }}
                    onDelete={handleDeleteClick}
                    onPreview={handlePreviewClick}
                  />
                </Grid>
              ))}
              
              {/* Videos */}
              {mediaData.drone.videos.map((videoUrl, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`video-${index}`}>
                  <MediaCard
                    media={{
                      url: videoUrl,
                      type: 'video',
                      name: `Video ${index + 1}`
                    }}
                    onDelete={handleDeleteClick}
                    onPreview={handlePreviewClick}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MediaIcon sx={{ fontSize: 64, color: '#333', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#aaa', mb: 1 }}>
                No media files found
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Upload some images or videos to get started
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Upload Dialog */}
      <MediaUploadDialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        droneId={selectedDroneId}
        droneName={selectedDrone?.name}
        onUploadComplete={() => {
          setUploadDialog(false);
          refetchMedia();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, media: null })}
        PaperProps={{
          sx: {
            backgroundColor: '#2a2a2a',
            border: '1px solid #333',
          },
        }}
      >
        <DialogTitle sx={{ color: 'white' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#aaa' }}>
            Are you sure you want to delete this {deleteDialog.media?.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, media: null })}
            sx={{ color: '#aaa' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isLoading}
            startIcon={deleteMutation.isLoading ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <MediaPreviewDialog
        open={previewDialog.open}
        media={previewDialog.media}
        onClose={() => setPreviewDialog({ open: false, media: null })}
      />
    </Box>
  );
};

// Media Card Component
const MediaCard = ({ media, onDelete, onPreview }) => {
  return (
    <Card sx={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}>
      <CardMedia
        sx={{ 
          height: 200, 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a'
        }}
      >
        {media.type === 'image' ? (
          <img
            src={media.url}
            alt={media.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : (
          <video
            src={media.url}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        )}
        
        {/* Fallback icon */}
        <Box
          sx={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {media.type === 'image' ? (
            <ImageIcon sx={{ fontSize: 48, color: '#333' }} />
          ) : (
            <VideoIcon sx={{ fontSize: 48, color: '#333' }} />
          )}
        </Box>

        {/* Type indicator */}
        <Chip
          label={media.type.toUpperCase()}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: media.type === 'image' ? '#4caf50' : '#2196f3',
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      </CardMedia>
      
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
          {media.name}
        </Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>
          {media.type === 'image' ? 'Image' : 'Video'} file
        </Typography>
      </CardContent>
      
      <CardActions sx={{ pt: 0 }}>
        <Tooltip title="Preview">
          <IconButton
            size="small"
            onClick={() => onPreview(media)}
            sx={{ color: '#4fc3f7' }}
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={() => onDelete(media)}
            sx={{ color: '#f44336' }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

// Cloudinary Media Upload Dialog Component
const MediaUploadDialog = ({ open, onClose, droneId, droneName, onUploadComplete }) => {
  const theme = useTheme();
  const [mediaUrls, setMediaUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleMediaChange = async (newMediaUrls) => {
    setMediaUrls(newMediaUrls);
    
    if (newMediaUrls.length > 0 && droneId) {
      setIsUploading(true);
      try {
        // Update the drone with new media URLs
        const images = newMediaUrls.filter(url => 
          url.includes('/image/') || 
          url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
        );
        const videos = newMediaUrls.filter(url => 
          url.includes('/video/') || 
          url.match(/\.(mp4|webm|mov|avi)(\?|$)/i)
        );

        // Here you would call an API to update the drone with new media URLs
        // For now, we'll just trigger the upload complete callback
        setTimeout(() => {
          onUploadComplete();
          handleClose();
        }, 1000);
        
      } catch (error) {
        console.error('Error updating drone media:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleClose = () => {
    setMediaUrls([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#2a2a2a',
          border: '1px solid #333',
        },
      }}
    >
      <DialogTitle sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <span>Upload Media - {droneName}</span>
        <Chip label="☁️ Cloudinary" size="small" sx={{ backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText }} />
      </DialogTitle>
      
      <DialogContent>
        <CloudinaryUploadField
          label="Upload Media Files"
          value={mediaUrls}
          onChange={handleMediaChange}
          maxFiles={20}
          maxSize={50 * 1024 * 1024} // 50MB
          acceptedTypes={{
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
            'video/*': ['.mp4', '.webm', '.mov', '.avi']
          }}
          showPreview={true}
          folder={`arrow3/drones/${droneId}`}
          helperText="Files are uploaded directly to Cloudinary for optimal performance and reliability."
          disabled={isUploading}
        />
        
        {isUploading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
            <Typography variant="body2" sx={{ color: '#aaa' }}>
              Updating drone media...
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} sx={{ color: '#aaa' }} disabled={isUploading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Media Preview Dialog Component
const MediaPreviewDialog = ({ open, media, onClose }) => {
  if (!media) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #333',
        },
      }}
    >
      <DialogTitle sx={{ color: 'white' }}>
        {media.name}
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt={media.name}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          ) : (
            <video
              src={media.url}
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#aaa' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MediaManagement;