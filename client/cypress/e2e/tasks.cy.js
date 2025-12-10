describe('Task Management', () => {
  let authToken;

  beforeEach(() => {
    cy.cleanDatabase();
    
    // Register and login
    cy.register('John Doe', 'john@example.com', 'password123');
    cy.getToken().then((token) => {
      authToken = token;
    });
  });

  describe('Task Creation', () => {
    it('should create a new task', () => {
      cy.visit('/tasks');
      
      cy.get('input[name="title"]').type('My First Task');
      cy.get('textarea[name="description"]').type('This is a test task');
      cy.get('select[name="priority"]').select('high');
      cy.get('button[type="submit"]').contains('Create').click();
      
      cy.contains('My First Task').should('be.visible');
      cy.contains('This is a test task').should('be.visible');
    });

    it('should show validation error for empty title', () => {
      cy.visit('/tasks');
      
      cy.get('textarea[name="description"]').type('Description without title');
      cy.get('button[type="submit"]').contains('Create').click();
      
      cy.get('input[name="title"]:invalid').should('exist');
    });

    it('should create task with different priorities', () => {
      cy.visit('/tasks');
      
      const priorities = ['low', 'medium', 'high'];
      
      priorities.forEach((priority, index) => {
        cy.get('input[name="title"]').type(`Task ${index + 1}`);
        cy.get('select[name="priority"]').select(priority);
        cy.get('button[type="submit"]').contains('Create').click();
        
        cy.contains(`Task ${index + 1}`).should('be.visible');
      });
      
      cy.get('.task-list li').should('have.length', 3);
    });
  });

  describe('Task List', () => {
    beforeEach(() => {
      // Create some tasks via API
      const tasks = [
        { title: 'Task 1', status: 'pending', priority: 'high' },
        { title: 'Task 2', status: 'in-progress', priority: 'medium' },
        { title: 'Task 3', status: 'completed', priority: 'low' }
      ];

      tasks.forEach(task => {
        cy.createTask(authToken, task);
      });
    });

    it('should display all tasks', () => {
      cy.visit('/tasks');
      
      cy.get('.task-list li').should('have.length', 3);
      cy.contains('Task 1').should('be.visible');
      cy.contains('Task 2').should('be.visible');
      cy.contains('Task 3').should('be.visible');
    });

    it('should filter tasks by status', () => {
      cy.visit('/tasks');
      
      cy.get('select').first().select('completed');
      
      cy.get('.task-list li').should('have.length', 1);
      cy.contains('Task 3').should('be.visible');
      cy.contains('Task 1').should('not.exist');
    });

    it('should filter tasks by priority', () => {
      cy.visit('/tasks');
      
      cy.get('select').eq(1).select('high');
      
      cy.get('.task-list li').should('have.length', 1);
      cy.contains('Task 1').should('be.visible');
    });

    it('should show empty state when no tasks match filter', () => {
      cy.visit('/tasks');
      
      // Delete all tasks first
      cy.get('.task-actions button').contains('Delete').click({ multiple: true });
      
      cy.contains('No tasks found').should('be.visible');
    });
  });

  describe('Task Operations', () => {
    let taskId;

    beforeEach(() => {
      cy.createTask(authToken, {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium'
      }).then((response) => {
        taskId = response.body.data._id;
      });
    });

    it('should mark task as completed', () => {
      cy.visit('/tasks');
      
      cy.get(`[data-testid="task-${taskId}"]`).within(() => {
        cy.contains('pending').should('exist');
        cy.get('button').contains('Complete').click();
      });
      
      cy.get(`[data-testid="task-${taskId}"]`).within(() => {
        cy.contains('completed').should('exist');
      });
    });

    it('should delete a task', () => {
      cy.visit('/tasks');
      
      cy.get(`[data-testid="task-${taskId}"]`).should('exist');
      
      cy.on('window:confirm', () => true);
      
      cy.get(`[data-testid="task-${taskId}"]`).within(() => {
        cy.get('button').contains('Delete').click();
      });
      
      cy.get(`[data-testid="task-${taskId}"]`).should('not.exist');
    });

    it('should cancel task deletion', () => {
      cy.visit('/tasks');
      
      cy.on('window:confirm', () => false);
      
      cy.get(`[data-testid="task-${taskId}"]`).within(() => {
        cy.get('button').contains('Delete').click();
      });
      
      cy.get(`[data-testid="task-${taskId}"]`).should('exist');
    });
  });

  describe('Task Workflow', () => {
    it('should complete full task lifecycle', () => {
      cy.visit('/tasks');
      
      // Create task
      cy.get('input[name="title"]').type('Complete Task Lifecycle');
      cy.get('textarea[name="description"]').type('From creation to completion');
      cy.get('select[name="priority"]').select('high');
      cy.get('button[type="submit"]').contains('Create').click();
      
      cy.contains('Complete Task Lifecycle').should('be.visible');
      
      // Find the task
      cy.contains('Complete Task Lifecycle')
        .parents('li')
        .within(() => {
          // Verify it starts as pending
          cy.contains('pending').should('exist');
          cy.contains('high').should('exist');
          
          // Mark as complete
          cy.get('button').contains('Complete').click();
          cy.contains('completed').should('exist');
          
          // Delete
          cy.on('window:confirm', () => true);
          cy.get('button').contains('Delete').click();
        });
      
      cy.contains('Complete Task Lifecycle').should('not.exist');
    });
  });
});