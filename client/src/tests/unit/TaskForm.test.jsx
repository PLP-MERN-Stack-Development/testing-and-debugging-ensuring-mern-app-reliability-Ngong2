import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskForm from '../../components/TaskForm';
import { taskAPI } from '../../services/api';

vi.mock('../../services/api');

describe('TaskForm Component', () => {
  const mockOnTaskCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task form', () => {
    render();

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const mockTask = {
      _id: '1',
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high'
    };

    taskAPI.createTask.mockResolvedValue({ data: { data: mockTask } });

    render();

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Task' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test Description' }
    });
    fireEvent.change(screen.getByLabelText(/priority/i), {
      target: { value: 'high' }
    });

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(taskAPI.createTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        status: 'pending'
      });
      expect(mockOnTaskCreated).toHaveBeenCalledWith(mockTask);
    });
  });

  it('clears form after successful submission', async () => {
    taskAPI.createTask.mockResolvedValue({
      data: { data: { _id: '1', title: 'Test' } }
    });

    render();

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(titleInput.value).toBe('');
    });
  });

  it('displays error message on submission failure', async () => {
    taskAPI.createTask.mockRejectedValue({
      response: { data: { message: 'Failed to create task' } }
    });

    render();

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: 'Test Task' }
    });
    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to create task');
    });
  });
});