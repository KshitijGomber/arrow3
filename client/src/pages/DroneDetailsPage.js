import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Paper,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent,
  IconButton,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ShoppingCart as CartIcon,
  Close as CloseIcon,
  PlayArrow as PlayIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Speed as SpeedIcon,
  Battery90 as BatteryIcon,
  CameraAlt as CameraIcon,
  FlightTakeoff as FlightIcon,
  Gps as GpsIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { useDrone } from '../hooks/queries/useDroneQueries';
import { NavigationBar } from '../components/common';
import { ROUTES } from '../utils/constants';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import cloudinaryService from '../services/cloudinaryService';

const DroneDetailsPage = () => {
  const { droneId } = useParams();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Initialize Cloudinary
  const cld = new Cloudinary({
    cloud: {
      cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
    }
  });

  const {
    data: drone,
    isLoading,
    isError,
    error,
    refetch,
  } = useDrone(droneId);

  const handleOrderNow = () => {
    navigate(ROUTES.ORDER_WITH_ID(droneId));
  };

  const handleBackToCatalog = () => {
    navigate(ROUTES.DRONES);
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setImageDialogOpen(true);
  };

  const handleVideoClick = (videoUrl) => {
    setSelectedVideoUrl(videoUrl);
    setVideoDialogOpen(true);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: drone?.name,
        text: `Check out this amazing drone: ${drone?.name}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return 'Price not available';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const getAvailabilityColor = (drone) => {
    if (!drone || typeof drone.inStock === 'undefined') return 'default';
    if (!drone.inStock || drone.stockQuantity === 0) return 'error';
    if (drone.stockQuantity < 5) return 'warning';
    return 'success';
  };

  const getAvailabilityText = (drone) => {
    if (!drone || typeof drone.inStock === 'undefined') return 'Unknown';
    if (!drone.inStock || drone.stockQuantity === 0) return 'Out of Stock';
    if (drone.stockQuantity < 5) return 'Low Stock';
    return 'In Stock';
  };

  const renderOptimizedImage = (imageUrl, width = 600, height = 400) => {
    if (!imageUrl) {
      return (
        <img
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMmEyYTJhIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwMGZmODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRyb25lIEltYWdlPC90ZXh0Pgo8L3N2Zz4K"
          alt="Drone"
          style={{
            width: '100%',
            height: height,
            objectFit: 'cover',
            backgroundColor: '#2a2a2a',
          }}
        />
      );
    }

    // Check if it's a Cloudinary URL
    const publicId = cloudinaryService.extractPublicId(imageUrl);
    if (publicId && process.env.REACT_APP_CLOUDINARY_CLOUD_NAME) {
      try {
        const img = cld
          .image(publicId)
          .format(format.auto())
          .quality(quality.auto())
          .resize(auto().gravity(autoGravity()).width(width).height(height));

        return (
          <AdvancedImage 
            cldImg={img} 
            style={{
              width: '100%',
              height: height,
              objectFit: 'cover',
              backgroundColor: '#2a2a2a',
            }}
          />
        );
      } catch (error) {
        console.error('Error rendering Cloudinary image:', error);
      }
    }

    // Fallback to regular image
    return (
      <img
        src={imageUrl}
        alt="Drone"
        style={{
          width: '100%',
          height: height,
          objectFit: 'cover',
          backgroundColor: '#2a2a2a',
        }}
      />
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <NavigationBar />
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Skeleton variant="rectangular" height={400} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} variant="rectangular" width={80} height={60} />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
                <Skeleton variant="text" height={30} sx={{ mb: 2 }} />
                <Skeleton variant="text" height={100} sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={400} />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </>
    );
  }

  // Error state
  if (isError) {
    return (
      <>
        <NavigationBar />
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              {error?.message || 'Failed to load drone details. Please try again.'}
            </Alert>
          </Box>
        </Container>
      </>
    );
  }

  if (!drone) {
    return (
      <>
        <NavigationBar />
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Alert severity="warning">
              Drone not found.
            </Alert>
          </Box>
        </Container>
      </>
    );
  }

  const specifications = drone.specifications || {};
  const images = drone.images || [];
  const videos = drone.videos || [];

  return (
    <>
      <NavigationBar />
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link
              component="button"
              variant="body2"
              onClick={handleBackToCatalog}
              sx={{ textDecoration: 'none' }}
            >
              Drones
            </Link>
            <Typography variant="body2" color="text.primary">
              {drone.name}
            </Typography>
          </Breadcrumbs>

          <Grid container spacing={4}>
            {/* Image Gallery */}
            <Grid item xs={12} md={6}>
              <Box>
                {/* Main Image */}
                <Paper
                  sx={{
                    position: 'relative',
                    mb: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleImageClick(selectedImageIndex)}
                >
                  {renderOptimizedImage(images[selectedImageIndex], 600, 400)}
                  
                  {/* Featured badge */}
                  {drone.featured && (
                    <Chip
                      label="Featured"
                      color="primary"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Paper>

                {/* Thumbnail Images */}
                {images.length > 1 && (
                  <ImageList cols={4} gap={8} sx={{ mb: 2 }}>
                    {images.map((image, index) => (
                      <ImageListItem
                        key={index}
                        sx={{
                          cursor: 'pointer',
                          border: selectedImageIndex === index ? 2 : 0,
                          borderColor: 'primary.main',
                          borderRadius: 1,
                          overflow: 'hidden',
                        }}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        {renderOptimizedImage(image, 120, 80)}
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}

                {/* Video Thumbnails */}
                {videos.length > 0 && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Videos
                    </Typography>
                    <ImageList cols={2} gap={8}>
                      {videos.map((video, index) => (
                        <ImageListItem
                          key={index}
                          sx={{
                            cursor: 'pointer',
                            position: 'relative',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                          onClick={() => handleVideoClick(video)}
                        >
                          <video
                            style={{
                              width: '100%',
                              height: 120,
                              objectFit: 'cover',
                            }}
                          >
                            <source src={video} />
                          </video>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              borderRadius: '50%',
                              p: 1,
                            }}
                          >
                            <PlayIcon sx={{ color: 'white', fontSize: 32 }} />
                          </Box>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Product Details */}
            <Grid item xs={12} md={6}>
              <Box>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h3" component="h1" gutterBottom>
                    {drone.name}
                  </Typography>
                  
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {drone.model}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography
                      variant="h4"
                      component="div"
                      color="primary.main"
                      sx={{ fontWeight: 700 }}
                    >
                      {formatPrice(drone.price)}
                    </Typography>
                    
                    <Chip
                      label={getAvailabilityText(drone)}
                      color={getAvailabilityColor(drone)}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <IconButton
                      onClick={handleToggleFavorite}
                      color={isFavorite ? 'primary' : 'default'}
                    >
                      {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <IconButton onClick={handleShare}>
                      <ShareIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* Description */}
                {drone.description && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" paragraph>
                      {drone.description}
                    </Typography>
                  </Box>
                )}

                {/* Key Features */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Key Features
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <CameraIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Camera
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {specifications.cameraResolution || 'No Camera'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <SpeedIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Max Speed
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {specifications.maxSpeed && !isNaN(specifications.maxSpeed) ? `${specifications.maxSpeed} km/h` : 'Speed N/A'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <FlightIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Flight Time
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {specifications.flightTime && !isNaN(specifications.flightTime) ? `${specifications.flightTime} min` : 'Flight N/A'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <BatteryIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            Battery
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {specifications.batteryCapacity && !isNaN(specifications.batteryCapacity) ? `${specifications.batteryCapacity} mAh` : 'Battery N/A'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>

                {/* Order Button */}
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<CartIcon />}
                  onClick={handleOrderNow}
                  disabled={!drone.inStock || drone.stockQuantity === 0}
                  sx={{
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  {drone.inStock && drone.stockQuantity > 0 ? 'Order Now' : 'Out of Stock'}
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Technical Specifications Table */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" gutterBottom>
              Technical Specifications
            </Typography>
            
            <TableContainer component={Paper}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      Weight
                    </TableCell>
                    <TableCell>
                      {specifications.weight && !isNaN(specifications.weight) ? `${specifications.weight}g` : 'Weight not specified'}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      Dimensions
                    </TableCell>
                    <TableCell>
                      {specifications.dimensions && 
                       specifications.dimensions.length && !isNaN(specifications.dimensions.length) &&
                       specifications.dimensions.width && !isNaN(specifications.dimensions.width) &&
                       specifications.dimensions.height && !isNaN(specifications.dimensions.height)
                        ? `${specifications.dimensions.length} × ${specifications.dimensions.width} × ${specifications.dimensions.height} cm`
                        : 'Dimensions not specified'
                      }
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      Battery Capacity
                    </TableCell>
                    <TableCell>
                      {specifications.batteryCapacity && !isNaN(specifications.batteryCapacity) ? `${specifications.batteryCapacity} mAh` : 'Battery capacity not specified'}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      Flight Time
                    </TableCell>
                    <TableCell>
                      {specifications.flightTime && !isNaN(specifications.flightTime) ? `${specifications.flightTime} minutes` : 'Flight time not specified'}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      Max Speed
                    </TableCell>
                    <TableCell>
                      {specifications.maxSpeed && !isNaN(specifications.maxSpeed) ? `${specifications.maxSpeed} km/h` : 'Max speed not specified'}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      Camera Resolution
                    </TableCell>
                    <TableCell>
                      {specifications.cameraResolution || 'No camera'}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      Stabilization
                    </TableCell>
                    <TableCell>
                      {specifications.stabilization || 'No stabilization'}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      Control Range
                    </TableCell>
                    <TableCell>
                      {specifications.controlRange && !isNaN(specifications.controlRange) ? `${specifications.controlRange} meters` : 'Control range not specified'}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      GPS Support
                    </TableCell>
                    <TableCell>
                      {specifications.gpsSupport ? 'Yes' : 'No'}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      Obstacle Avoidance
                    </TableCell>
                    <TableCell>
                      {specifications.obstacleAvoidance ? 'Yes' : 'No'}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      Return-to-Home
                    </TableCell>
                    <TableCell>
                      {specifications.returnToHome ? 'Yes' : 'No'}
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      Wind Resistance Level
                    </TableCell>
                    <TableCell>
                      {specifications.windResistanceLevel && !isNaN(specifications.windResistanceLevel) ? `Level ${specifications.windResistanceLevel}` : 'Wind resistance not specified'}
                    </TableCell>
                  </TableRow>
                  
                  {specifications.appCompatibility && specifications.appCompatibility.length > 0 && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                        App Compatibility
                      </TableCell>
                      <TableCell>
                        {specifications.appCompatibility.join(', ')}
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {specifications.aiModes && specifications.aiModes.length > 0 && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                        AI Modes
                      </TableCell>
                      <TableCell>
                        {specifications.aiModes.join(', ')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Container>

      {/* Image Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setImageDialogOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
          <img
            src={images[selectedImageIndex]}
            alt={drone.name}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain',
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog
        open={videoDialogOpen}
        onClose={() => setVideoDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setVideoDialogOpen(false)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
          <video
            controls
            autoPlay
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
            }}
          >
            <source src={selectedVideoUrl} />
            Your browser does not support the video tag.
          </video>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DroneDetailsPage;