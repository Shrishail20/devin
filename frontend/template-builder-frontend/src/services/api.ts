import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const templatesAPI = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/templates', { params }),
  getById: (id: string) => api.get(`/templates/${id}`),
  create: (data: Record<string, unknown>) => api.post('/templates', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/templates/${id}`, data),
  delete: (id: string) => api.delete(`/templates/${id}`),
  duplicate: (id: string) => api.post(`/templates/${id}/duplicate`),
  publish: (id: string) => api.post(`/templates/${id}/publish`),
  preview: (id: string, data: Record<string, unknown>) =>
    api.post(`/templates/${id}/preview`, { data }),
  createInstance: (id: string, data: Record<string, unknown>) =>
    api.post(`/templates/${id}/instances`, { data }),
};

export const instancesAPI = {
  getById: (id: string) => api.get(`/instances/${id}`),
  export: (id: string, format: string) =>
    api.get(`/instances/${id}/export`, { params: { format }, responseType: 'blob' }),
};

export const mediaAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/media', { params }),
  getById: (id: string) => api.get(`/media/${id}`),
  upload: (file: File, tags?: string[]) => {
    const formData = new FormData();
    formData.append('file', file);
    if (tags) {
      formData.append('tags', tags.join(','));
    }
    return api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => api.delete(`/media/${id}`),
};

export const componentsAPI = {
  getAll: (category?: string) =>
    api.get('/components', { params: category ? { category } : {} }),
  getCategories: () => api.get('/components/categories'),
};

export default api;
