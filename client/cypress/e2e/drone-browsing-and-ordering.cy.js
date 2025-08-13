describe('Drone Browsing and Ordering Flow', () => {
  let testDrone;

  before(() => {
    // Set up test data
    cy.loginAsAdmin();
    cy.createTestDrone({
      name: 'E2E Test Drone Pro',
      model: 'E2E-2024',
      price: 1599,
      featured: true,
      stockQuantity: 5
    }).then((response) => {
      testDrone = response.body.data.drone;
    });
  });

  after(() => {
    // Cleanup test data
    if (testDrone) {
      cy.loginAsAdmin();
      cy.deleteDrone(testDrone._id);
    }
  });

  beforeEach(() => {
    cy.logout();
  });

  describe('Landing Page', () => {
    it('should display the landing page with hero section', () => {
      cy.visit('/');
      
      // Check hero section
      cy.contains('Take Flight Now').should('be.visible');
      cy.get('[data-testid="hero-section"]').should('be.visible');
      
      // Check navigation
      cy.contains('Camera Drones').should('be.visible');
      cy.contains('Handheld').should('be.visible');
      cy.contains('Power').should('be.visible');
      cy.contains('Specialized').should('be.visible');
    });

    it('should display feature highlights', () => {
      cy.visit('/');
      
      cy.contains('4K Camera').should('be.visible');
      cy.contains('Max Speed').should('be.visible');
      cy.contains('AI Auto-Stabilization').should('be.visible');
      cy.contains('Gesture Control').should('be.visible');
    });

    it('should navigate to drone catalog when "Show Me the Drone in Action" is clicked', () => {
      cy.visit('/');
      
      cy.contains('Show Me the Drone in Action').click();
      cy.url().should('include', '/drones');
    });

    it('should navigate to order page when "Take Flight Now" is clicked', () => {
      cy.visit('/');
      
      cy.contains('Take Flight Now').click();
      cy.url().should('include', '/order');
    });
  });

  describe('Drone Catalog', () => {
    beforeEach(() => {
      cy.intercept('GET', `${Cypress.env('apiUrl')}/drones*`).as('getDrones');
    });

    it('should display drone catalog with test drone', () => {
      cy.visit('/drones');
      cy.waitForApi('@getDrones');
      
      cy.contains('E2E Test Drone Pro').should('be.visible');
      cy.contains('E2E-2024').should('be.visible');
      cy.contains('$1,599').should('be.visible');
    });

    it('should filter drones by category', () => {
      cy.visit('/drones');
      cy.waitForApi('@getDrones');
      
      // Apply camera filter
      cy.get('[data-testid="category-filter"]').click();
      cy.get('[data-value="camera"]').click();
      
      cy.waitForApi('@getDrones');
      cy.contains('E2E Test Drone Pro').should('be.visible');
    });

    it('should search for drones', () => {
      cy.visit('/drones');
      cy.waitForApi('@getDrones');
      
      cy.get('[data-testid="search-input"]').type('E2E Test');
      cy.get('[data-testid="search-button"]').click();
      
      cy.waitForApi('@getDrones');
      cy.contains('E2E Test Drone Pro').should('be.visible');
    });

    it('should navigate to drone details when drone card is clicked', () => {
      cy.visit('/drones');
      cy.waitForApi('@getDrones');
      
      cy.contains('E2E Test Drone Pro').click();
      cy.url().should('include', `/drones/${testDrone._id}`);
    });
  });

  describe('Drone Details', () => {
    beforeEach(() => {
      cy.intercept('GET', `${Cypress.env('apiUrl')}/drones/${testDrone._id}`).as('getDroneDetails');
    });

    it('should display drone details and specifications', () => {
      cy.visit(`/drones/${testDrone._id}`);
      cy.waitForApi('@getDroneDetails');
      
      cy.contains('E2E Test Drone Pro').should('be.visible');
      cy.contains('E2E-2024').should('be.visible');
      cy.contains('$1,599').should('be.visible');
      
      // Check specifications
      cy.contains('Weight').should('be.visible');
      cy.contains('Flight Time').should('be.visible');
      cy.contains('Max Speed').should('be.visible');
      cy.contains('Camera Resolution').should('be.visible');
    });

    it('should navigate to order page when "Order Now" is clicked', () => {
      cy.visit(`/drones/${testDrone._id}`);
      cy.waitForApi('@getDroneDetails');
      
      cy.contains('Order Now').click();
      cy.url().should('include', `/order/${testDrone._id}`);
    });
  });

  describe('Order Page', () => {
    beforeEach(() => {
      cy.intercept('GET', `${Cypress.env('apiUrl')}/drones/${testDrone._id}`).as('getDroneDetails');
      cy.intercept('POST', `${Cypress.env('apiUrl')}/orders`).as('createOrder');
    });

    it('should display order form with drone details', () => {
      cy.visit(`/order/${testDrone._id}`);
      cy.waitForApi('@getDroneDetails');
      
      cy.contains('E2E Test Drone Pro').should('be.visible');
      cy.contains('$1,599').should('be.visible');
      
      // Check form fields
      cy.get('[data-testid="quantity-input"]').should('be.visible');
      cy.get('[data-testid="customer-first-name"]').should('be.visible');
      cy.get('[data-testid="customer-last-name"]').should('be.visible');
      cy.get('[data-testid="customer-email"]').should('be.visible');
      cy.get('[data-testid="customer-phone"]').should('be.visible');
      cy.get('[data-testid="shipping-street"]').should('be.visible');
    });

    it('should calculate total price based on quantity', () => {
      cy.visit(`/order/${testDrone._id}`);
      cy.waitForApi('@getDroneDetails');
      
      // Change quantity to 2
      cy.get('[data-testid="quantity-input"]').clear().type('2');
      
      // Check total price
      cy.contains('$3,198').should('be.visible'); // 1599 * 2
    });

    it('should create order and navigate to payment', () => {
      cy.visit(`/order/${testDrone._id}`);
      cy.waitForApi('@getDroneDetails');
      
      // Fill order form
      cy.get('[data-testid="quantity-input"]').clear().type('1');
      cy.get('[data-testid="customer-first-name"]').type('John');
      cy.get('[data-testid="customer-last-name"]').type('Doe');
      cy.get('[data-testid="customer-email"]').type('john@example.com');
      cy.get('[data-testid="customer-phone"]').type('+1234567890');
      cy.get('[data-testid="shipping-street"]').type('123 Main St');
      cy.get('[data-testid="shipping-city"]').type('New York');
      cy.get('[data-testid="shipping-state"]').type('NY');
      cy.get('[data-testid="shipping-zip"]').type('10001');
      cy.get('[data-testid="shipping-country"]').type('United States');
      
      // Submit order
      cy.get('[data-testid="place-order-button"]').click();
      cy.waitForApi('@createOrder');
      
      cy.url().should('include', '/payment');
    });

    it('should validate required fields', () => {
      cy.visit(`/order/${testDrone._id}`);
      cy.waitForApi('@getDroneDetails');
      
      // Try to submit without filling required fields
      cy.get('[data-testid="place-order-button"]').click();
      
      // Should show validation errors
      cy.contains('required').should('be.visible');
    });
  });

  describe('Payment Page', () => {
    let testOrder;

    beforeEach(() => {
      // Create a test order first
      cy.loginAsCustomer();
      cy.createTestOrder({
        droneId: testDrone._id,
        quantity: 1,
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'United States'
        },
        customerInfo: {
          firstName: 'Test',
          lastName: 'Customer',
          email: 'customer@example.com',
          phone: '+1234567890'
        }
      }).then((response) => {
        testOrder = response.body.data.order;
      });

      cy.intercept('POST', `${Cypress.env('apiUrl')}/payments/create-intent`).as('createPaymentIntent');
      cy.intercept('POST', `${Cypress.env('apiUrl')}/payments/confirm`).as('confirmPayment');
    });

    it('should display payment form with order summary', () => {
      cy.visit(`/payment?orderId=${testOrder._id}`);
      
      cy.contains('Payment Information').should('be.visible');
      cy.contains('Demo Payment System').should('be.visible');
      
      // Check payment form fields
      cy.get('[data-testid="card-number-input"]').should('be.visible');
      cy.get('[data-testid="expiry-month-input"]').should('be.visible');
      cy.get('[data-testid="expiry-year-input"]').should('be.visible');
      cy.get('[data-testid="cvc-input"]').should('be.visible');
      cy.get('[data-testid="cardholder-name-input"]').should('be.visible');
      
      // Check order summary
      cy.contains('E2E Test Drone Pro').should('be.visible');
      cy.contains('$1,599').should('be.visible');
    });

    it('should fill test data when "Fill Test Data" button is clicked', () => {
      cy.visit(`/payment?orderId=${testOrder._id}`);
      
      cy.contains('Fill Test Data').click();
      
      // Check that form is filled
      cy.get('[data-testid="card-number-input"]').should('not.have.value', '');
      cy.get('[data-testid="cardholder-name-input"]').should('have.value', 'Test User');
    });

    it('should process payment successfully', () => {
      cy.visit(`/payment?orderId=${testOrder._id}`);
      
      // Fill payment form
      cy.fillPaymentForm();
      
      // Fill billing address
      cy.get('[data-testid="billing-street"]').type('123 Main St');
      cy.get('[data-testid="billing-city"]').type('New York');
      cy.get('[data-testid="billing-state"]').type('NY');
      cy.get('[data-testid="billing-zip"]').type('10001');
      cy.get('[data-testid="billing-country"]').clear().type('United States');
      
      // Submit payment
      cy.get('[data-testid="submit-payment-button"]').click();
      
      cy.waitForApi('@createPaymentIntent');
      cy.waitForApi('@confirmPayment');
      
      // Should show success message
      cy.contains('Payment completed successfully', { timeout: 15000 }).should('be.visible');
      cy.contains('Order Confirmed').should('be.visible');
    });

    it('should validate payment form fields', () => {
      cy.visit(`/payment?orderId=${testOrder._id}`);
      
      // Try to submit without filling required fields
      cy.get('[data-testid="submit-payment-button"]').click();
      
      // Should show validation errors
      cy.contains('Card number is required').should('be.visible');
      cy.contains('Cardholder name is required').should('be.visible');
    });

    it('should handle payment failure gracefully', () => {
      cy.visit(`/payment?orderId=${testOrder._id}`);
      
      // Fill payment form with failing card
      cy.fillPaymentForm({
        cardNumber: '4000000000000002' // Declined card
      });
      
      // Fill billing address
      cy.get('[data-testid="billing-street"]').type('123 Main St');
      cy.get('[data-testid="billing-city"]').type('New York');
      cy.get('[data-testid="billing-state"]').type('NY');
      cy.get('[data-testid="billing-zip"]').type('10001');
      cy.get('[data-testid="billing-country"]').clear().type('United States');
      
      // Submit payment
      cy.get('[data-testid="submit-payment-button"]').click();
      
      // Should show error message
      cy.contains('Payment failed', { timeout: 15000 }).should('be.visible');
    });
  });

  describe('Complete User Journey', () => {
    it('should complete the entire drone purchase flow', () => {
      // Start from landing page
      cy.visit('/');
      cy.contains('Show Me the Drone in Action').click();
      
      // Browse drones
      cy.url().should('include', '/drones');
      cy.contains('E2E Test Drone Pro').should('be.visible');
      
      // View drone details
      cy.contains('E2E Test Drone Pro').click();
      cy.url().should('include', `/drones/${testDrone._id}`);
      cy.contains('Order Now').click();
      
      // Fill order form
      cy.url().should('include', `/order/${testDrone._id}`);
      cy.get('[data-testid="quantity-input"]').clear().type('1');
      cy.get('[data-testid="customer-first-name"]').type('John');
      cy.get('[data-testid="customer-last-name"]').type('Doe');
      cy.get('[data-testid="customer-email"]').type('john@example.com');
      cy.get('[data-testid="customer-phone"]').type('+1234567890');
      cy.get('[data-testid="shipping-street"]').type('123 Main St');
      cy.get('[data-testid="shipping-city"]').type('New York');
      cy.get('[data-testid="shipping-state"]').type('NY');
      cy.get('[data-testid="shipping-zip"]').type('10001');
      cy.get('[data-testid="shipping-country"]').type('United States');
      
      cy.get('[data-testid="place-order-button"]').click();
      
      // Complete payment
      cy.url().should('include', '/payment');
      cy.contains('Fill Test Data').click();
      
      // Fill billing address
      cy.get('[data-testid="billing-street"]').type('123 Main St');
      cy.get('[data-testid="billing-city"]').type('New York');
      cy.get('[data-testid="billing-state"]').type('NY');
      cy.get('[data-testid="billing-zip"]').type('10001');
      cy.get('[data-testid="billing-country"]').clear().type('United States');
      
      cy.get('[data-testid="submit-payment-button"]').click();
      
      // Verify success
      cy.contains('Order Confirmed', { timeout: 15000 }).should('be.visible');
      cy.contains('Payment completed successfully').should('be.visible');
    });
  });
});