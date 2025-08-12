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
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const MediaUploadField = ({
  label = 'Media Files',
  value = [],
  onChange,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    'video/*': ['.mp4', '.webm', '.mov', '.avi']
  },
  showPreview = true,
  allowReorder = true,
  disabled = false,
  error = null,
  helperText = null
}) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewDialog, setPreviewDialog] = useState({ open: false, media: null });

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    if (disabled) return;

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => 
        `${file.file.name}: ${file.errors.map(e => e.message).join(', ')}`
      );
      console.error('File upload errors:', errors);
      return;
    }

    // Simulate upload progress for local files
    const newFiles = acceptedFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      size: file.size,
      isLocal: true
    }));

    // Initialize progress
    const initialProgress = {};
    newFiles.forEach((fileData, index) => {
      initialProgress[`local-${Date.now()}-${index}`] = {
        name: fileData.name,
        progress: 0,
        status: 'uploading'
      };
    });
    setUploadProgress(initialProgress);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const updated = { ...prev };
        let allComplete = true;

        Object.keys(updated).forEach(key => {
          if (updated[key].status === 'uploading') {
            updated[key].progress = Math.min(updated[key].progress + 10, 100);
            if (updated[key].progress === 100) {
              updated[key].status = 'completed';
            } else {
              allComplete = false;
            }
          }
        });

        if (allComplete) {
          clearInterval(progressInterval);
          // Clear progress after a delay
          setTimeout(() => setUploadProgress({}), 1500);
        }

        return updated;
      });
    }, 200);

    // Add files to the current value
    const updatedValue = [...value, ...newFiles];
    onChange(updatedValue);
  }, [value, onChange, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    maxFiles: maxFiles - value.length,
    disabled
  });

  const handleDelete = (index) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handlePreview = (media) => {
    setPreviewDialog({ open: true, media });
  };

  const handleReorder = (result) => {
    if (!result.destination || !allowReorder) return;

    const items = Array.from(value);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onChange(items);
  };

  const getMediaType = (media) => {
    if (media.type) return media.type;
    if (media.file && media.file.type) {
      return media.file.type.startsWith('image/') ? 'image' : 'video';
    }
    // Fallback to URL extension
    const extension = media.url?.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return imageExtensions.includes(extension) ? 'image' : 'video';
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
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#1a1a1a' : (isDragActive ? '#1a1a1a' : '#0a0a0a'),
          transition: 'all 0.3s ease',
          opacity: disabled ? 0.5 : 1,
          '&:hover': disabled ? {} : {
            borderColor: '#00ff88',
            backgroundColor: '#1a1a1a'
          }
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: '#00ff88', mb: 1 }} />
        
        {isDragActive ? (
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#aaa', fontSize: '0.75rem' }}>
                  {file.name}
                </Typography>
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

          {allowReorder ? (
            <DragDropContext onDragEnd={handleReorder}>
              <Droppable droppableId="media-list" direction="horizontal">
                {(provided) => (
                  <Grid
                    container
                    spacing={2}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {value.map((media, index) => (
                      <Draggable
                        key={`media-${index}`}
                        draggableId={`media-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <Grid
                            item
                            xs={6}
                            sm={4}
                            md={3}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <MediaPreviewCard
                              media={media}
                              index={index}
                              onDelete={handleDelete}
                              onPreview={handlePreview}
                              dragHandleProps={provided.dragHandleProps}
                              isDragging={snapshot.isDragging}
                              getMediaType={getMediaType}
                            />
                          </Grid>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Grid>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <Grid container spacing={2}>
              {value.map((media, index) => (
                <Grid item xs={6} sm={4} md={3} key={`media-${index}`}>
                  <MediaPreviewCard
                    media={media}
                    index={index}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                    getMediaType={getMediaType}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Preview Dialog */}
      <MediaPreviewDialog
        open={previewDialog.open}
        media={previewDialog.media}
        onClose={() => setPreviewDialog({ open: false, media: null })}
      />
    </Box>
  );
};

// Media Preview Card Component
const MediaPreviewCard = ({ 
  media, 
  index, 
  onDelete, 
  onPreview, 
  dragHandleProps, 
  isDragging, 
  getMediaType 
}) => {
  const mediaType = getMediaType(media);

  return (
    <Card 
      sx={{ 
        backgroundColor: '#1a1a1a', 
        border: '1px solid #333',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'rotate(5deg)' : 'none',
        transition: 'all 0.2s ease'
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
          {mediaType === 'image' ? (
            <ImageIcon sx={{ fontSize: 32, color: '#333' }} />
          ) : (
            <VideoIcon sx={{ fontSize: 32, color: '#333' }} />
          )}
        </Box>

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

        {/* Drag handle */}
        {dragHandleProps && (
          <Box
            {...dragHandleProps}
            sx={{
              position: 'absolute',
              top: 4,
              left: 4,
              cursor: 'grab',
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '50%',
              p: 0.5,
              '&:active': {
                cursor: 'grabbing'
              }
            }}
          >
            <DragIcon sx={{ fontSize: 16 }} />
          </Box>
        )}
      </CardMedia>
      
      <CardActions sx={{ p: 1, justifyContent: 'center' }}>
        <Tooltip title="Preview">
          <IconButton
            size="small"
            onClick={() => onPreview(media)}
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
const MediaPreviewDialog = ({ open, media, onClose }) => {
  if (!media) return null;

  const mediaType = media.type || (media.file?.type?.startsWith('image/') ? 'image' : 'video');

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
        {media.name || 'Media Preview'}
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
          {mediaType === 'image' ? (
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

export default MediaUploadField;