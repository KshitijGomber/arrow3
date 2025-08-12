import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Grid,
  IconButton,
  Tooltip
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

const DroneCard = ({ drone, onOrderClick }) => {
  const navigate = useNavigate();

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getAvailabilityColor = (drone) => {
    if (!drone.inStock || drone.stockQuantity === 0) return 'error';
    if (drone.stockQuantity < 5) return 'warning';
    return 'success';
  };

  const getAvailabilityText = (drone) => {
    if (!drone.inStock || drone.stockQuantity === 0) return 'Out of Stock';
    if (drone.stockQuantity < 5) return 'Low Stock';
    return 'In Stock';
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
          boxShadow: '0 8px 25px rgba(0, 255, 136, 0.15)',
        },
      }}
      onClick={handleViewDetails}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={drone.images?.[0] || '/placeholder-drone.jpg'}
          alt={drone.name}
          sx={{
            objectFit: 'cover',
            backgroundColor: '#2a2a2a',
          }}
        />
        
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
              backgroundColor: 'rgba(0, 255, 136, 0.8)',
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
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CameraIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">
                {drone.specifications?.cameraResolution || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SpeedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">
                {drone.specifications?.maxSpeed ? `${drone.specifications.maxSpeed} km/h` : 'N/A'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FlightIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">
                {drone.specifications?.flightTime ? `${drone.specifications.flightTime} min` : 'N/A'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <BatteryIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">
                {drone.specifications?.batteryCapacity ? `${drone.specifications.batteryCapacity} mAh` : 'N/A'}
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
          startIcon={<CartIcon />}
          onClick={handleOrderClick}
          disabled={!drone.inStock || drone.stockQuantity === 0}
          sx={{
            py: 1.5,
            fontWeight: 600,
          }}
        >
          {drone.inStock && drone.stockQuantity > 0 ? 'Order Now' : 'Out of Stock'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default DroneCard;