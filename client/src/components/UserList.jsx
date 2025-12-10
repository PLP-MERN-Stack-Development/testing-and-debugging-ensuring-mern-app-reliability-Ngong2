import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import UserList from './UserList';

// Mock axios
vi.mock('axios');

describe('UserList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    
    render(<UserList />);
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('should render users after successful fetch', async () => {
    const mockUsers = [
      { _id: '1', name: 'John Doe', email: 'john@example.com' },
      { _id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ];

    axios.get.mockResolvedValue({
      data: { success: true, data: mockUsers }
    });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
    });

    expect(screen.getAllByTestId('user-item')).toHaveLength(2);
  });

  it('should render error message on fetch failure', async () => {
    axios.get.mockRejectedValue(new Error('Network error'));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it('should display "No users found" when array is empty', async () => {
    axios.get.mockResolvedValue({
      data: { success: true, data: [] }
    });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByTestId('no-users')).toBeInTheDocument();
    });
  });

  it('should delete user when delete button is clicked', async () => {
    const mockUsers = [
      { _id: '1', name: 'John Doe', email: 'john@example.com' },
      { _id: '2', name: 'Jane Smith', email: 'jane@example.com' }
    ];

    axios.get.mockResolvedValue({
      data: { success: true, data: mockUsers }
    });
    axios.delete.mockResolvedValue({ data: { success: true } });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('delete-1');
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText(/John Doe/)).not.toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
    });

    expect(axios.delete).toHaveBeenCalledWith('http://localhost:5000/api/users/1');
  });

  it('should show error when delete fails', async () => {
    const mockUsers = [
      { _id: '1', name: 'John Doe', email: 'john@example.com' }
    ];

    axios.get.mockResolvedValue({
      data: { success: true, data: mockUsers }
    });
    axios.delete.mockRejectedValue(new Error('Delete failed'));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('delete-1');
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to delete user/)).toBeInTheDocument();
    });
  });
});