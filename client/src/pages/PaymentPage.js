import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Button,
  Alert,
  Skeleton,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { NavigationBar } from '../components/common';
import { MockPaymentForm } from '../components';
import { ROUTES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [paymentStep, setPaymentStep] = useState('payment'); // 'payment', 'processing', 'confirmation'
  const [orderData, setOrderData] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  // Get order data from navigation state
  useEffect(() => {
    if (location.state?.orderData) {
      const orderData = location.state.orderData;
      
      // Validate that orderData has required fields
      if (!orderData._id) {
        console.error('Order data missing ID:', orderData);
        navigate(ROUTES.DRONES, { replace: true });
        return;
      }
      
      if (!orderData.totalAmount || orderData.totalAmount <= 0) {
        console.error('Order data missing or invalid total amount:', orderData);
        navigate(ROUTES.DRONES, { replace: true });
        return;
      }
      
      setOrderData(orderData);
      console.log('PaymentPage: Order data loaded successfully:', orderData);
    } else {
      console.warn('PaymentPage: No order data in navigation state');
      // If no order data, redirect back to catalog
      navigate(ROUTES.DRONES, { replace: true });
    }
  }, [location.state, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { 
        state: { from: window.location.pathname },
        replace: true 
      });
    }
  }, [isAuthenticated, navigate]);

  const handlePaymentSuccess = (result) => {
    setPaymentResult(result);
    setPaymentStep('confirmation');
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    // Stay on payment form to allow retry
  };

  const handleBackToOrder = () => {
    if (orderData?.droneId) {
      navigate(ROUTES.ORDER_WITH_ID(orderData.droneId));
    } else {
      navigate(ROUTES.DRONES);
    }
  };

  const handleContinueShopping = () => {
    navigate(ROUTES.DRONES);
  };

  const steps = ['Order Details', 'Payment', 'Confirmation'];
  const activeStep = paymentStep === 'payment' ? 1 : paymentStep === 'confirmation' ? 2 : 1;

  // Loading state
  if (!orderData) {
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
              onClick={() => navigate(ROUTES.DRONES)}
              sx={{ textDecoration: 'none' }}
            >
              Drones
            </Link>
            <Link
              component="button"
              variant="body2"
              onClick={handleBackToOrder}
              sx={{ textDecoration: 'none' }}
            >
              Order
            </Link>
            <Typography variant="body2" color="text.primary">
              Payment
            </Typography>
          </Breadcrumbs>

          {/* Progress Stepper */}
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Header */}
          <Typography variant="h3" component="h1" gutterBottom>
            {paymentStep === 'confirmation' ? 'Order Confirmed!' : 'Complete Payment'}
          </Typography>

          {paymentStep === 'confirmation' ? (
            // Confirmation Page
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <CheckCircleIcon 
                    sx={{ 
                      fontSize: 80, 
                      color: 'success.main', 
                      mb: 2 
                    }} 
                  />
                  
                  <Typography variant="h4" gutterBottom color="success.main">
                    Payment Successful!
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Thank you for your order. We've received your payment and will begin processing your order shortly.
                  </Typography>

                  {paymentResult && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom>
                        Order Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Order ID: {paymentResult.orderId || orderData._id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Payment ID: {paymentResult.paymentIntentId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Amount: ${(orderData.totalAmount || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                    <Typography variant="body2">
                      📧 A confirmation email has been sent to {orderData.customerInfo?.email}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      📦 You'll receive tracking information once your order ships
                    </Typography>
                  </Alert>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleContinueShopping}
                      sx={{ minWidth: 200 }}
                    >
                      Continue Shopping
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/orders')}
                      sx={{ minWidth: 200 }}
                    >
                      View Orders
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            // Payment Form
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <MockPaymentForm
                  orderData={orderData}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              </Grid>

              {/* Order Summary Sidebar */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, position: 'sticky', top: 24 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  
                  {orderData.droneId && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" gutterBottom>
                        {orderData.droneId.name || 'Drone'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Model: {orderData.droneId.model || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {orderData.quantity || 1}
                      </Typography>
                    </Box>
                  )}

                  {/* Price Breakdown */}
                  <Box sx={{ mb: 2 }}>
                    {orderData.droneId && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Subtotal ({orderData.quantity || 1}x ${orderData.droneId.price?.toFixed(2) || '0.00'})
                          </Typography>
                          <Typography variant="body2">
                            ${((orderData.droneId.price || 0) * (orderData.quantity || 1)).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Tax (8%)
                          </Typography>
                          <Typography variant="body2">
                            ${(((orderData.droneId.price || 0) * (orderData.quantity || 1)) * 0.08).toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Shipping
                          </Typography>
                          <Typography variant="body2" color="primary.main">
                            FREE
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pt: 2, borderTop: '1px solid #333' }}>
                    <Typography variant="h6" fontWeight={700}>
                      Total Amount
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      ${(orderData.totalAmount || 0).toFixed(2)}
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="caption">
                      🔒 This is a demo payment system. No real charges will be made.
                    </Typography>
                  </Alert>

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackToOrder}
                    sx={{ mt: 2 }}
                  >
                    Back to Order
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Container>
    </>
  );
};

export default PaymentPage;