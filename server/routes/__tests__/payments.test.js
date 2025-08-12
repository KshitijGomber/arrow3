const request = require('supertest');
const express = require('express');
const paymentRoutes = require('../payments');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/payments', paymentRoutes);

describe('Payment Routes', () => {
  describe('POST /api/payments/create-intent', () => {
    it('should create a payment intent successfully', async () => {
      const paymentData = {
        amount: 999,
        currency: 'USD',
        customerInfo: {
          email: 'test@example.com',
          name: 'Test Customer'
        },
        orderId: 'order_123'
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.paymentIntent).toBeDefined();
      expect(response.body.paymentIntent.id).toMatch(/^pi_mock_/);
      expect(response.body.paymentIntent.amount).toBe(99900); // Amount in cents
      expect(response.body.paymentIntent.currency).toBe('usd');
      expect(response.body.paymentIntent.status).toBe('requires_payment_method');
      expect(response.body.message).toBe('Mock payment intent created successfully');
    });

    it('should return error for invalid amount', async () => {
      const paymentData = {
        amount: 0, // Invalid amount
        currency: 'USD',
        customerInfo: {
          email: 'test@example.com'
        }
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid amount provided');
    });

    it('should return error for negative amount', async () => {
      const paymentData = {
        amount: -100, // Negative amount
        currency: 'USD',
        customerInfo: {
          email: 'test@example.com'
        }
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid amount provided');
    });

    it('should handle missing amount', async () => {
      const paymentData = {
        currency: 'USD',
        customerInfo: {
          email: 'test@example.com'
        }
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid amount provided');
    });
  });

  describe('POST /api/payments/confirm', () => {
    it('should confirm payment successfully', async () => {
      const confirmData = {
        paymentIntentId: 'pi_mock_test_123',
        paymentMethod: {
          amount: 99900,
          card: {
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .send(confirmData);

      // Payment can succeed or fail based on mock success rate
      expect(response.body.success).toBeDefined();
      
      if (response.body.success) {
        expect(response.status).toBe(200);
        expect(response.body.payment).toBeDefined();
        expect(response.body.payment.id).toBe('pi_mock_test_123');
        expect(response.body.message).toBe('Payment processed successfully (mock)');
      } else {
        expect(response.status).toBe(400);
        expect(response.body.error).toBeDefined();
        expect(response.body.message).toBe('Payment failed (mock)');
      }
    });

    it('should return error for missing payment intent ID', async () => {
      const confirmData = {
        paymentMethod: {
          amount: 99900,
          card: {
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .send(confirmData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Missing payment intent ID or payment method');
    });

    it('should return error for missing payment method', async () => {
      const confirmData = {
        paymentIntentId: 'pi_mock_test_123'
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .send(confirmData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Missing payment intent ID or payment method');
    });
  });

  describe('GET /api/payments/:paymentId', () => {
    it('should retrieve payment details successfully', async () => {
      const paymentId = 'pi_mock_test_retrieve';

      const response = await request(app)
        .get(`/api/payments/${paymentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.payment).toBeDefined();
      expect(response.body.payment.id).toBe(paymentId);
      expect(response.body.payment.status).toBe('succeeded');
      expect(response.body.payment.amount).toBe(99900);
      expect(response.body.payment.currency).toBe('usd');
      expect(response.body.payment.metadata.mock).toBe(true);
      expect(response.body.message).toBe('Payment details retrieved (mock)');
    });

    it('should handle payment ID parameter correctly', async () => {
      const paymentId = 'pi_mock_different_id';

      const response = await request(app)
        .get(`/api/payments/${paymentId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.payment.id).toBe(paymentId);
    });
  });

  describe('POST /api/payments/webhook', () => {
    it('should process webhook successfully', async () => {
      const webhookData = {
        id: 'pi_mock_webhook_test',
        status: 'succeeded',
        amount: 99900
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.event).toBeDefined();
      expect(response.body.event.id).toMatch(/^evt_mock_/);
      expect(response.body.event.type).toBe('payment_intent.succeeded');
      expect(response.body.event.data.object).toEqual(webhookData);
      expect(response.body.event.api_version).toBe('2023-10-16');
      expect(response.body.event.livemode).toBe(false);
      expect(response.body.message).toBe('Mock webhook processed');
    });

    it('should handle empty webhook data', async () => {
      const response = await request(app)
        .post('/api/payments/webhook')
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.event).toBeDefined();
      expect(response.body.event.data.object).toEqual({});
    });

    it('should handle webhook with complex data', async () => {
      const webhookData = {
        id: 'pi_mock_complex',
        status: 'succeeded',
        amount: 199900,
        metadata: {
          order_id: 'order_456',
          customer_id: 'cus_789'
        },
        payment_method: {
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.event.data.object).toEqual(webhookData);
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON in create-intent', async () => {
      const response = await request(app)
        .post('/api/payments/create-intent')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      // Express will handle malformed JSON and return 400
    });

    it('should handle malformed JSON in confirm', async () => {
      const response = await request(app)
        .post('/api/payments/confirm')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      // Express will handle malformed JSON and return 400
    });
  });
});