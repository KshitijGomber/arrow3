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
import { CloudinaryUploadField } from '../../../components/common';
import toast from 'react-hot-toast';
import api from '../../../utils/api';

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
    enabled: Boolean(isEditMode),
  });

  // Mutations
  const createDroneMutation = useCreateDrone();
  const updateDroneMutation = useUpdateDrone();

  // Form state
  const [mediaUrls, setMediaUrls] = useState([]);

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
    if (isEditMode && droneData) {
      const drone = droneData;
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
      
      // Set existing media URLs
      const existingUrls = [...(drone.images || []), ...(drone.videos || [])];
      setMediaUrls(existingUrls);
    }
  }, [isEditMode, droneData, reset]);

  const onSubmit = async (data) => {
    try {
      // Separate images and videos from Cloudinary URLs
      const images = mediaUrls.filter(url => 
        url.includes('/image/') || 
        url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
      );
      const videos = mediaUrls.filter(url => 
        url.includes('/video/') || 
        url.match(/\.(mp4|webm|mov|avi)(\?|$)/i)
      );

      console.log('Media URLs breakdown:', {
        totalUrls: mediaUrls.length,
        images: images.length,
        videos: videos.length,
        allUrls: mediaUrls
      });

      // Helper function to safely parse numbers
      const safeParseFloat = (value, defaultValue = 0) => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? defaultValue : parsed;
      };

      const safeParseInt = (value, defaultValue = 0) => {
        const parsed = parseInt(value);
        return isNaN(parsed) ? defaultValue : parsed;
      };

      const formData = {
        ...data,
        images: images,
        videos: videos,
        price: safeParseFloat(data.price),
        specifications: {
          ...data.specifications,
          weight: safeParseFloat(data.specifications.weight),
          dimensions: {
            length: safeParseFloat(data.specifications.dimensions.length),
            width: safeParseFloat(data.specifications.dimensions.width),
            height: safeParseFloat(data.specifications.dimensions.height)
          },
          batteryCapacity: safeParseFloat(data.specifications.batteryCapacity),
          flightTime: safeParseFloat(data.specifications.flightTime),
          maxSpeed: safeParseFloat(data.specifications.maxSpeed),
          controlRange: safeParseFloat(data.specifications.controlRange),
          windResistanceLevel: safeParseInt(data.specifications.windResistanceLevel, 5)
        },
        stockQuantity: safeParseInt(data.stockQuantity)
      };

      // Debug logging
      console.log('Submitting drone data:', JSON.stringify(formData, null, 2));

      let droneId = id;
      
      // Create or update the drone first
      if (isEditMode) {
        await updateDroneMutation.mutateAsync({ droneId: id, droneData: formData });
      } else {
        const result = await createDroneMutation.mutateAsync(formData);
        droneId = result._id; // Fix: result is already the drone object
      }

      // Files are already uploaded to Cloudinary, URLs are stored in the drone data

      navigate('/admin/products');
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        toast.error('A drone with this name already exists. Please choose a different name.');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} drone: ${error.message || 'Unknown error'}`);
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const handleMediaChange = (newMediaUrls) => {
    console.log('Media URLs changed:', newMediaUrls);
    setMediaUrls(newMediaUrls);
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
                      min: { value: 100, message: 'Price cannot be under $100' },
                      max: { value: 10000, message: 'Price cannot exceed $10,000' },
                      validate: value => {
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) return 'Please enter a valid price';
                        if (numValue < 100) return 'Price cannot be under $100';
                        if (numValue > 10000) return 'Price cannot exceed $10,000';
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Price"
                        type="number"
                        inputProps={{ min: 100, max: 10000, step: 0.01 }}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        error={!!errors.price}
                        helperText={errors.price?.message || 'Price must be between $100 and $10,000'}
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
                    rules={{ 
                      required: 'Weight is required',
                      min: { value: 50, message: 'Weight must be at least 50g' },
                      max: { value: 5000, message: 'Weight cannot exceed 5000g' },
                      validate: value => {
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) return 'Please enter a valid weight';
                        if (numValue < 50) return 'Weight must be at least 50g';
                        if (numValue > 5000) return 'Weight cannot exceed 5000g';
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Weight"
                        type="number"
                        inputProps={{ min: 50, max: 5000, step: 1 }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">g</InputAdornment>,
                        }}
                        error={!!errors.specifications?.weight}
                        helperText={errors.specifications?.weight?.message || 'Weight in grams (50-5000g)'}
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
                    rules={{ 
                      required: 'Battery capacity is required',
                      min: { value: 1000, message: 'Battery capacity must be at least 1000 mAh' },
                      max: { value: 10000, message: 'Battery capacity cannot exceed 10000 mAh' },
                      validate: value => {
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) return 'Please enter a valid battery capacity';
                        if (numValue < 1000) return 'Battery capacity must be at least 1000 mAh';
                        if (numValue > 10000) return 'Battery capacity cannot exceed 10000 mAh';
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Battery Capacity"
                        type="number"
                        inputProps={{ min: 1000, max: 10000, step: 100 }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">mAh</InputAdornment>,
                        }}
                        error={!!errors.specifications?.batteryCapacity}
                        helperText={errors.specifications?.batteryCapacity?.message || 'Battery capacity in mAh (1000-10000 mAh)'}
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
                    rules={{ 
                      required: 'Flight time is required',
                      min: { value: 5, message: 'Flight time must be at least 5 minutes' },
                      max: { value: 120, message: 'Flight time cannot exceed 120 minutes' },
                      validate: value => {
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) return 'Please enter a valid flight time';
                        if (numValue < 5) return 'Flight time must be at least 5 minutes';
                        if (numValue > 120) return 'Flight time cannot exceed 120 minutes';
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Flight Time"
                        type="number"
                        inputProps={{ min: 5, max: 120, step: 1 }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">min</InputAdornment>,
                        }}
                        error={!!errors.specifications?.flightTime}
                        helperText={errors.specifications?.flightTime?.message || 'Flight time in minutes (5-120 min)'}
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
                    rules={{ 
                      required: 'Max speed is required',
                      min: { value: 10, message: 'Max speed must be at least 10 km/h' },
                      max: { value: 200, message: 'Max speed cannot exceed 200 km/h' },
                      validate: value => {
                        const numValue = parseFloat(value);
                        if (isNaN(numValue)) return 'Please enter a valid max speed';
                        if (numValue < 10) return 'Max speed must be at least 10 km/h';
                        if (numValue > 200) return 'Max speed cannot exceed 200 km/h';
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Max Speed"
                        type="number"
                        inputProps={{ min: 10, max: 200, step: 1 }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">km/h</InputAdornment>,
                        }}
                        error={!!errors.specifications?.maxSpeed}
                        helperText={errors.specifications?.maxSpeed?.message || 'Max speed in km/h (10-200 km/h)'}
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
                    rules={{ 
                      required: 'Length is required',
                      min: { value: 0.1, message: 'Length must be positive' }
                    }}
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
                    rules={{ 
                      required: 'Height is required',
                      min: { value: 0.1, message: 'Height must be positive' }
                    }}
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
              <CloudinaryUploadField
                label="Drone Media Files"
                value={mediaUrls}
                onChange={handleMediaChange}
                maxFiles={20}
                maxSize={50 * 1024 * 1024} // 50MB
                acceptedTypes={{
                  'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
                  'video/*': ['.mp4', '.webm', '.mov', '.avi']
                }}
                showPreview={true}
                folder="arrow3/drones"
                helperText="Upload images and videos for this drone. Files are uploaded directly to Cloudinary for optimal performance and reliability."
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
                    rules={{ 
                      required: 'Stock quantity is required',
                      min: { value: 0, message: 'Stock quantity cannot be negative' },
                      max: { value: 1000, message: 'Stock quantity cannot exceed 1000 units' },
                      validate: value => {
                        const numValue = parseInt(value);
                        if (isNaN(numValue)) return 'Please enter a valid stock quantity';
                        if (numValue < 0) return 'Stock quantity cannot be negative';
                        if (numValue > 1000) return 'Stock quantity cannot exceed 1000 units';
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Stock Quantity"
                        type="number"
                        inputProps={{ min: 0, max: 1000, step: 1 }}
                        error={!!errors.stockQuantity}
                        helperText={errors.stockQuantity?.message || 'Number of units in stock (0-1000)'}
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