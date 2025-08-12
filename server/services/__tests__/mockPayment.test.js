const mockPaymentService = require('../mockPayment');

describe('MockPaymentService', () => {
  beforeEach(() => {
    // Reset success rate to default for each test
    mockPaymentService.successRate = 95;
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent with correct structure', async () => {
      const paymentData = {
        amount: 999,
        currency: 'USD',
        customerInfo: { email: 'test@example.com' },
        orderId: 'order_123'
      };

      const result = await mockPaymentService.createPaymentIntent(paymentData);

      expect(result).toHaveProperty('id');
      expect(result.id).toMatch(/^pi_mock_/);
      expect(result.amount).toBe(99900); // Amount in cents
      expect(result.currency).toBe('usd');
      expect(result.status).toBe('requires_payment_method');
      expect(result).toHaveProperty('client_secret');
      expect(result.customer).toBe('test@example.com');
      expect(result.metadata.mock).toBe(true);
      expect(result.metadata.order_id).toBe('order_123');
    });

    it('should use default customer email when not provided', async () => {
      const paymentData = {
        amount: 500,
        currency: 'USD'
      };

      const result = await mockPaymentService.createPaymentIntent(paymentData);

      expect(result.customer).toBe('mock@customer.com');
    });

    it('should handle different currencies', async () => {
      const paymentData = {
        amount: 100,
        currency: 'EUR'
      };

      const result = await mockPaymentService.createPaymentIntent(paymentData);

      expect(result.currency).toBe('eur');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment successfully with valid card', async () => {
      const paymentIntentId = 'pi_mock_test_123';
      const paymentMethod = {
        amount: 99900,
        card: {
          number: '4242424242424242',
          exp_month: 12,
          exp_year: 2025,
          cvc: '123'
        }
      };

      // Force success for this test
      mockPaymentService.successRate = 100;

      const result = await mockPaymentService.confirmPayment(paymentIntentId, paymentMethod);

      expect(result.success).toBe(true);
      expect(result.payment.id).toBe(paymentIntentId);
      expect(result.payment.status).toBe('succeeded');
      expect(result.payment.amount_received).toBe(99900);
      expect(result.payment.payment_method.card.last4).toBe('4242');
      expect(result.payment.payment_method.card.brand).toBe('visa');
      expect(result.payment).toHaveProperty('receipt_url');
      expect(result.payment.metadata.mock).toBe(true);
    });

    it('should handle payment failure', async () => {
      const paymentIntentId = 'pi_mock_test_456';
      const paymentMethod = {
        amount: 99900,
        card: {
          number: '4000000000000002', // Declined card
          exp_month: 12,
          exp_year: 2025,
          cvc: '123'
        }
      };

      // Force failure for this test
      mockPaymentService.successRate = 0;

      const result = await mockPaymentService.confirmPayment(paymentIntentId, paymentMethod);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('card_error');
      expect(result.error.code).toBe('card_declined');
      expect(result.error.message).toContain('declined');
    });

    it('should handle invalid card details', async () => {
      const paymentIntentId = 'pi_mock_test_789';
      const paymentMethod = {
        amount: 99900,
        card: {
          number: '', // Invalid card number
          exp_month: 12,
          exp_year: 2025,
          cvc: '123'
        }
      };

      const result = await mockPaymentService.confirmPayment(paymentIntentId, paymentMethod);

      expect(result.success).toBe(false);
    });
  });

  describe('validateMockCard', () => {
    it('should validate Visa card correctly', () => {
      const card = {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2025,
        cvc: '123'
      };

      const result = mockPaymentService.validateMockCard(card);

      expect(result.valid).toBe(true);
      expect(result.brand).toBe('visa');
    });

    it('should validate Mastercard correctly', () => {
      const card = {
        number: '5555555555554444',
        exp_month: 12,
        exp_year: 2025,
        cvc: '123'
      };

      const result = mockPaymentService.validateMockCard(card);

      expect(result.valid).toBe(true);
      expect(result.brand).toBe('mastercard');
    });

    it('should validate American Express correctly', () => {
      const card = {
        number: '378282246310005',
        exp_month: 12,
        exp_year: 2025,
        cvc: '1234'
      };

      const result = mockPaymentService.validateMockCard(card);

      expect(result.valid).toBe(true);
      expect(result.brand).toBe('amex');
    });

    it('should handle missing card details', () => {
      const card = {
        number: '4242424242424242',
        // Missing exp_month, exp_year, cvc
      };

      const result = mockPaymentService.validateMockCard(card);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing card details');
    });

    it('should handle null card', () => {
      const result = mockPaymentService.validateMockCard(null);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Missing card details');
    });
  });

  describe('getPayment', () => {
    it('should retrieve payment details', async () => {
      const paymentIntentId = 'pi_mock_test_retrieve';

      const result = await mockPaymentService.getPayment(paymentIntentId);

      expect(result.id).toBe(paymentIntentId);
      expect(result.status).toBe('succeeded');
      expect(result.amount).toBe(99900);
      expect(result.currency).toBe('usd');
      expect(result.metadata.mock).toBe(true);
      expect(result.metadata).toHaveProperty('retrieved_at');
    });
  });

  describe('createCustomer', () => {
    it('should create a mock customer', async () => {
      const customerData = {
        email: 'customer@example.com',
        name: 'John Doe'
      };

      const result = await mockPaymentService.createCustomer(customerData);

      expect(result.id).toMatch(/^cus_mock_/);
      expect(result.email).toBe('customer@example.com');
      expect(result.name).toBe('John Doe');
      expect(result.metadata.mock).toBe(true);
      expect(result).toHaveProperty('created');
    });
  });

  describe('generateWebhookEvent', () => {
    it('should generate webhook event with correct structure', () => {
      const eventType = 'payment_intent.succeeded';
      const data = {
        id: 'pi_mock_123',
        status: 'succeeded'
      };

      const result = mockPaymentService.generateWebhookEvent(eventType, data);

      expect(result.id).toMatch(/^evt_mock_/);
      expect(result.type).toBe(eventType);
      expect(result.data.object).toEqual(data);
      expect(result.api_version).toBe('2023-10-16');
      expect(result.livemode).toBe(false);
      expect(result.pending_webhooks).toBe(1);
      expect(result.request.id).toMatch(/^req_mock_/);
    });
  });

  describe('delay', () => {
    it('should delay execution for specified time', async () => {
      const startTime = Date.now();
      await mockPaymentService.delay(100);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });
});