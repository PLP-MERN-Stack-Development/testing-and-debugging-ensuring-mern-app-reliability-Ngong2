import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

function setAuthHeader() {
  const token = localStorage.getItem('token');
  if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete api.defaults.headers.common['Authorization'];
}

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  // optionally expose a method to refresh token or logout in future
};

export const taskAPI = {
  createTask: (data) => {
    setAuthHeader();
    return api.post('/tasks', data);
  },
  getTasks: (params) => {
    setAuthHeader();
    return api.get('/tasks', { params });
  },
  updateTask: (id, data) => {
    setAuthHeader();
    return api.put(`/tasks/${id}`, data);
  },
  deleteTask: (id) => {
    setAuthHeader();
    return api.delete(`/tasks/${id}`);
  }
};

export default api;
