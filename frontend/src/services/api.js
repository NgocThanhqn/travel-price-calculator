// // frontend/src/services/api.js - UPDATED VERSION

// import axios from 'axios';

// const API_BASE_URL = 'http://127.0.0.1:8000';

// // Tạo axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // API functions
// export const apiService = {
//   // Test connection
//   healthCheck: () => api.get('/health'),
  
//   // Price calculation - ENHANCED VERSIONS
//   calculatePrice: (data) => api.post('/api/calculate-price', data), // Basic version
//   calculatePriceEnhanced: (data) => api.post('/api/calculate-price-enhanced', data), // With Google Maps
//   testDistance: () => api.get('/api/test-distance'),
  
//   // Google Maps specific
//   testGoogleMaps: () => api.get('/api/test-google-maps'),
//   getCalculationStatus: () => api.get('/api/calculation-status'),
//   debugGoogleMapsTest: () => api.get('/api/debug/detailed-google-maps-test'),
  
//   // Price config management
//   getPriceConfigs: () => api.get('/api/price-configs'),
//   getPriceConfig: (configName) => api.get(`/api/price-configs/${configName}`),
//   createPriceConfig: (data) => api.post('/api/price-configs', data),
//   updatePriceConfig: (configName, data) => api.put(`/api/price-configs/${configName}`, data),
  
//   // Trip history
//   getTrips: (skip = 0, limit = 100) => api.get('/api/trips?skip=${skip}&limit=${limit}'),

//   // Settings management
//   getSetting: (key) => api.get(`/api/settings/${key}`),
//   updateSetting: (key, value, description = '') => api.post('/api/settings', null, {
//     params: { key, value, description }
//   }),
//   getAllSettings: () => api.get('/api/settings'),

//   // Booking management
//   createBooking: (data) => api.post('/api/bookings', data),
//   getBookings: (skip = 0, limit = 100) => api.get(`/api/bookings?skip=${skip}&limit=${limit}`),
//   getVehicleTypes: () => api.get('/api/vehicle-types'),

//   // Tier pricing methods
//   getTierConfigs: () => axios.get('/tier-configs'),
//   getTierConfig: (name) => axios.get(`/tier-configs/${name}`),
//   createTierConfig: (config) => axios.post('/tier-configs', config),
//   calculateTierPrice: (configName, distanceKm) => 
//     axios.post('/calculate-tier-price', null, { 
//       params: { config_name: configName, distance_km: distanceKm } 
//     }),

    
// };

// // Lấy tất cả cấu hình giá theo bậc
// export const getTierConfigs = () => axios.get('/tier-configs');

// // Lấy cấu hình theo tên
// export const getTierConfig = (name) => axios.get(`/tier-configs/${name}`);

// // Tạo cấu hình mới
// export const createTierConfig = (config) => axios.post('/tier-configs', config);

// // Cập nhật cấu hình
// export const updateTierConfig = (name, config) => axios.put(`/tier-configs/${name}`, config);

// // Xóa cấu hình
// export const deleteTierConfig = (name) => axios.delete(`/tier-configs/${name}`);

// // Tính giá theo bậc (GET method - đơn giản)
// export const calculateTierPriceGet = (configName, distanceKm) => 
//   axios.get(`/tier-configs/${configName}/calculate`, { 
//     params: { distance_km: distanceKm } 
//   });

// // Test API connection
// export const testTierAPI = () => axios.get('/tier-configs');

// // Update existing apiService object
// if (typeof apiService !== 'undefined') {
//   Object.assign(apiService, {
//     getTierConfigs,
//     getTierConfig,
//     createTierConfig,
//     updateTierConfig,
//     deleteTierConfig,
//     calculateTierPriceGet,
//     testTierAPI
//   });
// }

// export default api;

// frontend/src/services/api.js

import axios from 'axios';

// Lấy API URL từ environment hoặc dùng relative URL
//const API_BASE_URL = 'http://127.0.0.1:8000';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

console.log('🔧 Environment:', import.meta.env.VITE_ENVIRONMENT );
console.log('🌐 API Base URL:', API_BASE_URL || 'Same origin (relative)');

// Tạo axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('📤 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('📥 Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== BASIC APIs =====

// Test connection
export const healthCheck = () => api.get('/health');

// ===== SIMPLE PRICE CALCULATION =====

// Price calculation (simple)
export const calculatePrice = (data) => api.post('/api/calculate-price', data);
export const testDistance = () => api.get('/api/test-distance');

// Price config management (simple)
export const getPriceConfigs = () => api.get('/api/price-configs');
export const getPriceConfig = (configName) => api.get(`/api/price-configs/${configName}`);
export const createPriceConfig = (data) => api.post('/api/price-configs', data);
export const updatePriceConfig = (configName, data) => api.put(`/api/price-configs/${configName}`, data);

// ===== TIER PRICING APIs =====

// Lấy tất cả cấu hình giá theo bậc
export const getTierConfigs = () => api.get('/api/tier-configs');

// Lấy cấu hình theo tên
export const getTierConfig = (name) => api.get(`/api/tier-configs/${name}`);

// Tạo cấu hình mới
export const createTierConfig = (config) => api.post('/api/tier-configs', config);

// Cập nhật cấu hình
export const updateTierConfig = (name, config) => api.put(`/api/tier-configs/${name}`, config);

// Xóa cấu hình
export const deleteTierConfig = (name) => api.delete(`/api/tier-configs/${name}`);

// Tính giá theo bậc (POST method)
export const calculateTierPrice = (request) => api.post('/api/calculate-tier-price', request);

// Tính giá theo bậc (GET method - đơn giản hơn)
export const calculateTierPriceGet = (configName, distanceKm) => 
  api.get(`/api/tier-configs/${configName}/calculate`, { 
    params: { distance_km: distanceKm } 
  });

// ===== TRIP HISTORY =====

// Trip history
export const getTrips = (skip = 0, limit = 100) => api.get(`/api/trips`, { 
  params: { skip, limit } 
});

// ===== SETTINGS APIs =====

// Settings management
export const getSettings = () => api.get('/api/settings');
export const getSetting = (key) => api.get(`/api/settings/${key}`);
export const updateSetting = (key, value) => api.put(`/api/settings/${key}`, { value });

// ===== UTILITY FUNCTIONS =====

// Test API connection
export const testConnection = async () => {
  try {
    const response = await healthCheck();
    return { 
      success: true, 
      message: 'Kết nối API thành công', 
      data: response.data 
    };
  } catch (error) {
    return { 
      success: false, 
      message: 'Lỗi kết nối API: ' + (error.response?.data?.detail || error.message),
      error: error 
    };
  }
};

// Test tier pricing
export const testTierAPI = async () => {
  try {
    const response = await getTierConfigs();
    return {
      success: true,
      message: `Tìm thấy ${response.data.length} cấu hình tier pricing`,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Lỗi tier pricing API: ' + (error.response?.data?.detail || error.message),
      error: error
    };
  }
};

// Lấy cấu hình đang active
export const getActiveConfig = () => api.get('/api/active-config');
// Set cấu hình active
export const setActiveConfig = (configType, configName) => 
  api.post('/api/set-active-config', null, {
    params: { config_type: configType, config_name: configName }
  });
// Test active config
export const testActiveConfig = (distanceKm) => 
  api.get('/api/test-active-config', {
    params: { distance_km: distanceKm }
  });
// ===== MAIN API SERVICE OBJECT =====

export const apiService = {
  calculatePrice: (data) => api.post('/api/calculate-price', data), // Basic version
  calculatePriceEnhanced: (data) => api.post('/api/calculate-price-enhanced', data), // With Google Maps
  testDistance: () => api.get('/api/test-distance'),

  //   // Booking management
  createBooking: (data) => api.post('/api/bookings', data),
  getBookings: (skip = 0, limit = 100) => api.get(`/api/bookings?skip=${skip}&limit=${limit}`),
  getVehicleTypes: () => api.get('/api/vehicle-types'),

  // Active config management
  getActiveConfig,
  setActiveConfig,
  testActiveConfig,
  
  // Basic
  healthCheck,
  testConnection,
  
  // Simple pricing
  calculatePrice,
  testDistance,
  getPriceConfigs,
  getPriceConfig,
  createPriceConfig,
  updatePriceConfig,
  
  // Tier pricing
  getTierConfigs,
  getTierConfig,
  createTierConfig,
  updateTierConfig,
  deleteTierConfig,
  calculateTierPrice,
  calculateTierPriceGet,
  testTierAPI,
  
  // Trip history
  getTrips,
  
  // Settings
  getSettings,
  getSetting,
  updateSetting,
};

// Export default
export default apiService;