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

    console.log('💳 Payment confirmation result:', {
      success: result.success,
      paymentId: paymentIntentId,
      orderIdFromMetadata: result.payment?.metadata?.order_id
    });

    if (result.success) {
      // Find the order associated with this payment intent
      const orderId = result.payment.metadata?.order_id;
      console.log('🔍 Looking for order with ID:', orderId);
      
      let updatedOrder = null;
      
      if (orderId) {
        try {
          console.log('📝 Updating order status and payment status for order:', orderId);
          console.log('📝 Order ID type:', typeof orderId, 'Length:', orderId?.length);
          console.log('📝 MongoDB ObjectId validation:', {
            isValidObjectId: /^[0-9a-fA-F]{24}$/.test(orderId),
            orderId: orderId
          });
          
          // Update order status to confirmed and payment status to completed
          updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
              $set: {
                status: 'confirmed',
                paymentStatus: 'completed',
                paymentIntentId: paymentIntentId,
                'paymentDetails.paymentMethod.id': result.payment.payment_method.id,
                'paymentDetails.paymentMethod.type': result.payment.payment_method.type,
                'paymentDetails.paymentMethod.card.brand': result.payment.payment_method.card.brand,
                'paymentDetails.paymentMethod.card.last4': result.payment.payment_method.card.last4,
                'paymentDetails.paymentMethod.card.exp_month': result.payment.payment_method.card.exp_month,
                'paymentDetails.paymentMethod.card.exp_year': result.payment.payment_method.card.exp_year,
                'paymentDetails.receiptUrl': result.payment.receipt_url,
                'paymentDetails.processedAt': new Date()
              }
            },
            { new: true }
          ).populate('droneId');

          if (updatedOrder) {
            console.log('✅ Order updated successfully:', {
              orderId: updatedOrder._id,
              status: updatedOrder.status,
              paymentStatus: updatedOrder.paymentStatus,
              paymentIntentId: updatedOrder.paymentIntentId
            });
          } else {
            console.warn('⚠️ Order update returned null - order may not exist:', orderId);
          }
        } catch (orderError) {
          console.error('❌ Failed to update order after payment:', orderError);
          // Still return success for payment, but log the error
          res.json({
            success: true,
            payment: result.payment,
            message: 'Payment processed successfully, but order update failed (mock)'
          });
          return;
        }
      } else {
        console.warn('⚠️ No order ID found in payment metadata, trying to find by payment intent ID');
        
        // Fallback: try to find order by payment intent ID if it was stored during order creation
        try {
          const orderByPaymentIntent = await Order.findOne({ paymentIntentId: paymentIntentId }).populate('droneId');
          if (orderByPaymentIntent) {
            console.log('🔍 Found order by payment intent ID:', orderByPaymentIntent._id);
            
            orderByPaymentIntent.status = 'confirmed';
            orderByPaymentIntent.paymentStatus = 'completed';
            orderByPaymentIntent.paymentDetails = {
              paymentMethod: {
                id: result.payment.payment_method.id,
                type: result.payment.payment_method.type,
                card: {
                  brand: result.payment.payment_method.card.brand,
                  last4: result.payment.payment_method.card.last4,
                  exp_month: result.payment.payment_method.card.exp_month,
                  exp_year: result.payment.payment_method.card.exp_year
                }
              },
              receiptUrl: result.payment.receipt_url,
              processedAt: new Date()
            };
            
            updatedOrder = await orderByPaymentIntent.save();
            
            console.log('✅ Order updated via fallback method:', {
              orderId: updatedOrder._id,
              status: updatedOrder.status,
              paymentStatus: updatedOrder.paymentStatus
            });
          } else {
            console.warn('⚠️ Order not found for payment intent:', paymentIntentId);
            res.json({
              success: true,
              payment: result.payment,
              message: 'Payment processed successfully (mock)'
            });
            return;
          }
        } catch (fallbackError) {
          console.error('❌ Fallback order lookup failed:', fallbackError);
          res.json({
            success: true,
            payment: result.payment,
            message: 'Payment processed successfully, but order update failed (mock)'
          });
          return;
        }
      }

      // Send order confirmation email if we have an updated order
      if (updatedOrder) {
        console.log('📧 Attempting to send order confirmation email for order:', updatedOrder._id);
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
          console.log('📧 About to call emailService.sendOrderConfirmation...');
          const emailResult = await emailService.sendOrderConfirmation(updatedOrder);
          console.log('✅ Order confirmation email sent successfully for order:', updatedOrder._id);
          console.log('📧 Email service result:', emailResult);
        } catch (emailError) {
          console.error('❌ Failed to send order confirmation email:', emailError);
          console.error('❌ Email error details:', {
            message: emailError.message,
            stack: emailError.stack,
            name: emailError.name,
            code: emailError.code
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
        console.warn('⚠️ No order was updated');
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

// Debug endpoint to test payment status updates
router.post('/debug-update-order', async (req, res) => {
  try {
    const { orderId, paymentStatus = 'completed' } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    console.log('🧪 Debug: Attempting to update order payment status:', {
      orderId,
      paymentStatus,
      orderIdType: typeof orderId
    });

    // First, check if order exists
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        orderId
      });
    }

    console.log('🧪 Debug: Found existing order:', {
      orderId: existingOrder._id,
      currentStatus: existingOrder.status,
      currentPaymentStatus: existingOrder.paymentStatus
    });

    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          paymentStatus: paymentStatus,
          status: 'confirmed'
        }
      },
      { new: true }
    );

    console.log('🧪 Debug: Order update result:', {
      success: !!updatedOrder,
      orderId: updatedOrder?._id,
      newStatus: updatedOrder?.status,
      newPaymentStatus: updatedOrder?.paymentStatus
    });

    res.json({
      success: true,
      message: 'Order payment status updated successfully',
      order: {
        id: updatedOrder._id,
        status: updatedOrder.status,
        paymentStatus: updatedOrder.paymentStatus
      }
    });

  } catch (error) {
    console.error('🧪 Debug: Order update failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order',
      details: error.message
    });
  }
});

// Debug endpoint to test email sending
router.post('/debug-send-email', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID is required'
      });
    }

    console.log('📧 Debug: Attempting to send email for order:', orderId);

    // Find the order with populated drone data
    const order = await Order.findById(orderId).populate('droneId');
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
        orderId
      });
    }

    console.log('📧 Debug: Found order for email:', {
      orderId: order._id,
      customerEmail: order.customerInfo?.email,
      hasCustomerInfo: !!order.customerInfo,
      hasDroneId: !!order.droneId,
      droneData: order.droneId ? {
        name: order.droneId.name,
        id: order.droneId._id
      } : 'No drone data'
    });

    // Attempt to send email
    const emailResult = await emailService.sendOrderConfirmation(order);
    
    console.log('✅ Debug: Email sent successfully:', emailResult);

    res.json({
      success: true,
      message: 'Order confirmation email sent successfully',
      emailResult: emailResult,
      order: {
        id: order._id,
        customerEmail: order.customerInfo?.email,
        droneName: order.droneId?.name
      }
    });

  } catch (error) {
    console.error('❌ Debug: Email send failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error.message
    });
  }
});

module.exports = router;