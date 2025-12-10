import mongoose from 'mongoose';
import Task from '../../src/models/Task.js';
import User from '../../src/models/User.js';
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

describe('Task Model Unit Tests', () => {
  let userId;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;
  });

  describe('Task Creation', () => {
    it('should create a task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        userId
      };

      const task = await Task.create(taskData);

      expect(task.title).toBe(taskData.title);
      expect(task.description).toBe(taskData.description);
      expect(task.status).toBe('pending');
      expect(task.priority).toBe('medium');
      expect(task.userId.toString()).toBe(userId.toString());
    });

    it('should fail to create task without title', async () => {
      const taskData = {
        description: 'This is a test task',
        userId
      };

      await expect(Task.create(taskData)).rejects.toThrow();
    });

    it('should fail to create task without userId', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task'
      };

      await expect(Task.create(taskData)).rejects.toThrow();
    });

    it('should create task with custom status and priority', async () => {
      const taskData = {
        title: 'Urgent Task',
        status: 'in-progress',
        priority: 'high',
        userId
      };

      const task = await Task.create(taskData);

      expect(task.status).toBe('in-progress');
      expect(task.priority).toBe('high');
    });
  });

  describe('Task Validation', () => {
    it('should only accept valid status values', async () => {
      const taskData = {
        title: 'Test Task',
        status: 'invalid-status',
        userId
      };

      await expect(Task.create(taskData)).rejects.toThrow();
    });

    it('should only accept valid priority values', async () => {
      const taskData = {
        title: 'Test Task',
        priority: 'invalid-priority',
        userId
      };

      await expect(Task.create(taskData)).rejects.toThrow();
    });
  });
});