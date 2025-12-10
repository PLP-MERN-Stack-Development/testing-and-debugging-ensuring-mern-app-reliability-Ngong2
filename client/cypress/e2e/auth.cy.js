describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clean database before each test
    cy.cleanDatabase();
  });

  describe('Registration', () => {
    it('should register a new user successfully', () => {
      cy.visit('/register');
      
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[name="password"]').type('password123');
      
      cy.get('button[type="submit"]').click();
      
      cy.url().should('include', '/tasks');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.exist;
      });
    });

    it('should show error for existing email', () => {
      // First registration
      cy.register('John Doe', 'john@example.com', 'password123');
      
      // Logout
      cy.clearLocalStorage();
      
      // Try to register again with same email
      cy.visit('/register');
      cy.get('input[name="name"]').type('Jane Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[name="password"]').type('password456');
      cy.get('button[type="submit"]').click();
      
      cy.get('[role="alert"]').should('contain', 'already exists');
    });

    it('should validate password length', () => {
      cy.visit('/register');
      
      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[name="password"]').type('123');
      cy.get('button[type="submit"]').click();
      
      // HTML5 validation should prevent submission
      cy.get('input[name="password"]:invalid').should('exist');
    });
  });

  describe('Login', () => {
    beforeEach(() => {
      // Create a user before login tests
      cy.register('John Doe', 'john@example.com', 'password123');
      cy.clearLocalStorage();
    });

    it('should login with valid credentials', () => {
      cy.login('john@example.com', 'password123');
      
      cy.url().should('include', '/tasks');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.exist;
      });
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      cy.get('[role="alert"]').should('contain', 'Invalid credentials');
      cy.url().should('include', '/login');
    });

    it('should show error for non-existent user', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type('nonexistent@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      cy.get('[role="alert"]').should('contain', 'Invalid credentials');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing tasks without auth', () => {
      cy.visit('/tasks');
      cy.url().should('include', '/login');
    });

    it('should access tasks after login', () => {
      cy.register('John Doe', 'john@example.com', 'password123');
      cy.url().should('include', '/tasks');
    });
  });
});