import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Autocomplete
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useDrone, useCreateDrone, useUpdateDrone } from '../../../hooks/queries/useDroneQueries';
import { MediaUploadField } from '../../../components/common';

const CAMERA_RESOLUTIONS = ['720p', '1080p', '4K', '6K', '8K', 'No Camera'];
const STABILIZATION_TYPES = ['None', 'Electronic', '2-Axis Gimbal', '3-Axis Gimbal', 'AI Stabilization'];
const CATEGORIES = ['camera', 'handheld', 'power', 'specialized'];
const APP_PLATFORMS = ['iOS', 'Android', 'Windows', 'macOS', 'Web'];
const AI_MODES = [
  'Follow Me',
  'Orbit Mode',
  'Waypoint Navigation',
  'Gesture Control',
  'ActiveTrack',
  'QuickShot',
  'Sport Mode',
  'Cinematic Mode',
  'Portrait Mode',
  'Night Mode'
];

const DroneForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = mode === 'edit' && id;

  // Fetch drone data for edit mode
  const { data: droneData, isLoading: isLoadingDrone } = useDrone(id, {
    enabled: isEditMode,
  });

  // Mutations
  const createDroneMutation = useCreateDrone();
  const updateDroneMutation = useUpdateDrone();

  // Form state
  const [mediaFiles, setMediaFiles] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: '',
      model: '',
      price: '',
      description: '',
      category: 'camera',
      specifications: {
        weight: '',
        dimensions: {
          length: '',
          width: '',
          height: ''
        },
        batteryCapacity: '',
        flightTime: '',
        maxSpeed: '',
        cameraResolution: '4K',
        stabilization: '3-Axis Gimbal',
        controlRange: '',
        gpsSupport: true,
        obstacleAvoidance: false,
        returnToHome: true,
        windResistanceLevel: 5,
        appCompatibility: ['iOS', 'Android'],
        aiModes: []
      },
      stockQuantity: 0,
      inStock: true,
      featured: false
    }
  });

  // Load drone data into form when editing
  useEffect(() => {
    if (isEditMode && droneData?.drone) {
      const drone = droneData.drone;
      reset({
        name: drone.name,
        model: drone.model,
        price: drone.price,
        description: drone.description,
        category: drone.category,
        specifications: {
          weight: drone.specifications.weight,
          dimensions: {
            length: drone.specifications.dimensions.length,
            width: drone.specifications.dimensions.width,
            height: drone.specifications.dimensions.height
          },
          batteryCapacity: drone.specifications.batteryCapacity,
          flightTime: drone.specifications.flightTime,
          maxSpeed: drone.specifications.maxSpeed,
          cameraResolution: drone.specifications.cameraResolution,
          stabilization: drone.specifications.stabilization,
          controlRange: drone.specifications.controlRange,
          gpsSupport: drone.specifications.gpsSupport,
          obstacleAvoidance: drone.specifications.obstacleAvoidance,
          returnToHome: drone.specifications.returnToHome,
          windResistanceLevel: drone.specifications.windResistanceLevel,
          appCompatibility: drone.specifications.appCompatibility || ['iOS', 'Android'],
          aiModes: drone.specifications.aiModes || []
        },
        stockQuantity: drone.stockQuantity,
        inStock: drone.inStock,
        featured: drone.featured
      });
      
      // Convert existing URLs to media file objects
      const existingMedia = [];
      if (drone.images?.length > 0) {
        drone.images.forEach((url, index) => {
          existingMedia.push({
            url,
            name: `Image ${index + 1}`,
            type: 'image',
            isExisting: true
          });
        });
      }
      if (drone.videos?.length > 0) {
        drone.videos.forEach((url, index) => {
          existingMedia.push({
            url,
            name: `Video ${index + 1}`,
            type: 'video',
            isExisting: true
          });
        });
      }
      setMediaFiles(existingMedia);
    }
  }, [isEditMode, droneData, reset]);

  const onSubmit = async (data) => {
    try {
      // Separate existing URLs from new files
      const existingImages = mediaFiles.filter(m => m.type === 'image' && m.isExisting).map(m => m.url);
      const existingVideos = mediaFiles.filter(m => m.type === 'video' && m.isExisting).map(m => m.url);
      const newFiles = mediaFiles.filter(m => !m.isExisting);

      const formData = {
        ...data,
        images: existingImages,
        videos: existingVideos,
        price: parseFloat(data.price),
        specifications: {
          ...data.specifications,
          weight: parseFloat(data.specifications.weight),
          dimensions: {
            length: parseFloat(data.specifications.dimensions.length),
            width: parseFloat(data.specifications.dimensions.width),
            height: parseFloat(data.specifications.dimensions.height)
          },
          batteryCapacity: parseFloat(data.specifications.batteryCapacity),
          flightTime: parseFloat(data.specifications.flightTime),
          maxSpeed: parseFloat(data.specifications.maxSpeed),
          controlRange: parseFloat(data.specifications.controlRange),
          windResistanceLevel: parseInt(data.specifications.windResistanceLevel)
        },
        stockQuantity: parseInt(data.stockQuantity)
      };

      let droneId = id;
      
      // Create or update the drone first
      if (isEditMode) {
        await updateDroneMutation.mutateAsync({ droneId: id, droneData: formData });
      } else {
        const result = await createDroneMutation.mutateAsync(formData);
        droneId = result.data._id;
      }

      // Upload new files if any
      if (newFiles.length > 0) {
        const uploadFormData = new FormData();
        newFiles.forEach(mediaFile => {
          if (mediaFile.file) {
            uploadFormData.append('files', mediaFile.file);
          }
        });

        try {
          await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/media/drones/${droneId}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: uploadFormData
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          // Don't fail the entire operation if file upload fails
        }
      }

      navigate('/admin/products');
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const handleMediaChange = (newMediaFiles) => {
    setMediaFiles(newMediaFiles);
  };

  if (isEditMode && isLoadingDrone) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#00ff88' }} />
        <Typography sx={{ color: '#aaa', ml: 2 }}>
          Loading drone data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 'bold' }}>
        {isEditMode ? 'Edit Drone' : 'Add New Drone'}
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: '#2a2a2a', border: '1px solid #333' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Basic Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Drone name is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Drone Name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="model"
                    control={control}
                    rules={{ required: 'Model is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Model"
                        error={!!errors.model}
                        helperText={errors.model?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="price"
                    control={control}
                    rules={{ 
                      required: 'Price is required',
                      min: { value: 0, message: 'Price must be positive' }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Price"
                        type="number"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        error={!!errors.price}
                        helperText={errors.price?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="category"
                    control={control}
                    rules={{ required: 'Category is required' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.category}>
                        <InputLabel sx={{ color: '#aaa' }}>Category</InputLabel>
                        <Select
                          {...field}
                          label="Category"
                          sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
                          }}
                        >
                          {CATEGORIES.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    rules={{ required: 'Description is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Description"
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Technical Specifications */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: '#2a2a2a', border: '1px solid #333' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Technical Specifications
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.weight"
                    control={control}
                    rules={{ required: 'Weight is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Weight"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">g</InputAdornment>,
                        }}
                        error={!!errors.specifications?.weight}
                        helperText={errors.specifications?.weight?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.batteryCapacity"
                    control={control}
                    rules={{ required: 'Battery capacity is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Battery Capacity"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">mAh</InputAdornment>,
                        }}
                        error={!!errors.specifications?.batteryCapacity}
                        helperText={errors.specifications?.batteryCapacity?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.flightTime"
                    control={control}
                    rules={{ required: 'Flight time is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Flight Time"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">min</InputAdornment>,
                        }}
                        error={!!errors.specifications?.flightTime}
                        helperText={errors.specifications?.flightTime?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.maxSpeed"
                    control={control}
                    rules={{ required: 'Max speed is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Max Speed"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">km/h</InputAdornment>,
                        }}
                        error={!!errors.specifications?.maxSpeed}
                        helperText={errors.specifications?.maxSpeed?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.controlRange"
                    control={control}
                    rules={{ required: 'Control range is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Control Range"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">m</InputAdornment>,
                        }}
                        error={!!errors.specifications?.controlRange}
                        helperText={errors.specifications?.controlRange?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.windResistanceLevel"
                    control={control}
                    rules={{ required: 'Wind resistance level is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Wind Resistance Level"
                        type="number"
                        inputProps={{ min: 1, max: 10 }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">/10</InputAdornment>,
                        }}
                        error={!!errors.specifications?.windResistanceLevel}
                        helperText={errors.specifications?.windResistanceLevel?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3, backgroundColor: '#333' }} />

              {/* Dimensions */}
              <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                Dimensions (cm)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.dimensions.length"
                    control={control}
                    rules={{ required: 'Length is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Length"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                        }}
                        error={!!errors.specifications?.dimensions?.length}
                        helperText={errors.specifications?.dimensions?.length?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.dimensions.width"
                    control={control}
                    rules={{ required: 'Width is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Width"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                        }}
                        error={!!errors.specifications?.dimensions?.width}
                        helperText={errors.specifications?.dimensions?.width?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.dimensions.height"
                    control={control}
                    rules={{ required: 'Height is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Height"
                        type="number"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                        }}
                        error={!!errors.specifications?.dimensions?.height}
                        helperText={errors.specifications?.dimensions?.height?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3, backgroundColor: '#333' }} />

              {/* Camera and Stabilization */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="specifications.cameraResolution"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#aaa' }}>Camera Resolution</InputLabel>
                        <Select
                          {...field}
                          label="Camera Resolution"
                          sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
                          }}
                        >
                          {CAMERA_RESOLUTIONS.map((resolution) => (
                            <MenuItem key={resolution} value={resolution}>
                              {resolution}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="specifications.stabilization"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#aaa' }}>Stabilization</InputLabel>
                        <Select
                          {...field}
                          label="Stabilization"
                          sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
                          }}
                        >
                          {STABILIZATION_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3, backgroundColor: '#333' }} />

              {/* Features */}
              <Typography variant="subtitle1" sx={{ color: 'white', mb: 2 }}>
                Features
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.gpsSupport"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#00ff88',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#00ff88',
                              },
                            }}
                          />
                        }
                        label="GPS Support"
                        sx={{ color: 'white' }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.obstacleAvoidance"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#00ff88',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#00ff88',
                              },
                            }}
                          />
                        }
                        label="Obstacle Avoidance"
                        sx={{ color: 'white' }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="specifications.returnToHome"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#00ff88',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#00ff88',
                              },
                            }}
                          />
                        }
                        label="Return to Home"
                        sx={{ color: 'white' }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3, backgroundColor: '#333' }} />

              {/* App Compatibility */}
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="specifications.appCompatibility"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        multiple
                        options={APP_PLATFORMS}
                        value={field.value || []}
                        onChange={(_, newValue) => field.onChange(newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              {...getTagProps({ index })}
                              key={option}
                              sx={{ color: '#00ff88', borderColor: '#00ff88' }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="App Compatibility"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: '#333' },
                                '&:hover fieldset': { borderColor: '#00ff88' },
                                '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                              },
                              '& .MuiInputLabel-root': { color: '#aaa' }
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Controller
                    name="specifications.aiModes"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        multiple
                        options={AI_MODES}
                        value={field.value || []}
                        onChange={(_, newValue) => field.onChange(newValue)}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              {...getTagProps({ index })}
                              key={option}
                              sx={{ color: '#00ff88', borderColor: '#00ff88' }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="AI Modes"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                color: 'white',
                                '& fieldset': { borderColor: '#333' },
                                '&:hover fieldset': { borderColor: '#00ff88' },
                                '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                              },
                              '& .MuiInputLabel-root': { color: '#aaa' }
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Media Upload */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: '#2a2a2a', border: '1px solid #333' }}>
              <MediaUploadField
                label="Drone Media Files"
                value={mediaFiles}
                onChange={handleMediaChange}
                maxFiles={20}
                maxSize={50 * 1024 * 1024} // 50MB
                acceptedTypes={{
                  'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
                  'video/*': ['.mp4', '.webm', '.mov', '.avi']
                }}
                showPreview={true}
                allowReorder={true}
                helperText="Upload images and videos for this drone. You can drag and drop files or click to select. Existing media will be preserved."
              />
            </Paper>
          </Grid>

          {/* Inventory & Settings */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, backgroundColor: '#2a2a2a', border: '1px solid #333' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Inventory & Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Controller
                    name="stockQuantity"
                    control={control}
                    rules={{ required: 'Stock quantity is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Stock Quantity"
                        type="number"
                        inputProps={{ min: 0 }}
                        error={!!errors.stockQuantity}
                        helperText={errors.stockQuantity?.message}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: '#333' },
                            '&:hover fieldset': { borderColor: '#00ff88' },
                            '&.Mui-focused fieldset': { borderColor: '#00ff88' }
                          },
                          '& .MuiInputLabel-root': { color: '#aaa' }
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="inStock"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#00ff88',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#00ff88',
                              },
                            }}
                          />
                        }
                        label="In Stock"
                        sx={{ color: 'white' }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Controller
                    name="featured"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            {...field}
                            checked={field.value}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#00ff88',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#00ff88',
                              },
                            }}
                          />
                        }
                        label="Featured"
                        sx={{ color: 'white' }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Form Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                sx={{
                  color: '#aaa',
                  borderColor: '#333',
                  '&:hover': {
                    borderColor: '#aaa',
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={isSubmitting ? <CircularProgress size={16} /> : <SaveIcon />}
                disabled={isSubmitting}
                sx={{
                  backgroundColor: '#00ff88',
                  color: '#000',
                  '&:hover': {
                    backgroundColor: '#00cc6a',
                  },
                  '&:disabled': {
                    backgroundColor: '#333',
                    color: '#666',
                  },
                }}
              >
                {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Drone' : 'Create Drone')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default DroneForm;