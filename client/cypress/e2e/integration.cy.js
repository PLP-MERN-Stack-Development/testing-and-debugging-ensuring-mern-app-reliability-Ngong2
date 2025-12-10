describe('Full Application Integration', () => {
  beforeEach(() => {
    cy.cleanDatabase();
  });

  it('should complete user journey from registration to task management', () => {
    // Step 1: Register
    cy.visit('/');
    cy.contains('Register').click();
    
    cy.get('input[name="name"]').type('Integration User');
    cy.get('input[name="email"]').type('integration@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/tasks');
    
    // Step 2: Create multiple tasks
    const tasks = [
      { title: 'Buy groceries', description: 'Milk, eggs, bread', priority: 'high' },
      { title: 'Call dentist', description: 'Schedule appointment', priority: 'medium' },
      { title: 'Read book', description: 'Finish chapter 5', priority: 'low' }
    ];
    
    tasks.forEach(task => {
      cy.get('input[name="title"]').type(task.title);
      cy.get('textarea[name="description"]').type(task.description);
      cy.get('select[name="priority"]').select(task.priority);
      cy.get('button[type="submit"]').contains('Create').click();
      cy.contains(task.title).should('be.visible');
    });
    
    // Step 3: Verify all tasks are displayed
    cy.get('.task-list li').should('have.length', 3);
    
    // Step 4: Filter by priority
    cy.get('select').eq(1).select('high');
    cy.get('.task-list li').should('have.length', 1);
    cy.contains('Buy groceries').should('be.visible');
    
    // Step 5: Reset filter
    cy.get('select').eq(1).select('');
    cy.get('.task-list li').should('have.length', 3);
    
    // Step 6: Complete a task
    cy.contains('Call dentist')
      .parents('li')
      .within(() => {
        cy.get('button').contains('Complete').click();
        cy.contains('completed').should('exist');
      });
    
    // Step 7: Filter by status
    cy.get('select').first().select('completed');
    cy.get('.task-list li').should('have.length', 1);
    cy.contains('Call dentist').should('be.visible');
    
    // Step 8: Reset and delete a task
    cy.get('select').first().select('');
    
    cy.on('window:confirm', () => true);
    cy.contains('Read book')
      .parents('li')
      .within(() => {
        cy.get('button').contains('Delete').click();
      });
    
    cy.contains('Read book').should('not.exist');
    cy.get('.task-list li').should('have.length', 2);
    
    // Step 9: Logout and verify protection
    cy.clearLocalStorage();
    cy.visit('/tasks');
    cy.url().should('include', '/login');
  });

  it('should handle network errors gracefully', () => {
    // Intercept and fail API calls
    cy.intercept('POST', '**/api/auth/login', { statusCode: 500 }).as('loginFail');
    
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@loginFail');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('should maintain state across page refreshes', () => {
    // Register and create a task
    cy.register('State Test', 'state@example.com', 'password123');
    
    cy.get('input[name="title"]').type('Persistent Task');
    cy.get('button[type="submit"]').contains('Create').click();
    
    // Refresh page
    cy.reload();
    
    // Verify task still exists
    cy.contains('Persistent Task').should('be.visible');
    
    // Verify user is still logged in
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.exist;
    });
  });
});
