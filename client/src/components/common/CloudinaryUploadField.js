import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  Alert,
  Tooltip,
  Stack
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import cloudinaryService from '../../services/cloudinaryService';

const CloudinaryUploadField = ({
  label = 'Media Files',
  value = [], // Array of URLs
  onChange,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    'video/*': ['.mp4', '.webm', '.mov', '.avi']
  },
  showPreview = true,
  disabled = false,
  error = null,
  helperText = null,
  folder = 'arrow3/drones'
}) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewDialog, setPreviewDialog] = useState({ open: false, media: null });
  const [isUploading, setIsUploading] = useState(false);

  // Initialize Cloudinary for image display
  const cld = new Cloudinary({
    cloud: {
      cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
    }
  });

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (disabled || isUploading) return;

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => 
        `${file.file.name}: ${file.errors.map(e => e.message).join(', ')}`
      );
      console.error('File upload errors:', errors);
      return;
    }

    // Check if adding these files would exceed maxFiles
    if (value.length + acceptedFiles.length > maxFiles) {
      alert(`Cannot upload more than ${maxFiles} files. Current: ${value.length}, Trying to add: ${acceptedFiles.length}`);
      return;
    }

    setIsUploading(true);

    // Initialize progress tracking
    const initialProgress = {};
    acceptedFiles.forEach((file, index) => {
      const progressId = `upload-${Date.now()}-${index}`;
      initialProgress[progressId] = {
        name: file.name,
        progress: 0,
        status: 'uploading',
        file
      };
    });
    setUploadProgress(initialProgress);

    try {
      // Upload files to Cloudinary
      const uploadResults = await cloudinaryService.uploadMultipleFiles(acceptedFiles, {
        folder,
        tags: ['arrow3', 'drone']
      });

      // Process results
      const successfulUploads = [];
      const failedUploads = [];

      uploadResults.forEach((result, index) => {
        const progressId = Object.keys(initialProgress)[index];
        
        if (result.success) {
          successfulUploads.push(result.data.secure_url);
          setUploadProgress(prev => ({
            ...prev,
            [progressId]: {
              ...prev[progressId],
              progress: 100,
              status: 'completed',
              url: result.data.secure_url
            }
          }));
        } else {
          failedUploads.push({
            name: acceptedFiles[index].name,
            error: result.error
          });
          setUploadProgress(prev => ({
            ...prev,
            [progressId]: {
              ...prev[progressId],
              progress: 0,
              status: 'error',
              error: result.error
            }
          }));
        }
      });

      // Update the value with successful uploads
      if (successfulUploads.length > 0) {
        const newValue = [...value, ...successfulUploads];
        onChange(newValue);
      }

      // Show error messages for failed uploads
      if (failedUploads.length > 0) {
        const errorMessage = failedUploads.map(f => `${f.name}: ${f.error}`).join('\n');
        alert(`Some uploads failed:\n${errorMessage}`);
      }

      // Clear progress after delay
      setTimeout(() => {
        setUploadProgress({});
      }, 3000);

    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      setUploadProgress({});
    } finally {
      setIsUploading(false);
    }
  }, [value, onChange, disabled, isUploading, maxFiles, folder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    disabled: disabled || isUploading
  });

  const handleDelete = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handlePreview = (url) => {
    setPreviewDialog({ open: true, media: { url, type: getMediaType(url) } });
  };

  const getMediaType = (url) => {
    if (!url) return 'image';
    
    // Check if it's a video based on Cloudinary URL or file extension
    if (url.includes('/video/') || url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')) {
      return 'video';
    }
    return 'image';
  };

  const renderCloudinaryImage = (url, alt = 'Media') => {
    try {
      const publicId = cloudinaryService.extractPublicId(url);
      if (!publicId) {
        // Fallback to regular img tag
        return (
          <img
            src={url}
            alt={alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        );
      }

      const img = cld
        .image(publicId)
        .format(format.auto())
        .quality(quality.auto())
        .resize(auto().gravity(autoGravity()).width(200).height(150));

      return <AdvancedImage cldImg={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    } catch (error) {
      console.error('Error rendering Cloudinary image:', error);
      return (
        <img
          src={url}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      );
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
        {label}
      </Typography>

      {/* Upload Area */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: error ? '#f44336' : (isDragActive ? '#00ff88' : '#333'),
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: disabled || isUploading ? '#1a1a1a' : (isDragActive ? '#1a1a1a' : '#0a0a0a'),
          transition: 'all 0.3s ease',
          opacity: disabled || isUploading ? 0.5 : 1,
          '&:hover': (disabled || isUploading) ? {} : {
            borderColor: '#00ff88',
            backgroundColor: '#1a1a1a'
          }
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: '#00ff88', mb: 1 }} />
        
        {isUploading ? (
          <Typography variant="body1" sx={{ color: '#00ff88', mb: 1 }}>
            Uploading to Cloudinary...
          </Typography>
        ) : isDragActive ? (
          <Typography variant="body1" sx={{ color: '#00ff88', mb: 1 }}>
            Drop files here...
          </Typography>
        ) : (
          <Typography variant="body1" sx={{ color: 'white', mb: 1 }}>
            Drag & drop files here, or click to select
          </Typography>
        )}
        
        <Typography variant="body2" sx={{ color: '#aaa', mb: 1 }}>
          {Object.keys(acceptedTypes).join(', ')} files
        </Typography>
        
        <Typography variant="caption" sx={{ color: '#666' }}>
          Max {maxFiles} files • Max {Math.round(maxSize / (1024 * 1024))}MB per file
        </Typography>
        
        <Typography variant="caption" sx={{ color: '#00ff88', display: 'block', mt: 1 }}>
          ☁️ Powered by Cloudinary
        </Typography>
      </Box>

      {/* Error Message */}
      {error && (
        <Typography variant="caption" sx={{ color: '#f44336', mt: 1, display: 'block' }}>
          {error}
        </Typography>
      )}

      {/* Helper Text */}
      {helperText && (
        <Typography variant="caption" sx={{ color: '#aaa', mt: 1, display: 'block' }}>
          {helperText}
        </Typography>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
            Upload Progress
          </Typography>
          
          {Object.entries(uploadProgress).map(([key, file]) => (
            <Box key={key} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#aaa', fontSize: '0.75rem' }}>
                  {file.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {file.status === 'completed' && <CheckIcon sx={{ fontSize: 16, color: '#4caf50' }} />}
                  {file.status === 'error' && <ErrorIcon sx={{ fontSize: 16, color: '#f44336' }} />}
                  <Chip
                    label={file.status}
                    size="small"
                    color={
                      file.status === 'completed' ? 'success' :
                      file.status === 'error' ? 'error' : 'primary'
                    }
                    sx={{ height: 16, fontSize: '0.6rem' }}
                  />
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={file.progress}
                sx={{
                  height: 4,
                  backgroundColor: '#333',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: 
                      file.status === 'completed' ? '#4caf50' :
                      file.status === 'error' ? '#f44336' : '#00ff88'
                  }
                }}
              />
              {file.error && (
                <Typography variant="caption" sx={{ color: '#f44336', fontSize: '0.7rem' }}>
                  Error: {file.error}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Media Preview Grid */}
      {showPreview && value.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ color: 'white', mb: 2 }}>
            Uploaded Files ({value.length})
          </Typography>

          <Grid container spacing={2}>
            {value.map((url, index) => (
              <Grid item xs={6} sm={4} md={3} key={`media-${index}`}>
                <MediaPreviewCard
                  url={url}
                  index={index}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                  getMediaType={getMediaType}
                  renderCloudinaryImage={renderCloudinaryImage}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Preview Dialog */}
      <MediaPreviewDialog
        open={previewDialog.open}
        media={previewDialog.media}
        onClose={() => setPreviewDialog({ open: false, media: null })}
        renderCloudinaryImage={renderCloudinaryImage}
      />
    </Box>
  );
};

// Media Preview Card Component
const MediaPreviewCard = ({ 
  url, 
  index, 
  onDelete, 
  onPreview, 
  getMediaType,
  renderCloudinaryImage
}) => {
  const mediaType = getMediaType(url);

  return (
    <Card 
      sx={{ 
        backgroundColor: '#1a1a1a', 
        border: '1px solid #333',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: '#00ff88'
        }
      }}
    >
      <CardMedia
        sx={{ 
          height: 120, 
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a'
        }}
      >
        {mediaType === 'image' ? (
          renderCloudinaryImage(url, `Media ${index + 1}`)
        ) : (
          <Box sx={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#2a2a2a'
          }}>
            <VideoIcon sx={{ fontSize: 32, color: '#00ff88' }} />
          </Box>
        )}
        
        {/* Type indicator */}
        <Chip
          label={mediaType.toUpperCase()}
          size="small"
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: mediaType === 'image' ? '#4caf50' : '#2196f3',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.6rem',
            height: 16
          }}
        />

        {/* Cloudinary badge */}
        <Chip
          label="☁️"
          size="small"
          sx={{
            position: 'absolute',
            top: 4,
            left: 4,
            backgroundColor: 'rgba(0, 255, 136, 0.8)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.6rem',
            height: 16,
            minWidth: 20
          }}
        />
      </CardMedia>
      
      <CardActions sx={{ p: 1, justifyContent: 'center' }}>
        <Tooltip title="Preview">
          <IconButton
            size="small"
            onClick={() => onPreview(url)}
            sx={{ color: '#4fc3f7' }}
          >
            <ViewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            onClick={() => onDelete(index)}
            sx={{ color: '#f44336' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

// Media Preview Dialog Component
const MediaPreviewDialog = ({ open, media, onClose, renderCloudinaryImage }) => {
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
      <DialogTitle sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
        <span>Media Preview</span>
        <Chip label="☁️ Cloudinary" size="small" sx={{ backgroundColor: '#00ff88', color: 'black' }} />
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
          {media.type === 'image' ? (
            renderCloudinaryImage(media.url, 'Preview')
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

export default CloudinaryUploadField;