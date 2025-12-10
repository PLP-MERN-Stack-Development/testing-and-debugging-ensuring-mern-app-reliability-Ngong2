import './commands';

// Global hooks
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  return true;
});