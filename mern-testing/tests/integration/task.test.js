import request from 'supertest';
import app from '../../src/server.js';
import { connectDB, closeDB, clearDB } from '../../src/config/database.js';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

afterEach(async () => {
  await clearDB();
});

describe('Task API Integration Tests', () => {
  let token;
  let userId;

  // Register a user before each test
  beforeEach(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
    token = response.body.data.token;
    userId = response.body.data.user._id;
  });

  // ===== POST /api/tasks =====
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.description).toBe(taskData.description);
      expect(response.body.data.priority).toBe(taskData.priority);
      expect(response.body.data.status).toBe('pending');
    });

    it('should not create task without authentication', async () => {
      const taskData = { title: 'Test Task' };
      await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);
    });

    it('should not create task without title', async () => {
      const taskData = { description: 'This is a test task' };
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  // ===== GET /api/tasks =====
  describe('GET /api/tasks', () => {
    beforeEach(async () => {
      const tasks = [
        { title: 'Task 1', status: 'pending', priority: 'high' },
        { title: 'Task 2', status: 'completed', priority: 'low' },
        { title: 'Task 3', status: 'in-progress', priority: 'medium' }
      ];
      for (const task of tasks) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${token}`)
          .send(task);
      }
    });

    it('should get all tasks for the authenticated user', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .query({ status: 'completed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Task 2');
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .query({ priority: 'high' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].title).toBe('Task 1');
    });
  });

  // ===== GET /api/tasks/:id =====
  describe('GET /api/tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const taskData = {
        title: 'Single Task',
        description: 'This is a single task'
      };
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(taskData);
      taskId = response.body.data._id;
    });

    it('should get task by ID for the authenticated user', async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Single Task');
    });

    it('should return 404 for non-existent task', async () => {
      const nonExistentId = '612e3c4f1c4ae5b1c8f0a999';
      await request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });
});
