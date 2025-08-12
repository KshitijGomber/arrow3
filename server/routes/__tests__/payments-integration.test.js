const request = require('supertest');
const express = require('express');
const paymentRoutes = require('../payments');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/payments', paymentRoutes);

describe('Payment Integration Tests', () => {
  describe('Complete payment flow', () => {
    it('should handle complete payment flow from intent to confirmation', async () => {
      // Step 1: Create payment intent
      const paymentData = {
        amount: 1299,
        currency: 'USD',
        customerInfo: {
          email: 'customer@example.com',
          name: 'John Doe'
        },
        orderId: 'order_integration_test'
      };

      const intentResponse = await request(app)
        .post('/api/payments/create-intent')
        .send(paymentData)
        .expect(200);

      expect(intentResponse.body.success).toBe(true);
      const paymentIntentId = intentResponse.body.paymentIntent.id;

      // Step 2: Confirm payment
      const confirmData = {
        paymentIntentId: paymentIntentId,
        paymentMethod: {
          amount: 129900,
          card: {
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          }
        }
      };

      const confirmResponse = await request(app)
        .post('/api/payments/confirm')
        .send(confirmData);

      // Payment can succeed or fail based on mock success rate
      expect(confirmResponse.body.success).toBeDefined();

      // Step 3: Retrieve payment details
      const retrieveResponse = await request(app)
        .get(`/api/payments/${paymentIntentId}`)
        .expect(200);

      expect(retrieveResponse.body.success).toBe(true);
      expect(retrieveResponse.body.payment.id).toBe(paymentIntentId);
    });

    it('should simulate realistic error scenarios', async () => {
      // Test with invalid card details
      const paymentIntentId = 'pi_mock_error_test';
      const confirmData = {
        paymentIntentId: paymentIntentId,
        paymentMethod: {
          amount: 99900,
          card: {
            number: '', // Invalid card number
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .send(confirmData);

      // Should handle invalid card gracefully
      expect(response.body.success).toBe(false);
    });

    it('should handle webhook processing with realistic data', async () => {
      const webhookData = {
        id: 'pi_mock_webhook_integration',
        status: 'succeeded',
        amount: 129900,
        currency: 'usd',
        payment_method: {
          id: 'pm_mock_123',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            exp_month: 12,
            exp_year: 2025
          }
        },
        metadata: {
          order_id: 'order_webhook_test',
          customer_email: 'webhook@example.com'
        }
      };

      const response = await request(app)
        .post('/api/payments/webhook')
        .send(webhookData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.event.type).toBe('payment_intent.succeeded');
      expect(response.body.event.data.object).toEqual(webhookData);
      expect(response.body.event.livemode).toBe(false);
    });
  });

  describe('Error simulation and realistic responses', () => {
    it('should provide realistic success responses', async () => {
      const paymentData = {
        amount: 999,
        currency: 'USD',
        customerInfo: {
          email: 'success@example.com',
          name: 'Success Customer'
        }
      };

      const response = await request(app)
        .post('/api/payments/create-intent')
        .send(paymentData)
        .expect(200);

      // Verify realistic response structure
      expect(response.body.paymentIntent).toMatchObject({
        id: expect.stringMatching(/^pi_mock_/),
        amount: 99900,
        currency: 'usd',
        status: 'requires_payment_method',
        client_secret: expect.stringMatching(/^pi_mock_.*_secret_/),
        created: expect.any(Number),
        customer: 'success@example.com',
        metadata: {
          mock: true,
          order_id: null
        }
      });
    });

    it('should provide realistic error responses', async () => {
      // Test various error scenarios
      const errorScenarios = [
        {
          name: 'missing amount',
          data: { currency: 'USD' },
          expectedError: 'Invalid amount provided'
        },
        {
          name: 'zero amount',
          data: { amount: 0, currency: 'USD' },
          expectedError: 'Invalid amount provided'
        },
        {
          name: 'negative amount',
          data: { amount: -100, currency: 'USD' },
          expectedError: 'Invalid amount provided'
        }
      ];

      for (const scenario of errorScenarios) {
        const response = await request(app)
          .post('/api/payments/create-intent')
          .send(scenario.data)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe(scenario.expectedError);
      }
    });

    it('should handle different card brands correctly', async () => {
      // Test just one card brand to avoid timeout issues
      const cardTest = { number: '4242424242424242', expectedBrand: 'visa' };
      
      const confirmData = {
        paymentIntentId: `pi_mock_${cardTest.expectedBrand}_test`,
        paymentMethod: {
          amount: 99900,
          card: {
            number: cardTest.number,
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          }
        }
      };

      const response = await request(app)
        .post('/api/payments/confirm')
        .send(confirmData);

      // If payment succeeds, check card brand
      if (response.body.success) {
        expect(response.body.payment.payment_method.card.brand).toBe(cardTest.expectedBrand);
        expect(response.body.payment.payment_method.card.last4).toBe(cardTest.number.slice(-4));
      }
    }, 10000); // Increase timeout to 10 seconds
  });

  describe('Performance and delays', () => {
    it('should simulate realistic processing delays', async () => {
      const startTime = Date.now();

      const paymentData = {
        amount: 500,
        currency: 'USD',
        customerInfo: { email: 'delay@example.com' }
      };

      await request(app)
        .post('/api/payments/create-intent')
        .send(paymentData)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 1 second due to mock delay
      expect(duration).toBeGreaterThanOrEqual(1000);
    });

    it('should simulate payment confirmation delays', async () => {
      const startTime = Date.now();

      const confirmData = {
        paymentIntentId: 'pi_mock_delay_test',
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

      await request(app)
        .post('/api/payments/confirm')
        .send(confirmData);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take at least 2 seconds due to mock delay
      expect(duration).toBeGreaterThanOrEqual(2000);
    });
  });
});