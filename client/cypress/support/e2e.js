// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // on uncaught exceptions that we don't care about
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  return true;
});

// Set up global test data
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
  
  // Set up viewport
  cy.viewport(1280, 720);
  
  // Intercept API calls for better test control
  cy.intercept('GET', `${Cypress.env('apiUrl')}/health`, {
    statusCode: 200,
    body: { success: true, message: 'API is running' }
  }).as('healthCheck');
});