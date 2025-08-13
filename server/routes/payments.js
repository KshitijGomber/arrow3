const express = require('express');
const router = express.Router();
const mockPayment = require('../services/mockPayment');
const { Order } = require('../models');
const emailService = require('../services/emailService');

// Create payment intent (mock)
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency, customerInfo, orderId } = req.body;

    // Debug logging
    console.log('Payment intent request data:', {
      amount,
      currency,
      customerInfo,
      orderId,
      fullBody: req.body
    });

    // Validate required fields
    if (!amount) {
      console.error('Payment validation error: Missing amount');
      return res.status(400).json({
        success: false,
        error: 'Amount is required',
        details: 'Please provide a valid amount for the payment'
      });
    }

    if (amount <= 0) {
      console.error('Payment validation error: Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        error: 'Invalid amount provided',
        details: `Amount must be greater than 0, received: ${amount}`
      });
    }

    if (!customerInfo) {
      console.error('Payment validation error: Missing customer info');
      return res.status(400).json({
        success: false,
        error: 'Customer information is required',
        details: 'Please provide customer information for the payment'
      });
    }

    const paymentIntent = await mockPayment.createPaymentIntent({
      amount,
      currency: currency || 'USD',
      customerInfo,
      orderId
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    res.json({
      success: true,
      paymentIntent,
      message: 'Mock payment intent created successfully'
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent',
      details: error.message
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
      // Find the order associated with this payment intent
      const orderId = result.payment.metadata?.order_id;
      if (orderId) {
        try {
          // Update order status to confirmed and payment status to completed
          const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
              status: 'confirmed',
              paymentStatus: 'completed',
              paymentIntentId: paymentIntentId,
              $set: {
                'paymentDetails.paymentMethod': result.payment.payment_method,
                'paymentDetails.receiptUrl': result.payment.receipt_url,
                'paymentDetails.processedAt': new Date()
              }
            },
            { new: true }
          ).populate('droneId');

          if (updatedOrder) {
            console.log('📧 Attempting to send order confirmation email for order:', orderId);
            console.log('📧 Order data for email:', {
              orderId: updatedOrder._id,
              customerEmail: updatedOrder.customerInfo?.email,
              hasCustomerInfo: !!updatedOrder.customerInfo,
              hasDroneId: !!updatedOrder.droneId,
              droneData: updatedOrder.droneId ? {
                name: updatedOrder.droneId.name,
                id: updatedOrder.droneId._id
              } : 'No drone data'
            });
            
            // Send order confirmation email
            try {
              await emailService.sendOrderConfirmation(updatedOrder);
              console.log('✅ Order confirmation email sent for order:', orderId);
            } catch (emailError) {
              console.error('❌ Failed to send order confirmation email:', emailError);
              console.error('❌ Email error details:', {
                message: emailError.message,
                stack: emailError.stack
              });
              // Don't fail the payment if email fails
            }

            res.json({
              success: true,
              payment: result.payment,
              order: updatedOrder,
              message: 'Payment processed successfully and order confirmed (mock)'
            });
          } else {
            console.warn('⚠️ Order not found for payment intent:', paymentIntentId);
            res.json({
              success: true,
              payment: result.payment,
              message: 'Payment processed successfully (mock)'
            });
          }
        } catch (orderError) {
          console.error('❌ Failed to update order after payment:', orderError);
          // Still return success for payment, but log the error
          res.json({
            success: true,
            payment: result.payment,
            message: 'Payment processed successfully, but order update failed (mock)'
          });
        }
      } else {
        res.json({
          success: true,
          payment: result.payment,
          message: 'Payment processed successfully (mock)'
        });
      }
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