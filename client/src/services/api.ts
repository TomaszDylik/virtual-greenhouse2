import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  register: (username: string, password: string) =>
    api.post('/auth/register', { username, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const plantsApi = {
  getAll: (search?: string) => api.get('/plants', { params: { search } }),
  getOne: (id: number) => api.get(`/plants/${id}`),
  create: (data: { name: string; speciesId: number }) => api.post('/plants', data),
  update: (id: number, data: any) => api.put(`/plants/${id}`, data),
  delete: (id: number) => api.delete(`/plants/${id}`),
  water: (id: number) => api.post(`/plants/${id}/water`),
};

export const speciesApi = {
  getAll: (search?: string) => api.get('/species', { params: { search } }),
  create: (data: { name: string; dryingRate: number }) => api.post('/species', data),
  delete: (id: number) => api.delete(`/species/${id}`),
};

export const logsApi = {
  getAll: (search?: string) => api.get('/logs', { params: { search } }),
};

export default api;