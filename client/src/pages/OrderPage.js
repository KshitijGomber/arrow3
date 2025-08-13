import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Alert,
  Skeleton,
  Breadcrumbs,
  Link,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useDrone } from '../hooks/queries/useDroneQueries';
import { useCreateOrder } from '../hooks/queries/useOrderQueries';
import { useAuth } from '../context/AuthContext';
import { NavigationBar } from '../components/common';
import { ROUTES } from '../utils/constants';

const OrderPage = () => {
  const { droneId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [orderStep, setOrderStep] = useState('details'); // 'details', 'shipping', 'summary'

  const {
    data: drone,
    isLoading: droneLoading,
    isError: droneError,
    error: droneErrorMessage,
  } = useDrone(droneId);

  const createOrderMutation = useCreateOrder();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { 
        state: { from: window.location.pathname },
        replace: true 
      });
    }
  }, [isAuthenticated, navigate]);

  // Form validation schema - International friendly
  const validationSchema = Yup.object({
    customerInfo: Yup.object({
      firstName: Yup.string()
        .min(1, 'First name must be at least 1 character')
        .max(50, 'First name cannot exceed 50 characters')
        .required('First name is required'),
      lastName: Yup.string()
        .min(1, 'Last name must be at least 1 character')
        .max(50, 'Last name cannot exceed 50 characters')
        .required('Last name is required'),
      email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
      phone: Yup.string()
        .min(8, 'Phone number must be at least 8 digits')
        .max(20, 'Phone number cannot exceed 20 characters')
        .matches(/^[\+]?[\d\s\-\(\)]{8,20}$/, 'Please enter a valid phone number (8-20 digits, can include +, spaces, dashes, parentheses)')
        .required('Phone number is required'),
    }),
    shippingAddress: Yup.object({
      street: Yup.string()
        .min(5, 'Street address must be at least 5 characters')
        .max(200, 'Street address cannot exceed 200 characters')
        .required('Street address is required'),
      city: Yup.string()
        .min(2, 'City must be at least 2 characters')
        .max(100, 'City cannot exceed 100 characters')
        .required('City is required'),
      state: Yup.string()
        .min(2, 'State/Province must be at least 2 characters')
        .max(100, 'State/Province cannot exceed 100 characters')
        .required('State/Province is required'),
      zipCode: Yup.string()
        .min(3, 'Postal/ZIP code must be at least 3 characters')
        .max(10, 'Postal/ZIP code cannot exceed 10 characters')
        .matches(/^[A-Za-z0-9\s\-]{3,10}$/, 'Please enter a valid postal/ZIP code (3-10 characters, letters, numbers, spaces, dashes allowed)')
        .required('Postal/ZIP code is required'),
      country: Yup.string()
        .min(2, 'Country must be at least 2 characters')
        .max(100, 'Country cannot exceed 100 characters')
        .required('Country is required'),
    }),
  });

  const formik = useFormik({
    initialValues: {
      customerInfo: {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: '',
      },
      shippingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'United States',
      },
      shippingMethod: 'standard',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!drone || !user) return;

      const orderData = {
        droneId: drone._id,
        quantity,
        totalAmount: calculateTotal(),
        customerInfo: values.customerInfo,
        shippingAddress: values.shippingAddress,
        notes: values.notes,
      };

      try {
        const newOrder = await createOrderMutation.mutateAsync(orderData);
        
        // Ensure the order has all required fields for payment
        const completeOrderData = {
          ...newOrder,
          _id: newOrder._id || newOrder.id,
          totalAmount: newOrder.totalAmount || calculateTotal(),
          droneId: newOrder.droneId || {
            _id: drone._id,
            name: drone.name,
            model: drone.model,
            price: drone.price,
            images: drone.images
          },
          customerInfo: newOrder.customerInfo || values.customerInfo,
          quantity: newOrder.quantity || quantity
        };
        
        console.log('Navigating to payment with order data:', completeOrderData);
        
        // Navigate to payment page with complete order data
        navigate(ROUTES.PAYMENT, { 
          state: { 
            orderId: completeOrderData._id, 
            orderData: completeOrderData 
          } 
        });
      } catch (error) {
        console.error('Order creation failed:', error);
      }
    },
  });

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (drone?.stockQuantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const calculateSubtotal = () => {
    return drone ? drone.price * quantity : 0;
  };

  const calculateShipping = () => {
    const shippingRates = {
      standard: 0, // Free standard shipping
      express: 29.99,
      overnight: 59.99,
    };
    return shippingRates[formik.values.shippingMethod] || 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const taxRate = 0.08; // 8% tax rate
    return subtotal * taxRate;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleBackToCatalog = () => {
    navigate(ROUTES.DRONES);
  };

  const handleBackToDroneDetails = () => {
    if (droneId) {
      navigate(`${ROUTES.DRONES}/${droneId}`);
    } else {
      navigate(ROUTES.DRONES);
    }
  };

  // Loading state
  if (droneLoading) {
    return (
      <>
        <NavigationBar />
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Skeleton variant="rectangular" height={400} />
              </Grid>
              <Grid item xs={12} md={4}>
                <Skeleton variant="rectangular" height={400} />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </>
    );
  }

  // Error state
  if (droneError || !drone) {
    return (
      <>
        <NavigationBar />
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={handleBackToCatalog}>
                  Back to Catalog
                </Button>
              }
            >
              {droneErrorMessage?.message || 'Drone not found. Please select a different drone.'}
            </Alert>
          </Box>
        </Container>
      </>
    );
  }

  // Check if drone is available
  if (!drone.inStock || drone.stockQuantity === 0) {
    return (
      <>
        <NavigationBar />
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Alert 
              severity="warning"
              action={
                <Button color="inherit" size="small" onClick={handleBackToCatalog}>
                  Browse Other Drones
                </Button>
              }
            >
              This drone is currently out of stock. Please check back later or browse our other available drones.
            </Alert>
          </Box>
        </Container>
      </>
    );
  }

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
            <Link
              component="button"
              variant="body2"
              onClick={handleBackToDroneDetails}
              sx={{ textDecoration: 'none' }}
            >
              {drone.name}
            </Link>
            <Typography variant="body2" color="text.primary">
              Order
            </Typography>
          </Breadcrumbs>

          {/* Header */}
          <Typography variant="h3" component="h1" gutterBottom>
            Complete Your Order
          </Typography>

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={4}>
              {/* Order Form */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  {/* Drone Details Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      <CartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Order Details
                    </Typography>
                    
                    <Card variant="outlined" sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', p: 2 }}>
                        <CardMedia
                          component="img"
                          sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1 }}
                          image={drone.images?.[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMmEyYTJhIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwMGZmODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRyb25lIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'}
                          alt={drone.name}
                        />
                        <CardContent sx={{ flex: 1, pl: 2 }}>
                          <Typography variant="h6" gutterBottom>
                            {drone.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {drone.model}
                          </Typography>
                          <Typography variant="h6" color="primary.main" gutterBottom>
                            {formatPrice(drone.price)}
                          </Typography>
                          
                          {/* Quantity Selector */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                            <Typography variant="body2">Quantity:</Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(-1)}
                              disabled={quantity <= 1}
                            >
                              <RemoveIcon />
                            </IconButton>
                            <Typography variant="body1" sx={{ mx: 2, minWidth: 20, textAlign: 'center' }}>
                              {quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleQuantityChange(1)}
                              disabled={quantity >= drone.stockQuantity}
                            >
                              <AddIcon />
                            </IconButton>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                              ({drone.stockQuantity} available)
                            </Typography>
                          </Box>
                        </CardContent>
                      </Box>
                    </Card>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Customer Information */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Customer Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="customerInfo.firstName"
                          value={formik.values.customerInfo.firstName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.customerInfo?.firstName && Boolean(formik.errors.customerInfo?.firstName)}
                          helperText={formik.touched.customerInfo?.firstName && formik.errors.customerInfo?.firstName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="customerInfo.lastName"
                          value={formik.values.customerInfo.lastName}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.customerInfo?.lastName && Boolean(formik.errors.customerInfo?.lastName)}
                          helperText={formik.touched.customerInfo?.lastName && formik.errors.customerInfo?.lastName}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="customerInfo.email"
                          type="email"
                          value={formik.values.customerInfo.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.customerInfo?.email && Boolean(formik.errors.customerInfo?.email)}
                          helperText={formik.touched.customerInfo?.email && formik.errors.customerInfo?.email}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="customerInfo.phone"
                          value={formik.values.customerInfo.phone}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.customerInfo?.phone && Boolean(formik.errors.customerInfo?.phone)}
                          helperText={formik.touched.customerInfo?.phone && formik.errors.customerInfo?.phone}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Shipping Address */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      <ShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Shipping Address
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Street Address"
                          name="shippingAddress.street"
                          value={formik.values.shippingAddress.street}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.shippingAddress?.street && Boolean(formik.errors.shippingAddress?.street)}
                          helperText={formik.touched.shippingAddress?.street && formik.errors.shippingAddress?.street}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="City"
                          name="shippingAddress.city"
                          value={formik.values.shippingAddress.city}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.shippingAddress?.city && Boolean(formik.errors.shippingAddress?.city)}
                          helperText={formik.touched.shippingAddress?.city && formik.errors.shippingAddress?.city}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="State/Province"
                          name="shippingAddress.state"
                          value={formik.values.shippingAddress.state}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.shippingAddress?.state && Boolean(formik.errors.shippingAddress?.state)}
                          helperText={formik.touched.shippingAddress?.state && formik.errors.shippingAddress?.state}
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <TextField
                          fullWidth
                          label="Postal/ZIP Code"
                          name="shippingAddress.zipCode"
                          value={formik.values.shippingAddress.zipCode}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.shippingAddress?.zipCode && Boolean(formik.errors.shippingAddress?.zipCode)}
                          helperText={formik.touched.shippingAddress?.zipCode && formik.errors.shippingAddress?.zipCode}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Country"
                          name="shippingAddress.country"
                          value={formik.values.shippingAddress.country}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.shippingAddress?.country && Boolean(formik.errors.shippingAddress?.country)}
                          helperText={formik.touched.shippingAddress?.country && formik.errors.shippingAddress?.country}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Shipping Method */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Shipping Method
                    </Typography>
                    
                    <FormControl component="fieldset">
                      <RadioGroup
                        name="shippingMethod"
                        value={formik.values.shippingMethod}
                        onChange={formik.handleChange}
                      >
                        <FormControlLabel
                          value="standard"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1">Standard Shipping (5-7 business days)</Typography>
                              <Typography variant="body2" color="text.secondary">FREE</Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="express"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1">Express Shipping (2-3 business days)</Typography>
                              <Typography variant="body2" color="text.secondary">$29.99</Typography>
                            </Box>
                          }
                        />
                        <FormControlLabel
                          value="overnight"
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1">Overnight Shipping (1 business day)</Typography>
                              <Typography variant="body2" color="text.secondary">$59.99</Typography>
                            </Box>
                          }
                        />
                      </RadioGroup>
                    </FormControl>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Order Notes */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                      Order Notes (Optional)
                    </Typography>
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Special instructions or notes"
                      name="notes"
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      placeholder="Any special delivery instructions or notes about your order..."
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Order Summary */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
                  <Typography variant="h5" gutterBottom>
                    Order Summary
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">
                        Subtotal ({quantity} item{quantity > 1 ? 's' : ''})
                      </Typography>
                      <Typography variant="body1">
                        {formatPrice(calculateSubtotal())}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Shipping</Typography>
                      <Typography variant="body1">
                        {calculateShipping() === 0 ? 'FREE' : formatPrice(calculateShipping())}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Tax</Typography>
                      <Typography variant="body1">
                        {formatPrice(calculateTax())}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                      <Typography variant="h6" fontWeight={700}>
                        Total
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
                        {formatPrice(calculateTotal())}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Estimated Delivery */}
                  <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0, 255, 136, 0.1)', borderRadius: 1 }}>
                    <Typography variant="body2" color="primary.main" fontWeight={600}>
                      Estimated Delivery
                    </Typography>
                    <Typography variant="body2">
                      {formik.values.shippingMethod === 'standard' && '5-7 business days'}
                      {formik.values.shippingMethod === 'express' && '2-3 business days'}
                      {formik.values.shippingMethod === 'overnight' && '1 business day'}
                    </Typography>
                  </Box>

                  {/* Proceed to Payment Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<PaymentIcon />}
                    disabled={createOrderMutation.isLoading || !formik.isValid}
                    sx={{
                      py: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    {createOrderMutation.isLoading ? 'Processing...' : 'Proceed to Payment'}
                  </Button>

                  {/* Security Notice */}
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                    🔒 Your information is secure and encrypted
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Container>
    </>
  );
};

export default OrderPage;