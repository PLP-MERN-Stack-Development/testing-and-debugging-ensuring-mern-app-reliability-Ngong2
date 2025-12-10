Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/tasks');
});

// Custom command for register
Cypress.Commands.add('register', (name, email, password) => {
  cy.visit('/register');
  cy.get('input[name="name"]').type(name);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

// Custom command to create task via API
Cypress.Commands.add('createTask', (token, taskData) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/tasks`,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: taskData
  });
});

// Custom command to get token
Cypress.Commands.add('getToken', () => {
  return cy.window().then((win) => {
    return win.localStorage.getItem('token');
  });
});

// Custom command to set token
Cypress.Commands.add('setToken', (token) => {
  cy.window().then((win) => {
    win.localStorage.setItem('token', token);
  });
});

// Custom command to clean database (requires API endpoint)
Cypress.Commands.add('cleanDatabase', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/test/clean`,
    failOnStatusCode: false
  });
});