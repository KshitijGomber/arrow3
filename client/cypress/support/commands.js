// Custom commands for Arrow3 Aerospace Platform

// Authentication commands
Cypress.Commands.add('loginAsCustomer', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email: Cypress.env('customerEmail'),
      password: Cypress.env('customerPassword')
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('token', response.body.data.accessToken);
    cy.setCookie('token', response.body.data.accessToken);
  });
});

Cypress.Commands.add('loginAsAdmin', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email: Cypress.env('adminEmail'),
      password: Cypress.env('adminPassword')
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    window.localStorage.setItem('token', response.body.data.accessToken);
    cy.setCookie('token', response.body.data.accessToken);
  });
});

Cypress.Commands.add('logout', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

// User registration command
Cypress.Commands.add('registerUser', (userData) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: userData,
    failOnStatusCode: false
  });
});

// Drone management commands
Cypress.Commands.add('createTestDrone', (droneData = {}) => {
  const defaultDroneData = {
    name: `Test Drone ${Date.now()}`,
    model: 'TD-2024',
    price: 1299,
    description: 'A test drone for E2E testing',
    category: 'camera',
    specifications: {
      weight: 900,
      dimensions: {
        length: 35,
        width: 35,
        height: 12
      },
      batteryCapacity: 5000,
      flightTime: 30,
      maxSpeed: 65,
      cameraResolution: '4K',
      stabilization: '3-Axis Gimbal',
      controlRange: 7000,
      gpsSupport: true,
      obstacleAvoidance: true,
      returnToHome: true,
      windResistanceLevel: 6,
      appCompatibility: ['iOS', 'Android'],
      aiModes: ['Follow Me', 'Orbit Mode']
    },
    stockQuantity: 10,
    inStock: true,
    featured: false,
    ...droneData
  };

  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/drones`,
    body: defaultDroneData,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('token')}`
    }
  });
});

Cypress.Commands.add('deleteDrone', (droneId) => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/drones/${droneId}`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('token')}`
    },
    failOnStatusCode: false
  });
});

// Order management commands
Cypress.Commands.add('createTestOrder', (orderData) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/orders`,
    body: orderData,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('token')}`
    }
  });
});

// Payment commands
Cypress.Commands.add('createPaymentIntent', (paymentData) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/payments/create-intent`,
    body: paymentData,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('token')}`
    }
  });
});

// UI interaction helpers
Cypress.Commands.add('fillDroneForm', (droneData) => {
  cy.get('[data-testid="drone-name-input"]').clear().type(droneData.name);
  cy.get('[data-testid="drone-model-input"]').clear().type(droneData.model);
  cy.get('[data-testid="drone-price-input"]').clear().type(droneData.price.toString());
  cy.get('[data-testid="drone-description-input"]').clear().type(droneData.description);
  cy.get('[data-testid="drone-category-select"]').click();
  cy.get(`[data-value="${droneData.category}"]`).click();
  
  // Fill specifications
  cy.get('[data-testid="spec-weight-input"]').clear().type(droneData.specifications.weight.toString());
  cy.get('[data-testid="spec-battery-input"]').clear().type(droneData.specifications.batteryCapacity.toString());
  cy.get('[data-testid="spec-flight-time-input"]').clear().type(droneData.specifications.flightTime.toString());
  cy.get('[data-testid="spec-max-speed-input"]').clear().type(droneData.specifications.maxSpeed.toString());
  cy.get('[data-testid="spec-control-range-input"]').clear().type(droneData.specifications.controlRange.toString());
  
  // Fill dimensions
  cy.get('[data-testid="spec-length-input"]').clear().type(droneData.specifications.dimensions.length.toString());
  cy.get('[data-testid="spec-width-input"]').clear().type(droneData.specifications.dimensions.width.toString());
  cy.get('[data-testid="spec-height-input"]').clear().type(droneData.specifications.dimensions.height.toString());
});

Cypress.Commands.add('fillPaymentForm', (paymentData = {}) => {
  const defaultPaymentData = {
    cardNumber: '4242424242424242',
    expiryMonth: '12',
    expiryYear: '2028',
    cvc: '123',
    cardholderName: 'Test User',
    ...paymentData
  };

  cy.get('[data-testid="card-number-input"]').clear().type(defaultPaymentData.cardNumber);
  cy.get('[data-testid="expiry-month-input"]').clear().type(defaultPaymentData.expiryMonth);
  cy.get('[data-testid="expiry-year-input"]').clear().type(defaultPaymentData.expiryYear);
  cy.get('[data-testid="cvc-input"]').clear().type(defaultPaymentData.cvc);
  cy.get('[data-testid="cardholder-name-input"]').clear().type(defaultPaymentData.cardholderName);
});

// Wait for API calls
Cypress.Commands.add('waitForApi', (alias, timeout = 10000) => {
  cy.wait(alias, { timeout });
});

// Custom assertions
Cypress.Commands.add('shouldBeVisible', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).should('be.visible');
});

Cypress.Commands.add('shouldContainText', { prevSubject: 'element' }, (subject, text) => {
  cy.wrap(subject).should('contain.text', text);
});

// Database cleanup commands
Cypress.Commands.add('cleanupTestData', () => {
  // This would typically connect to test database and clean up
  // For now, we'll use API calls to clean up
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/test/cleanup`,
    failOnStatusCode: false
  });
});