/**
 * Mock Payment Service
 * Simulates payment processing without real transactions
 */

class MockPaymentService {
  constructor() {
    this.successRate = parseInt(process.env.PAYMENT_SUCCESS_RATE) || 95;
    this.paymentIntents = new Map(); // Store payment intents with order IDs
  }

  /**
   * Create a mock payment intent
   * @param {Object} paymentData - Payment information
   * @returns {Object} Mock payment intent
   */
  async createPaymentIntent(paymentData) {
    const { amount, currency = 'USD', customerInfo } = paymentData;

    // Simulate processing delay
    await this.delay(1000);

    const paymentIntent = {
      id: `pi_mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount * 100, // Convert to cents like Stripe
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      created: Math.floor(Date.now() / 1000),
      customer: customerInfo?.email || 'mock@customer.com',
      metadata: {
        mock: true,
        order_id: paymentData.orderId || null
      }
    };

    // Store the payment intent with order ID for later reference
    this.paymentIntents.set(paymentIntent.id, {
      orderId: paymentData.orderId,
      amount: amount,
      customerInfo: customerInfo,
      created: paymentIntent.created
    });

    console.log('🎭 Mock Payment Intent Created:', paymentIntent.id);
    return paymentIntent;
  }

  /**
   * Confirm a mock payment
   * @param {string} paymentIntentId - Payment intent ID
   * @param {Object} paymentMethod - Payment method details
   * @returns {Object} Payment confirmation result
   */
  async confirmPayment(paymentIntentId, paymentMethod) {
    // Simulate processing delay
    await this.delay(2000);

    // Simulate success/failure based on success rate
    const isSuccess = Math.random() * 100 < this.successRate;

    // Mock card validation (always pass for demo)
    const cardValidation = this.validateMockCard(paymentMethod.card);

    if (isSuccess && cardValidation.valid) {
      const confirmedPayment = {
        id: paymentIntentId,
        status: 'succeeded',
        amount_received: paymentMethod.amount || 0,
        currency: 'usd',
        payment_method: {
          id: `pm_mock_${Date.now()}`,
          type: 'card',
          card: {
            brand: cardValidation.brand,
            last4: paymentMethod.card.number.slice(-4),
            exp_month: paymentMethod.card.exp_month,
            exp_year: paymentMethod.card.exp_year
          }
        },
        receipt_url: `https://mock-receipts.com/receipt_${paymentIntentId}`,
        created: Math.floor(Date.now() / 1000),
        metadata: {
          mock: true,
          processed_at: new Date().toISOString(),
          order_id: this.getOrderIdFromPaymentIntent(paymentIntentId)
        }
      };

      console.log('✅ Mock Payment Succeeded:', paymentIntentId);
      return { success: true, payment: confirmedPayment };
    } else {
      console.log('❌ Mock Payment Failed:', paymentIntentId);
      return {
        success: false,
        error: {
          type: 'card_error',
          code: 'card_declined',
          message: 'Your card was declined. (This is a mock error for demonstration)',
          decline_code: 'generic_decline'
        }
      };
    }
  }

  /**
   * Validate mock card details (always returns valid for demo)
   * @param {Object} card - Card details
   * @returns {Object} Validation result
   */
  validateMockCard(card) {
    if (!card || !card.number || !card.exp_month || !card.exp_year || !card.cvc) {
      return { valid: false, error: 'Missing card details' };
    }

    // Determine card brand based on first digits
    const cardNumber = card.number.replace(/\s/g, '');
    let brand = 'unknown';

    if (cardNumber.startsWith('4')) brand = 'visa';
    else if (cardNumber.startsWith('5')) brand = 'mastercard';
    else if (cardNumber.startsWith('3')) brand = 'amex';
    else if (cardNumber.startsWith('6')) brand = 'discover';

    // For demo purposes, all cards are valid
    return {
      valid: true,
      brand: brand,
      message: 'Mock card validation passed'
    };
  }

  /**
   * Get mock payment details
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Object} Payment details
   */
  async getPayment(paymentIntentId) {
    await this.delay(500);

    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 99900, // $999.00 in cents
      currency: 'usd',
      created: Math.floor(Date.now() / 1000),
      metadata: {
        mock: true,
        retrieved_at: new Date().toISOString()
      }
    };
  }

  /**
   * Create a mock customer
   * @param {Object} customerData - Customer information
   * @returns {Object} Mock customer
   */
  async createCustomer(customerData) {
    await this.delay(500);

    return {
      id: `cus_mock_${Date.now()}`,
      email: customerData.email,
      name: customerData.name,
      created: Math.floor(Date.now() / 1000),
      metadata: {
        mock: true
      }
    };
  }

  /**
   * Get order ID from payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {string|null} Order ID
   */
  getOrderIdFromPaymentIntent(paymentIntentId) {
    const paymentIntent = this.paymentIntents.get(paymentIntentId);
    return paymentIntent?.orderId || null;
  }

  /**
   * Simulate processing delay
   * @param {number} ms - Milliseconds to delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate mock webhook event
   * @param {string} eventType - Type of event
   * @param {Object} data - Event data
   * @returns {Object} Mock webhook event
   */
  generateWebhookEvent(eventType, data) {
    return {
      id: `evt_mock_${Date.now()}`,
      type: eventType,
      created: Math.floor(Date.now() / 1000),
      data: {
        object: data
      },
      api_version: '2023-10-16',
      livemode: false,
      pending_webhooks: 1,
      request: {
        id: `req_mock_${Date.now()}`,
        idempotency_key: null
      }
    };
  }
}

module.exports = new MockPaymentService();