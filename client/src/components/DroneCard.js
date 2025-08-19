import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Grid,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Battery90 as BatteryIcon,
  CameraAlt as CameraIcon,
  FlightTakeoff as FlightIcon,
  FavoriteBorder as FavoriteIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import { LazyImage } from './common';
import { AdvancedImage } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import cloudinaryService from '../services/cloudinaryService';

const DroneCard = ({ drone, onOrderClick }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Initialize Cloudinary
  const cld = new Cloudinary({
    cloud: {
      cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
    }
  });

  const handleViewDetails = () => {
    navigate(`${ROUTES.DRONES}/${drone._id}`);
  };

  const handleOrderClick = (e) => {
    e.stopPropagation();
    if (onOrderClick) {
      onOrderClick(drone._id);
    } else {
      navigate(ROUTES.ORDER_WITH_ID(drone._id));
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

  const renderOptimizedImage = (imageUrl) => {
    if (!imageUrl) {
      return (
        <img
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMmEyYTJhIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwMGZmODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRyb25lIEltYWdlPC90ZXh0Pgo8L3N2Zz4K"
          alt={drone.name}
          style={{
            width: '100%',
            height: isMobile ? 180 : isTablet ? 190 : 200,
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
          .resize(auto().gravity(autoGravity()).width(400).height(isMobile ? 180 : isTablet ? 190 : 200));

        return (
          <AdvancedImage 
            cldImg={img} 
            style={{
              width: '100%',
              height: isMobile ? 180 : isTablet ? 190 : 200,
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
        alt={drone.name}
        style={{
          width: '100%',
          height: isMobile ? 180 : isTablet ? 190 : 200,
          objectFit: 'cover',
          backgroundColor: '#2a2a2a',
        }}
      />
    );
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 25px ${theme.palette.primary.main}25`,
        },
      }}
      onClick={handleViewDetails}
    >
      <Box sx={{ position: 'relative' }}>
        {renderOptimizedImage(drone.images?.[0])}
        
        {/* Featured badge */}
        {drone.featured && (
          <Chip
            label="Featured"
            color="primary"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 600,
            }}
          />
        )}
        
        {/* Availability badge */}
        <Chip
          label={getAvailabilityText(drone)}
          color={getAvailabilityColor(drone)}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontWeight: 600,
          }}
        />
        
        {/* Favorite button */}
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement favorite functionality
          }}
        >
          <FavoriteIcon />
        </IconButton>
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom noWrap>
          {drone.name}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {drone.model}
        </Typography>

        {/* Key specifications */}
        <Grid container spacing={isMobile ? 0.5 : 1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CameraIcon sx={{ fontSize: isMobile ? 14 : 16, color: 'primary.main' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
              >
                {drone.specifications?.cameraResolution || 'No Camera'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SpeedIcon sx={{ fontSize: isMobile ? 14 : 16, color: 'primary.main' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
              >
                {drone.specifications?.maxSpeed && !isNaN(drone.specifications.maxSpeed) ? `${drone.specifications.maxSpeed} km/h` : 'Speed N/A'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FlightIcon sx={{ fontSize: isMobile ? 14 : 16, color: 'primary.main' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
              >
                {drone.specifications?.flightTime && !isNaN(drone.specifications.flightTime) ? `${drone.specifications.flightTime} min` : 'Flight N/A'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BatteryIcon sx={{ fontSize: isMobile ? 14 : 16, color: 'primary.main' }} />
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
              >
                {drone.specifications?.batteryCapacity && !isNaN(drone.specifications.batteryCapacity) ? `${drone.specifications.batteryCapacity} mAh` : 'Battery N/A'}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Price */}
        <Typography
          variant="h5"
          component="div"
          color="primary.main"
          sx={{ fontWeight: 700 }}
        >
          {formatPrice(drone.price)}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={!isMobile ? <CartIcon /> : null}
          onClick={handleOrderClick}
          disabled={!drone.inStock || drone.stockQuantity === 0}
          sx={{
            py: isMobile ? 1.2 : 1.5,
            fontWeight: 600,
            fontSize: isMobile ? '0.875rem' : '1rem',
          }}
        >
          {isMobile ? 
            (drone.inStock && drone.stockQuantity > 0 ? 'Order' : 'Out of Stock') :
            (drone.inStock && drone.stockQuantity > 0 ? 'Order Now' : 'Out of Stock')
          }
        </Button>
      </CardActions>
    </Card>
  );
};

export default DroneCard;