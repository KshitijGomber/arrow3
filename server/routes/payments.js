const express = require('express');
const router = express.Router();
const mockPayment = require('../services/mockPayment');

// Create payment intent (mock)
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency, customerInfo, orderId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount provided'
      });
    }

    const paymentIntent = await mockPayment.createPaymentIntent({
      amount,
      currency,
      customerInfo,
      orderId
    });

    res.json({
      success: true,
      paymentIntent,
      message: 'Mock payment intent created successfully'
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

// Confirm payment (mock)
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId, paymentMethod } = req.body;

    if (!paymentIntentId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Missing payment intent ID or payment method'
      });
    }

    const result = await mockPayment.confirmPayment(paymentIntentId, paymentMethod);

    if (result.success) {
      res.json({
        success: true,
        payment: result.payment,
        message: 'Payment processed successfully (mock)'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Payment failed (mock)'
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment'
    });
  }
});

// Get payment details (mock)
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await mockPayment.getPayment(paymentId);

    res.json({
      success: true,
      payment,
      message: 'Payment details retrieved (mock)'
    });
  } catch (error) {
    console.error('Payment retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve payment details'
    });
  }
});

// Mock webhook endpoint for testing
router.post('/webhook', (req, res) => {
  console.log('🎭 Mock webhook received:', req.body);
  
  // Simulate webhook processing
  const event = mockPayment.generateWebhookEvent('payment_intent.succeeded', req.body);
  
  res.json({
    success: true,
    event,
    message: 'Mock webhook processed'
  });
});

module.exports = router;