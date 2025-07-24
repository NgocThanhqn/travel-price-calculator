import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const apiService = {
  // Test connection
  healthCheck: () => api.get('/health'),
  
  // Price calculation
  calculatePrice: (data) => api.post('/api/calculate-price', data),
  testDistance: () => api.get('/api/test-distance'),
  
  // Price config management
  getPriceConfigs: () => api.get('/api/price-configs'),
  getPriceConfig: (configName) => api.get(`/api/price-configs/${configName}`),
  createPriceConfig: (data) => api.post('/api/price-configs', data),
  updatePriceConfig: (configName, data) => api.put(`/api/price-configs/${configName}`, data),
  
  // Trip history
  getTrips: (skip = 0, limit = 100) => api.get(`/api/trips?skip=${skip}&limit=${limit}`),

  // Settings management
  getSetting: (key) => api.get(`/api/settings/${key}`),
  updateSetting: (key, value, description = '') => api.post('/api/settings', null, {
    params: { key, value, description }
  }),
  getAllSettings: () => api.get('/api/settings'),
};

export default api;