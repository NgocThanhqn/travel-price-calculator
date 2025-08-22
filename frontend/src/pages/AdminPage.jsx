// frontend/src/pages/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import TierPriceManager from '../components/TierPriceManager';

const AdminPage = () => {
  const [adminAuth, setAdminAuth] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [config, setConfig] = useState({
    base_price: 10000,
    price_per_km: 5000,
    min_price: 20000,
    max_price: 500000
  });

  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('simple');

  // States for tier pricing
  const [tierConfigs, setTierConfigs] = useState([]);
  const [trips, setTrips] = useState([]);
  const [activeConfig, setActiveConfig] = useState({
    type: 'simple',
    config_name: 'default',
    config: null
  });
  
  // Xác thực admin
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Kiểm tra nếu đã đăng nhập trước đó
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        if (isLoggedIn === 'true') {
          setAdminAuth(true);
          setAuthChecked(true);
          return;
        }

        // Yêu cầu nhập mật khẩu
        const password = prompt('🔐 Nhập mật khẩu admin:');
        if (password === 'tanu2025') {
          setAdminAuth(true);
          localStorage.setItem('adminLoggedIn', 'true');
        } else if (password !== null) { // null = user clicked Cancel
          alert('❌ Sai mật khẩu!');
        }
        setAuthChecked(true);
      } catch (err) {
        console.error('Auth error:', err);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  // Load data khi đã xác thực
  useEffect(() => {
    if (adminAuth) {
      loadConfig();
      loadApiKey();
      loadTierConfigs();
      loadTrips();
      loadActiveConfig();
    }
  }, [adminAuth]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setAdminAuth(false);
  };

  const loadActiveConfig = async () => {
    try {
      // FIX: Sử dụng getActiveConfig() thay vì get('/active-config') 
      const response = await apiService.getActiveConfig();
      setActiveConfig(response.data);
      console.log('Loaded active config:', response.data); // Debug log
    } catch (err) {
      console.warn('Could not load active config:', err.message);
      setActiveConfig({
        type: 'simple',
        config_name: 'default',
        config: null
      });
    }
  };

  const handleSetActiveConfig = async (type, configName) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // FIX: Sử dụng setActiveConfig() với đúng parameters
      await apiService.setActiveConfig(type, configName);

      setSuccess(`✅ Đã chuyển sang cấu hình ${type === 'tier' ? 'theo bậc' : 'đơn giản'}: ${configName}`);
      loadActiveConfig();
    } catch (err) {
      setError('Lỗi chuyển cấu hình: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const testActiveConfig = async (distance = 25) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Sử dụng enhanced API thay vì basic API
      const response = await apiService.calculatePriceEnhanced({
        from_lat: 10.762622,
        from_lng: 106.660172,
        to_lat: 10.732599,
        to_lng: 106.719749,
        from_address: 'Test điểm A - HCM',
        to_address: 'Test điểm B - HCM',
        distance_km: distance
      });

      const price = response.data.calculated_price || response.data.total_price;
      setSuccess(`✅ Test thành công: ${distance}km = ${price?.toLocaleString() || 'N/A'} VNĐ (${response.data.config_type}:${response.data.config_name})`);
      
    } catch (err) {
      setError('Lỗi test active config: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const response = await apiService.getPriceConfig('default');
      setConfig({
        base_price: response.data.base_price,
        price_per_km: response.data.price_per_km,
        min_price: response.data.min_price,
        max_price: response.data.max_price
      });
    } catch (err) {
      console.warn('Could not load simple config:', err.message);
    }
  };

  const loadApiKey = async () => {
    try {
      const response = await apiService.getSetting('google_maps_api_key');
      setApiKey(response.data.value || '');
    } catch (err) {
      console.log('API key chưa được cấu hình');
    }
  };

  const loadTierConfigs = async () => {
    try {
      // FIX: Sử dụng getTierConfigs() thay vì get('/tier-configs')
      const response = await apiService.getTierConfigs();
      setTierConfigs(response.data || []);
      console.log('Loaded tier configs:', response.data); // Debug log
    } catch (err) {
      console.warn('Could not load tier configs:', err.message);
      console.error('Full error:', err); // Debug log
      setTierConfigs([]);
    }
  };

  const loadTrips = async () => {
    try {
      const response = await apiService.getTrips(0, 10);
      setTrips(response.data || []);
    } catch (err) {
      console.warn('Could not load trips:', err.message);
      setTrips([]);
    }
  };

  const handleConfigSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updatePriceConfig('default', config);
      setSuccess('✅ Cập nhật cấu hình giá thành công!');
    } catch (err) {
      setError('Lỗi cập nhật: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setError('Vui lòng nhập API Key');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiService.updateSetting('google_maps_api_key', apiKey.trim());
      
      // Cũng lưu vào localStorage để sử dụng ngay lập tức
      localStorage.setItem('googleMapsApiKey', apiKey.trim());
      
      setSuccess('✅ Lưu Google Maps API Key thành công!');
    } catch (err) {
      setError('Lỗi lưu API Key: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const testConnection = async () => {
    setError('');
    setSuccess('');
    try {
      const response = await apiService.healthCheck();
      setSuccess('✅ Kết nối API thành công! ' + response.data.message);
    } catch (err) {
      setError('❌ Lỗi kết nối API: ' + err.message);
    }
  };

  const testMapConnection = () => {
    if (!apiKey.trim()) {
      setError('Vui lòng nhập và lưu API Key trước');
      return;
    }
    
    setSuccess('✅ API Key có format hợp lệ. Hãy test trên trang chính để kiểm tra quyền truy cập.');
  };

  // Hiển thị loading khi đang check auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">🔐 Đang xác thực quyền truy cập...</p>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị khi chưa xác thực
  if (!adminAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Truy cập bị từ chối</h1>
            <p className="text-gray-600 mb-6">Bạn không có quyền truy cập trang này.</p>
            <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block">
              🏠 Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🔧 Trang Quản Trị</h1>
              <p className="text-gray-600">Quản lý cấu hình hệ thống</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🏠 Về Trang Chủ
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🚪 Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6">
        <div className="bg-white shadow rounded-lg">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('simple')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'simple'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💰 Cấu hình giá đơn giản
              </button>
              <button
                onClick={() => setActiveTab('tier')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tier'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🎯 Cấu hình giá theo bậc
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⚙️ Cài đặt hệ thống
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                ⭐ Cấu hình đang dùng
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            {/* Simple Price Config Tab */}
            {activeTab === 'simple' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">💰 Cấu hình giá đơn giản</h2>
                
                <form onSubmit={handleConfigSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá cơ sở (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={config.base_price}
                        onChange={(e) => handleInputChange('base_price', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá mỗi km (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={config.price_per_km}
                        onChange={(e) => handleInputChange('price_per_km', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá tối thiểu (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={config.min_price}
                        onChange={(e) => handleInputChange('min_price', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá tối đa (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={config.max_price}
                        onChange={(e) => handleInputChange('max_price', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-lg"
                  >
                    {loading ? 'Đang cập nhật...' : '💾 Lưu cấu hình'}
                  </button>
                </form>

                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🧮 Công thức tính giá</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800 font-mono">
                      Giá cuối = MAX(Giá cơ sở + (Khoảng cách × Giá mỗi km), Giá tối thiểu)
                    </p>
                    <p className="text-blue-600 text-sm mt-2">
                      Ví dụ: {config.base_price?.toLocaleString()} + (25 × {config.price_per_km?.toLocaleString()}) = {(config.base_price + 25 * config.price_per_km)?.toLocaleString()} VNĐ
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">💡 Hướng dẫn:</h4>
                  <p className="text-yellow-700 text-sm">
                    Cấu hình này áp dụng công thức tính giá đơn giản cho tất cả các chuyến xe.
                    Để sử dụng cấu hình phức tạp hơn theo khoảng cách, hãy chuyển sang tab "Cấu hình giá theo bậc".
                  </p>
                </div>
              </div>
            )}

            {/* Tier Price Config Tab */}
            {activeTab === 'tier' && (
              <TierPriceManager />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">⚙️ Cài đặt hệ thống</h2>
                
                {/* Google Maps API Key */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🗺️ Google Maps API Key</h3>
                  
                  <form onSubmit={handleApiKeySubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Nhập Google Maps API Key..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Cần thiết để sử dụng tính năng chọn địa điểm trên bản đồ
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
                      >
                        {loading ? 'Đang lưu...' : '💾 Lưu API Key'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={testMapConnection}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                      >
                        🧪 Test API Key
                      </button>
                    </div>
                  </form>
                </div>

                {/* Connection Test */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">🔗 Kiểm tra kết nối</h3>
                  <button
                    onClick={testConnection}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                  >
                    🔍 Test kết nối Backend
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Kiểm tra kết nối với API backend và trạng thái dữ liệu
                  </p>
                </div>

                {/* Stats */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Thống kê</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">🎯</div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Tier Configs</p>
                          <p className="text-xl font-bold text-blue-600">{tierConfigs.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">🚗</div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Recent Trips</p>
                          <p className="text-xl font-bold text-green-600">{trips.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">🔑</div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">API Key</p>
                          <p className="text-xl font-bold text-purple-600">
                            {apiKey ? 'Đã cấu hình' : 'Chưa có'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Config Tab */}
            {activeTab === 'active' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">⭐ Cấu hình đang dùng cho trang chính</h2>
                
                {/* Current Active Config */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Cấu hình hiện tại:</h3>
                  
                  {activeConfig ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Loại cấu hình:</label>
                        <div className={`mt-1 px-3 py-2 rounded-md font-medium ${
                          activeConfig.type === 'tier' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {activeConfig.type === 'tier' ? '🎯 Theo bậc' : '💰 Đơn giản'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tên cấu hình:</label>
                        <div className="mt-1 px-3 py-2 bg-gray-100 rounded-md font-medium">
                          {activeConfig.config_name}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Trạng thái:</label>
                        <div className="mt-1 px-3 py-2 bg-green-100 text-green-800 rounded-md font-medium">
                          ✅ Đang hoạt động
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Đang tải thông tin cấu hình...</p>
                    </div>
                  )}

                  {/* Config Details */}
                  {activeConfig?.config && (
                    <div className="mt-4 p-4 bg-white rounded-lg border">
                      <h4 className="font-medium text-gray-800 mb-3">Chi tiết cấu hình:</h4>
                      
                      {activeConfig.type === 'tier' ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Giá cơ sở: <span className="font-medium">{activeConfig.config.base_price?.toLocaleString()} VNĐ</span>
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            Số bậc giá: <span className="font-medium">{activeConfig.config.tiers?.length || 0} bậc</span>
                          </p>
                          
                          {activeConfig.config.tiers && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {activeConfig.config.tiers.map((tier, idx) => (
                                <div key={idx} className="text-xs bg-gray-50 px-2 py-1 rounded border">
                                  {tier.description || `${tier.from_km}-${tier.to_km || '∞'}km: ${tier.price_per_km?.toLocaleString()} VNĐ/km`}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Giá cơ sở:</span>
                            <div className="font-medium">{activeConfig.config.base_price?.toLocaleString()} VNĐ</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Giá/km:</span>
                            <div className="font-medium">{activeConfig.config.price_per_km?.toLocaleString()} VNĐ</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Giá tối thiểu:</span>
                            <div className="font-medium">{activeConfig.config.min_price?.toLocaleString()} VNĐ</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Giá tối đa:</span>
                            <div className="font-medium">{activeConfig.config.max_price?.toLocaleString()} VNĐ</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Config Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6">🔧 Chọn cấu hình khác:</h3>
                  
                  {/* Simple Config */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">💰 Cấu hình giá đơn giản:</h4>
                    <div className="grid gap-3">
                      <div className={`p-4 border rounded-lg transition-all ${
                        activeConfig?.type === 'simple' && activeConfig?.config_name === 'default'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">default</h5>
                            <p className="text-sm text-gray-600">Cấu hình giá đơn giản mặc định</p>
                            {config && (
                              <div className="text-xs text-gray-500 mt-1">
                                Cơ sở: {config.base_price?.toLocaleString()} VNĐ | 
                                /km: {config.price_per_km?.toLocaleString()} VNĐ
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleSetActiveConfig('simple', 'default')}
                            disabled={loading || (activeConfig?.type === 'simple' && activeConfig?.config_name === 'default')}
                            className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                              activeConfig?.type === 'simple' && activeConfig?.config_name === 'default'
                                ? 'bg-blue-600 text-white cursor-default'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {activeConfig?.type === 'simple' && activeConfig?.config_name === 'default' ? '✅ Đang dùng' : 'Chọn'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tier Configs */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">🎯 Cấu hình giá theo bậc:</h4>
                    
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Đang tải danh sách cấu hình...</p>
                      </div>
                    ) : tierConfigs && tierConfigs.length > 0 ? (
                      <div className="grid gap-3">
                        {tierConfigs.map((tierConfig) => (
                          <div
                            key={tierConfig.id || tierConfig.name}
                            className={`p-4 border rounded-lg transition-all ${
                              activeConfig?.type === 'tier' && activeConfig?.config_name === tierConfig.name
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-medium text-gray-900">{tierConfig.name}</h5>
                                  {tierConfig.is_active && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                      Active in DB
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  Giá cơ sở: {tierConfig.base_price?.toLocaleString()} VNĐ | 
                                  Bậc giá: {tierConfig.tiers?.length || 0} bậc
                                </p>
                                
                                {/* Show first few tiers */}
                                {tierConfig.tiers && tierConfig.tiers.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {tierConfig.tiers.slice(0, 2).map((tier, idx) => (
                                      <span key={idx} className="mr-3">
                                        {tier.description || `${tier.from_km}-${tier.to_km || '∞'}km: ${tier.price_per_km?.toLocaleString()}`}
                                      </span>
                                    ))}
                                    {tierConfig.tiers.length > 2 && <span>...</span>}
                                  </div>
                                )}
                                
                                {tierConfig.created_at && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    Tạo: {new Date(tierConfig.created_at).toLocaleDateString('vi-VN')}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleSetActiveConfig('tier', tierConfig.name)}
                                  disabled={loading || (activeConfig?.type === 'tier' && activeConfig?.config_name === tierConfig.name)}
                                  className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                                    activeConfig?.type === 'tier' && activeConfig?.config_name === tierConfig.name
                                      ? 'bg-purple-600 text-white cursor-default'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {activeConfig?.type === 'tier' && activeConfig?.config_name === tierConfig.name ? '✅ Đang dùng' : 'Chọn'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-gray-200 rounded-lg">
                        <p className="text-gray-500">Chưa có cấu hình tier nào</p>
                        <p className="text-sm text-gray-400 mt-1">Tạo cấu hình mới ở tab "Cấu hình tier"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Test Active Config */}
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4">🧪 Test cấu hình đang dùng</h3>
                  <p className="text-yellow-700 text-sm mb-4">
                    Test API /api/test-active-config với cấu hình hiện tại ({activeConfig?.type || 'N/A'}: {activeConfig?.config_name || 'N/A'})
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => testActiveConfig(25)}
                      disabled={loading || !activeConfig}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                    >
                      🧪 Test 25km
                    </button>
                    
                    <button
                      onClick={() => testActiveConfig(50)}
                      disabled={loading || !activeConfig}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                    >
                      🧪 Test 50km
                    </button>
                    
                    <button
                      onClick={() => testActiveConfig(100)}
                      disabled={loading || !activeConfig}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                    >
                      🧪 Test 100km
                    </button>
                    
                    <button
                      onClick={() => window.open('/api/test-active-config?distance_km=25', '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      🔗 Test API trực tiếp
                    </button>
                  </div>
                  
                  {/* Test Results Display */}
                  {success && success.includes('Test') && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-700 text-sm">{success}</p>
                    </div>
                  )}
                </div>

                {/* Summary Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">🎯</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tier Configs</p>
                        <p className="text-xl font-bold text-purple-600">{tierConfigs?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">⭐</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Config</p>
                        <p className="text-lg font-bold text-blue-600">
                          {activeConfig ? `${activeConfig.type}: ${activeConfig.config_name}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">🚗</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Recent Trips</p>
                        <p className="text-xl font-bold text-green-600">{trips?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;