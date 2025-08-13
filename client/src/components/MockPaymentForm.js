import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  AutoFixHigh as AutoFixHighIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { useCreatePaymentIntent, useConfirmPayment } from '../hooks/queries/usePaymentQueries';

const MockPaymentForm = ({ orderData, onPaymentSuccess, onPaymentError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const createPaymentIntentMutation = useCreatePaymentIntent();
  const confirmPaymentMutation = useConfirmPayment();

  // Form validation schema
  const validationSchema = Yup.object({
    cardNumber: Yup.string()
      .required('Card number is required')
      .min(13, 'Card number must be at least 13 digits')
      .max(19, 'Card number must be at most 19 digits'),
    expiryMonth: Yup.string()
      .required('Expiry month is required')
      .matches(/^(0[1-9]|1[0-2])$/, 'Invalid month'),
    expiryYear: Yup.string()
      .required('Expiry year is required')
      .matches(/^\d{4}$/, 'Invalid year')
      .test('future-year', 'Card has expired', function(value) {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const expYear = parseInt(value);
        const expMonth = parseInt(this.parent.expiryMonth);
        
        if (expYear > currentYear) return true;
        if (expYear === currentYear && expMonth >= currentMonth) return true;
        return false;
      }),
    cvc: Yup.string()
      .required('CVC is required')
      .matches(/^\d{3,4}$/, 'CVC must be 3 or 4 digits'),
    cardholderName: Yup.string()
      .required('Cardholder name is required')
      .min(2, 'Name must be at least 2 characters'),
    billingAddress: Yup.object({
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
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
      cardholderName: '',
      billingAddress: {
        street: orderData?.shippingAddress?.street || '',
        city: orderData?.shippingAddress?.city || '',
        state: orderData?.shippingAddress?.state || '',
        zipCode: orderData?.shippingAddress?.zipCode || '',
        country: orderData?.shippingAddress?.country || 'United States',
      },
      saveCard: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      await handlePaymentSubmit(values);
    },
  });

  const handleFillTestData = () => {
    const testCards = [
      {
        number: '4242424242424242',
        brand: 'Visa',
        month: '12',
        year: '2028',
        cvc: '123',
      },
      {
        number: '5555555555554444',
        brand: 'Mastercard',
        month: '11',
        year: '2027',
        cvc: '456',
      },
      {
        number: '378282246310005',
        brand: 'American Express',
        month: '10',
        year: '2026',
        cvc: '1234',
      },
    ];

    const randomCard = testCards[Math.floor(Math.random() * testCards.length)];

    formik.setValues({
      ...formik.values,
      cardNumber: randomCard.number,
      expiryMonth: randomCard.month,
      expiryYear: randomCard.year,
      cvc: randomCard.cvc,
      cardholderName: 'Test User',
    });

    toast.success(`Filled with test ${randomCard.brand} card`);
  };

  const handlePaymentSubmit = async (values) => {
    if (!orderData) {
      toast.error('Order data is missing. Please try placing the order again.');
      return;
    }

    // Enhanced validation with detailed error messages
    if (!orderData._id) {
      console.error('Missing order ID. Order data:', orderData);
      toast.error('Order ID is missing. Please try placing the order again.');
      return;
    }

    if (!orderData.totalAmount || orderData.totalAmount <= 0) {
      console.error('Invalid total amount. Order data:', orderData);
      toast.error(`Invalid order amount: $${orderData.totalAmount || 0}. Please try again.`);
      return;
    }

    if (!orderData.customerInfo) {
      console.error('Missing customer info. Order data:', orderData);
      toast.error('Customer information is missing. Please try again.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Creating payment intent...');

    try {
      // Step 1: Create payment intent
      const paymentIntentData = {
        amount: orderData.totalAmount,
        currency: 'USD',
        customerInfo: orderData.customerInfo,
        orderId: orderData._id,
      };

      // Debug logging
      console.log('Creating payment intent with data:', {
        ...paymentIntentData,
        orderDataKeys: Object.keys(orderData),
        hasOrderId: !!orderData._id,
        amountType: typeof orderData.totalAmount,
        amountValue: orderData.totalAmount
      });

      const paymentIntent = await createPaymentIntentMutation.mutateAsync(paymentIntentData);
      
      setProcessingStep('Processing payment...');
      
      // Simulate realistic processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Confirm payment
      const paymentMethodData = {
        card: {
          number: values.cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(values.expiryMonth),
          exp_year: parseInt(values.expiryYear),
          cvc: values.cvc,
        },
        billing_details: {
          name: values.cardholderName,
          address: values.billingAddress,
        },
        amount: orderData.totalAmount * 100, // Convert to cents
      };

      const confirmationData = {
        paymentIntentId: paymentIntent.id,
        paymentMethod: paymentMethodData,
      };

      const paymentResult = await confirmPaymentMutation.mutateAsync(confirmationData);

      setProcessingStep('Payment completed!');
      
      // Simulate final processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Success callback
      onPaymentSuccess({
        ...paymentResult,
        orderId: orderData._id,
        paymentIntentId: paymentIntent.id,
      });

      toast.success('Payment completed successfully!');

    } catch (error) {
      console.error('Payment processing error:', error);
      
      const errorMessage = (error.response?.data?.error?.message || 
                          error.response?.data?.message) || 
                          'Payment processing failed. Please try again.';
      
      toast.error(errorMessage);
      onPaymentError(error);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    formik.setFieldValue('cardNumber', formatted);
  };

  const getCardBrand = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    if (number.startsWith('6')) return 'Discover';
    return '';
  };

  const cardBrand = getCardBrand(formik.values.cardNumber);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Payment Information
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          🎭 <strong>Demo Payment System</strong> - This is a mock payment form. 
          No real charges will be made. Use the "Fill Test Data" button for quick testing.
        </Typography>
      </Alert>

      {isProcessing && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {processingStep}
          </Typography>
          <LinearProgress />
        </Box>
      )}

      <form onSubmit={formik.handleSubmit}>
        {/* Payment Method Selection */}
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Payment Method</FormLabel>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              row
            >
              <FormControlLabel
                value="card"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCardIcon />
                    Credit/Debit Card
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Test Data Button */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Card Details</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoFixHighIcon />}
            onClick={handleFillTestData}
            disabled={isProcessing}
          >
            Fill Test Data
          </Button>
        </Box>

        {/* Card Information */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Card Number"
              name="cardNumber"
              value={formik.values.cardNumber}
              onChange={handleCardNumberChange}
              onBlur={formik.handleBlur}
              error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
              helperText={formik.touched.cardNumber && formik.errors.cardNumber}
              placeholder="1234 5678 9012 3456"
              disabled={isProcessing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCardIcon />
                  </InputAdornment>
                ),
                endAdornment: cardBrand && (
                  <InputAdornment position="end">
                    <Chip label={cardBrand} size="small" color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Expiry Month"
              name="expiryMonth"
              value={formik.values.expiryMonth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.expiryMonth && Boolean(formik.errors.expiryMonth)}
              helperText={formik.touched.expiryMonth && formik.errors.expiryMonth}
              placeholder="MM"
              disabled={isProcessing}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Expiry Year"
              name="expiryYear"
              value={formik.values.expiryYear}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.expiryYear && Boolean(formik.errors.expiryYear)}
              helperText={formik.touched.expiryYear && formik.errors.expiryYear}
              placeholder="YYYY"
              disabled={isProcessing}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="CVC"
              name="cvc"
              value={formik.values.cvc}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.cvc && Boolean(formik.errors.cvc)}
              helperText={formik.touched.cvc && formik.errors.cvc}
              placeholder="123"
              disabled={isProcessing}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SecurityIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cardholder Name"
              name="cardholderName"
              value={formik.values.cardholderName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.cardholderName && Boolean(formik.errors.cardholderName)}
              helperText={formik.touched.cardholderName && formik.errors.cardholderName}
              placeholder="John Doe"
              disabled={isProcessing}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Billing Address */}
        <Typography variant="h6" gutterBottom>
          Billing Address
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="billingAddress.street"
              value={formik.values.billingAddress.street}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.billingAddress?.street && Boolean(formik.errors.billingAddress?.street)}
              helperText={formik.touched.billingAddress?.street && formik.errors.billingAddress?.street}
              disabled={isProcessing}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="billingAddress.city"
              value={formik.values.billingAddress.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.billingAddress?.city && Boolean(formik.errors.billingAddress?.city)}
              helperText={formik.touched.billingAddress?.city && formik.errors.billingAddress?.city}
              disabled={isProcessing}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="State/Province"
              name="billingAddress.state"
              value={formik.values.billingAddress.state}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.billingAddress?.state && Boolean(formik.errors.billingAddress?.state)}
              helperText={formik.touched.billingAddress?.state && formik.errors.billingAddress?.state}
              disabled={isProcessing}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Postal/ZIP Code"
              name="billingAddress.zipCode"
              value={formik.values.billingAddress.zipCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.billingAddress?.zipCode && Boolean(formik.errors.billingAddress?.zipCode)}
              helperText={formik.touched.billingAddress?.zipCode && formik.errors.billingAddress?.zipCode}
              disabled={isProcessing}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Country"
              name="billingAddress.country"
              value={formik.values.billingAddress.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.billingAddress?.country && Boolean(formik.errors.billingAddress?.country)}
              helperText={formik.touched.billingAddress?.country && formik.errors.billingAddress?.country}
              disabled={isProcessing}
            />
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box sx={{ mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isProcessing || !formik.isValid}
            startIcon={isProcessing ? <CircularProgress size={20} /> : <PaymentIcon />}
            sx={{
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            {isProcessing ? 'Processing Payment...' : `Pay $${(orderData?.totalAmount || 0).toFixed(2)} (Mock Payment)`}
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
            🔒 This is a demo payment system - No real charges will be made
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            💡 Use any card details to simulate a successful payment
          </Typography>
        </Box>
      </form>
    </Paper>
  );
};

export default MockPaymentForm;