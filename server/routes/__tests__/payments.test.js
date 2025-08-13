const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const Drone = require('../../models/Drone');
const Order = require('../../models/Order');
const paymentRoutes = require('../payments');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/payments', paymentRoutes);

describe('Payment Routes', () => {
  let customerUser;
  let customerToken;
  let testDrone;
  let testOrder;

  beforeEach(async () => {
    // Create customer user
    const hashedPassword = await bcrypt.hash('Password123!', 4);
    customerUser = await User.create({
      firstName: 'Customer',
      lastName: 'User',
      email: 'customer@example.com',
      password: hashedPassword,
      role: 'customer'
    });

    // Generate token
    const { generateToken } = require('../../middleware/auth');
    customerToken = generateToken(customerUser._id, customerUser.role);

    // Create test drone
    testDrone = await Drone.create({
      name: 'Test Drone Pro',
      model: 'TDP-2024',
      price: 1299,
      description: 'A test drone for testing purposes',
      category: 'camera',
      images: ['https://example.com/drone1.jpg'],
      specifications: {
        weight: 900,
        dimensions: { length: 35, width: 35, height: 12 },
        batteryCapacity: 5000,
        flightTime: 30,
        maxSpeed: 65,
        cameraResolution: '4K',
        stabilization: '3-Axis Gimbal',
        controlRange: 7000,
        windResistanceLevel: 6,
        appCompatibility: ['iOS', 'Android']
      },
      stockQuantity: 10,
      inStock: true
    });

    // Create test order
    testOrder = await Order.create({
      userId: customerUser._id,
      droneId: testDrone._id,
      quantity: 1,
      totalAmount: 1299,
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      customerInfo: {
        firstName: 'Customer',
        lastName: 'User',
        email: 'customer@example.com',
        phone: '+1234567890'
      }
    });
  });

  describe('POST /api/payments/create-intent', () => {
    const validPaymentIntentData = {
      amount: 1299,
      currency: 'USD',
      orderId: null, // Will be set in test
      customerInfo: {
        firstName: 'Customer',
        lastName: 'User',
        email: 'customer@example.com',
        phone: '+1234567890'
      }
    };

    beforeEach(() => {
      validPaymentIntentData.orderId = testOrder._id.toString();
    });

    it('should create payment intent with authentication', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validPaymentIntentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment intent created successfully');
      expect(response.body.data.paymentIntent).toBeDefined();
      expect(response.body.data.paymentIntent.id).toMatch(/^pi_mock_/);
      expect(response.body.data.paymentIntent.amount).toBe(129900); // Amount in cents
      expect(response.body.data.paymentIntent.currency).toBe('usd');
      expect(response.body.data.paymentIntent.status).toBe('requires_payment_method');
    });

    it('should not create payment intent without authentication', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .send(validPaymentIntentData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        currency: 'USD'
        // Missing amount, orderId, customerInfo
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('should validate amount is positive', async () => {
      const invalidData = {
        ...validPaymentIntentData,
        amount: -100
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'amount'
        })
      );
    });

    it('should validate currency format', async () => {
      const invalidData = {
        ...validPaymentIntentData,
        currency: 'INVALID'
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'currency'
        })
      );
    });

    it('should validate customer info fields', async () => {
      const invalidData = {
        ...validPaymentIntentData,
        customerInfo: {
          firstName: '',
          lastName: 'User',
          email: 'invalid-email',
          phone: '123'
        }
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should handle order not found', async () => {
      const invalidData = {
        ...validPaymentIntentData,
        orderId: '507f1f77bcf86cd799439011'
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('POST /api/payments/confirm', () => {
    let paymentIntentId;

    beforeEach(async () => {
      // Create a payment intent first
      const paymentIntentData = {
        amount: 1299,
        currency: 'USD',
        orderId: testOrder._id.toString(),
        customerInfo: {
          firstName: 'Customer',
          lastName: 'User',
          email: 'customer@example.com',
          phone: '+1234567890'
        }
      };

      const intentResponse = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(paymentIntentData);

      paymentIntentId = intentResponse.body.data.paymentIntent.id;
    });

    const validConfirmData = {
      paymentIntentId: null, // Will be set in test
      paymentMethod: {
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2028,
          cvc: '123'
        },
        billing_details: {
          name: 'Customer User',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'United States'
          }
        },
        amount: 129900
      }
    };

    beforeEach(() => {
      validConfirmData.paymentIntentId = paymentIntentId;
    });

    it('should confirm payment with valid data', async () => {
      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(validConfirmData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment confirmed successfully');
      expect(response.body.data.paymentIntent).toBeDefined();
      expect(response.body.data.paymentIntent.status).toBe('succeeded');

      // Verify order payment status was updated
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.paymentStatus).toBe('completed');
      expect(updatedOrder.paymentIntentId).toBe(paymentIntentId);
    });

    it('should handle payment failure simulation', async () => {
      // Use a card number that triggers failure
      const failingConfirmData = {
        ...validConfirmData,
        paymentMethod: {
          ...validConfirmData.paymentMethod,
          card: {
            ...validConfirmData.paymentMethod.card,
            number: '4000000000000002' // Declined card
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(failingConfirmData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Payment failed');

      // Verify order payment status remains pending
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.paymentStatus).toBe('pending');
    });

    it('should not confirm payment without authentication', async () => {
      const response = await request(app)
        .post('/api/payments/confirm')
        .send(validConfirmData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        paymentMethod: {
          card: {
            number: '4242424242424242'
            // Missing other required fields
          }
        }
        // Missing paymentIntentId
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate card number format', async () => {
      const invalidData = {
        ...validConfirmData,
        paymentMethod: {
          ...validConfirmData.paymentMethod,
          card: {
            ...validConfirmData.paymentMethod.card,
            number: '1234' // Invalid card number
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({
          field: 'paymentMethod.card.number'
        })
      );
    });

    it('should validate expiry date', async () => {
      const invalidData = {
        ...validConfirmData,
        paymentMethod: {
          ...validConfirmData.paymentMethod,
          card: {
            ...validConfirmData.paymentMethod.card,
            exp_month: 13, // Invalid month
            exp_year: 2020 // Past year
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should handle non-existent payment intent', async () => {
      const invalidData = {
        ...validConfirmData,
        paymentIntentId: 'pi_invalid_123'
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(invalidData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Payment intent not found');
    });
  });

  describe('GET /api/payments/:paymentId', () => {
    let paymentIntentId;

    beforeEach(async () => {
      // Create and confirm a payment
      const paymentIntentData = {
        amount: 1299,
        currency: 'USD',
        orderId: testOrder._id.toString(),
        customerInfo: {
          firstName: 'Customer',
          lastName: 'User',
          email: 'customer@example.com',
          phone: '+1234567890'
        }
      };

      const intentResponse = await request(app)
        .post('/api/payments/create-intent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(paymentIntentData);

      paymentIntentId = intentResponse.body.data.paymentIntent.id;
    });

    it('should get payment details with authentication', async () => {
      const response = await request(app)
        .get(`/api/payments/${paymentIntentId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment details retrieved successfully');
      expect(response.body.data.paymentIntent).toBeDefined();
      expect(response.body.data.paymentIntent.id).toBe(paymentIntentId);
    });

    it('should not get payment details without authentication', async () => {
      const response = await request(app)
        .get(`/api/payments/${paymentIntentId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/pi_invalid_123')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Payment not found');
    });
  });

  describe('POST /api/payments/webhook', () => {
    const validWebhookData = {
      id: 'evt_test_webhook',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          object: 'payment_intent',
          amount: 129900,
          currency: 'usd',
          status: 'succeeded',
          metadata: {
            orderId: null // Will be set in test
          }
        }
      }
    };

    beforeEach(() => {
      validWebhookData.data.object.metadata.orderId = testOrder._id.toString();
    });

    it('should handle successful payment webhook', async () => {
      const response = await request(app)
        .post('/api/payments/webhook')
        .send(validWebhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Webhook processed successfully');

      // Verify order was updated
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.paymentStatus).toBe('completed');
      expect(updatedOrder.status).toBe('confirmed');
    });

    it('should handle failed payment webhook', async () => {
      const failedWebhookData = {
        ...validWebhookData,
        type: 'payment_intent.payment_failed',
        data: {
          ...validWebhookData.data,
          object: {
            ...validWebhookData.data.object,
            status: 'requires_payment_method'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(failedWebhookData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify order payment status was updated to failed
      const updatedOrder = await Order.findById(testOrder._id);
      expect(updatedOrder.paymentStatus).toBe('failed');
    });

    it('should handle unknown event types gracefully', async () => {
      const unknownWebhookData = {
        ...validWebhookData,
        type: 'unknown.event.type'
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(unknownWebhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Webhook received but not processed');
    });

    it('should handle webhook with missing order', async () => {
      const invalidWebhookData = {
        ...validWebhookData,
        data: {
          ...validWebhookData.data,
          object: {
            ...validWebhookData.data.object,
            metadata: {
              orderId: '507f1f77bcf86cd799439011'
            }
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(invalidWebhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should not crash even if order is not found
    });
  });
});