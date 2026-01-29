import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:4000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Plants API
export const plantsApi = {
  getAll: () => api.get('/plants'),
  getDead: () => api.get('/plants/dead'),
  getOne: (id: number) => api.get(`/plants/${id}`),
  create: (data: { name: string; speciesId: number }) => api.post('/plants', data),
  update: (id: number, data: { name?: string; currentWater?: number }) => api.put(`/plants/${id}`, data),
  delete: (id: number) => api.delete(`/plants/${id}`),
  search: (pattern: string) => api.get(`/plants/search/${pattern}`),
};

// Species API
export const speciesApi = {
  getAll: () => api.get('/species'),
  getOne: (id: number) => api.get(`/species/${id}`),
  create: (data: { name: string; dryingRate: number }) => api.post('/species', data),
  update: (id: number, data: { name?: string; dryingRate?: number }) => api.put(`/species/${id}`, data),
  delete: (id: number) => api.delete(`/species/${id}`),
  search: (pattern: string) => api.get(`/species/search/${pattern}`),
};

// Logs API
export const logsApi = {
  getAll: (search?: string) => api.get('/logs', { params: { search } }),
  getByPlant: (plantId: number) => api.get(`/logs/plant/${plantId}`),
};

export default api;