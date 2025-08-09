import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { CreditCard, Lock, CheckCircle } from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../utils/api';

const MockPaymentForm = ({ amount, onPaymentSuccess, onPaymentError }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: '',
    email: ''
  });

  const handleInputChange = (field) => (event) => {
    let value = event.target.value;

    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) return; // Max 16 digits + 3 spaces
    }

    // Limit CVC to 4 digits
    if (field === 'cvc' && value.length > 4) return;

    // Limit month to 2 digits
    if (field === 'expiryMonth' && (value.length > 2 || parseInt(value) > 12)) return;

    // Limit year to 4 digits
    if (field === 'expiryYear' && value.length > 4) return;

    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { cardNumber, expiryMonth, expiryYear, cvc, cardholderName, email } = paymentData;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      toast.error('Please enter a valid card number');
      return false;
    }
    
    if (!expiryMonth || !expiryYear) {
      toast.error('Please enter card expiry date');
      return false;
    }
    
    if (!cvc || cvc.length < 3) {
      toast.error('Please enter a valid CVC');
      return false;
    }
    
    if (!cardholderName.trim()) {
      toast.error('Please enter cardholder name');
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return false;
    }
    
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Step 1: Create payment intent
      const intentResponse = await api.post('/payments/create-intent', {
        amount: amount,
        currency: 'USD',
        customerInfo: {
          email: paymentData.email,
          name: paymentData.cardholderName
        }
      });

      if (!intentResponse.data.success) {
        throw new Error('Failed to create payment intent');
      }

      const { paymentIntent } = intentResponse.data;

      // Step 2: Confirm payment with card details
      const confirmResponse = await api.post('/payments/confirm', {
        paymentIntentId: paymentIntent.id,
        paymentMethod: {
          card: {
            number: paymentData.cardNumber.replace(/\s/g, ''),
            exp_month: parseInt(paymentData.expiryMonth),
            exp_year: parseInt(paymentData.expiryYear),
            cvc: paymentData.cvc
          },
          billing_details: {
            name: paymentData.cardholderName,
            email: paymentData.email
          },
          amount: paymentIntent.amount
        }
      });

      if (confirmResponse.data.success) {
        toast.success('Payment processed successfully! 🎉');
        onPaymentSuccess && onPaymentSuccess(confirmResponse.data.payment);
      } else {
        throw new Error(confirmResponse.data.error?.message || 'Payment failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Payment failed';
      toast.error(errorMessage);
      onPaymentError && onPaymentError(error);
    } finally {
      setLoading(false);
    }
  };

  const fillTestData = () => {
    setPaymentData({
      cardNumber: '4242 4242 4242 4242',
      expiryMonth: '12',
      expiryYear: '2025',
      cvc: '123',
      cardholderName: 'John Doe',
      email: 'john.doe@example.com'
    });
    toast.success('Test card data filled!');
  };

  return (
    <Card sx={{ maxWidth: 500, mx: 'auto' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CreditCard sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">
            Mock Payment Portal
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            🎭 This is a mock payment system. Any card details will be accepted for demonstration purposes.
          </Typography>
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" color="primary.main" textAlign="center">
            ${amount?.toFixed(2) || '0.00'}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Total Amount
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Card Number"
              value={paymentData.cardNumber}
              onChange={handleInputChange('cardNumber')}
              placeholder="1234 5678 9012 3456"
              InputProps={{
                startAdornment: <CreditCard sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Expiry Month"
              value={paymentData.expiryMonth}
              onChange={handleInputChange('expiryMonth')}
              placeholder="MM"
              type="number"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Expiry Year"
              value={paymentData.expiryYear}
              onChange={handleInputChange('expiryYear')}
              placeholder="YYYY"
              type="number"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="CVC"
              value={paymentData.cvc}
              onChange={handleInputChange('cvc')}
              placeholder="123"
              type="password"
              InputProps={{
                startAdornment: <Lock sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Cardholder Name"
              value={paymentData.cardholderName}
              onChange={handleInputChange('cardholderName')}
              placeholder="John Doe"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={paymentData.email}
              onChange={handleInputChange('email')}
              placeholder="john@example.com"
              type="email"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={fillTestData}
            disabled={loading}
            size="small"
          >
            Fill Test Data
          </Button>
          
          <Button
            variant="contained"
            fullWidth
            onClick={handlePayment}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircle />}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Processing...' : `Pay $${amount?.toFixed(2) || '0.00'}`}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
          🔒 This is a secure mock payment environment. No real transactions will be processed.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MockPaymentForm;