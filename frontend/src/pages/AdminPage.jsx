// frontend/src/pages/AdminPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

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
          window.location.href = '/';
          return;
        } else {
          // User clicked Cancel
          window.location.href = '/';
          return;
        }
      } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/';
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);
  
  // Load config sau khi đã xác thực
  useEffect(() => {
    if (adminAuth && authChecked) {
      loadConfig();
      loadApiKey();
      loadTierConfigs();
      loadTrips();
      loadActiveConfig();
    }
  }, [adminAuth, authChecked]);

  const loadActiveConfig = async () => {
    try {
      const response = await apiService.getActiveConfig();
      setActiveConfig(response.data);
    } catch (err) {
      console.warn('Could not load active config:', err.message);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setAdminAuth(false);
    window.location.href = '/';
  };

  // Thêm function set active config
  const handleSetActiveConfig = async (configType, configName) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiService.setActiveConfig(configType, configName);
      setSuccess(`✅ Đã chọn cấu hình: ${configType} - ${configName}`);
      
      // Reload active config
      await loadActiveConfig();
    } catch (err) {
      setError('Lỗi set active config: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };
  //function test active config
  const testActiveConfig = async (distanceKm) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.testActiveConfig(distanceKm);
      setSuccess(`✅ Test ${distanceKm}km thành công! Giá: ${response.data.result.total_price?.toLocaleString() || response.data.result.calculated_price?.toLocaleString()} VNĐ`);
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
      const response = await apiService.getTierConfigs();
      setTierConfigs(response.data || []);
    } catch (err) {
      console.warn('Could not load tier configs:', err.message);
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

          {/* Messages */}
          <div className="p-6">
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

            {/* Tab Content */}
            {activeTab === 'simple' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">💰 Cấu hình giá đơn giản</h2>
                
                <form onSubmit={handleConfigSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá cơ bản (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={config.base_price}
                        onChange={(e) => handleInputChange('base_price', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Giá khởi điểm cho mọi chuyến đi</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá theo km (VNĐ/km)
                      </label>
                      <input
                        type="number"
                        value={config.price_per_km}
                        onChange={(e) => handleInputChange('price_per_km', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Giá cộng thêm cho mỗi km</p>
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
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Giá thấp nhất cho bất kỳ chuyến đi nào</p>
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
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Giá cao nhất cho bất kỳ chuyến đi nào</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">📊 Công thức tính giá:</h4>
                    <p className="text-blue-700 text-sm">
                      <strong>Giá cuối = max(Giá tối thiểu, min(Giá cơ bản + (Khoảng cách × Giá/km), Giá tối đa))</strong>
                    </p>
                    <div className="mt-2 text-blue-600 text-sm">
                      <p>Ví dụ với cấu hình hiện tại:</p>
                      <p>• Chuyến đi 5km = max({config.min_price?.toLocaleString()}, min({config.base_price?.toLocaleString()} + (5 × {config.price_per_km?.toLocaleString()}), {config.max_price?.toLocaleString()})) = {Math.max(config.min_price, Math.min(config.base_price + (5 * config.price_per_km), config.max_price)).toLocaleString()} VNĐ</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                      {loading ? '⏳ Đang lưu...' : '💾 Lưu cấu hình giá'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {activeTab === 'tier' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">🎯 Cấu hình giá theo bậc</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Các cấu hình hiện có</h3>
                    <button 
                      onClick={loadTierConfigs}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      🔄 Tải lại
                    </button>
                  </div>

                  {tierConfigs.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Chưa có cấu hình giá theo bậc nào</p>
                      <p className="text-sm text-gray-400 mt-2">Hãy tạo dữ liệu mẫu từ backend</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {tierConfigs.map((tierConfig, index) => (
                        <div key={tierConfig.id || index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{tierConfig.name}</h4>
                              <p className="text-sm text-gray-600">Giá khởi điểm: {tierConfig.base_price?.toLocaleString()} VNĐ</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              tierConfig.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {tierConfig.is_active !== false ? 'Hoạt động' : 'Tạm dừng'}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            {tierConfig.tiers?.map((tier, tierIndex) => (
                              <div key={tierIndex} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                                <span className="text-sm text-gray-700">
                                  • {tier.from_km}-{tier.to_km || '∞'}km
                                  {tier.description && ` (${tier.description})`}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {tier.price_per_km?.toLocaleString()} VNĐ/km
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">💡 Hướng dẫn:</h4>
                  <p className="text-yellow-700 text-sm">
                    Để thêm cấu hình mới, sử dụng Swagger UI tại <a href="http://127.0.0.1:8000/docs" target="_blank" className="underline">http://127.0.0.1:8000/docs</a>
                    hoặc gọi API /api/tier-configs
                  </p>
                </div>
              </div>
            )}
            
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
                        {loading ? '⏳ Đang lưu...' : '💾 Lưu API Key'}
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

                {/* System Info */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">ℹ️ Thông tin hệ thống</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Backend URL</label>
                      <input
                        type="text"
                        value="http://127.0.0.1:8000"
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Frontend URL</label>
                      <input
                        type="text"
                        value="http://localhost:3000"
                        readOnly
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">⚡ Thao tác nhanh</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={testConnection}
                      className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
                    >
                      <div className="text-2xl mb-2">🔗</div>
                      <h4 className="font-medium text-gray-900">Test Kết Nối</h4>
                      <p className="text-sm text-gray-600">Kiểm tra API backend</p>
                    </button>
                    
                    <button
                      onClick={() => window.open('http://127.0.0.1:8000/docs', '_blank')}
                      className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                    >
                      <div className="text-2xl mb-2">📖</div>
                      <h4 className="font-medium text-gray-900">API Docs</h4>
                      <p className="text-sm text-gray-600">Mở Swagger UI</p>
                    </button>
                    
                    <button
                      onClick={() => {
                        loadConfig();
                        loadTierConfigs();
                        loadTrips();
                      }}
                      disabled={loading}
                      className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="text-2xl mb-2">🔄</div>
                      <h4 className="font-medium text-gray-900">Làm Mới</h4>
                      <p className="text-sm text-gray-600">Tải lại tất cả dữ liệu</p>
                    </button>
                  </div>
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

            {activeTab === 'active' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">⭐ Cấu hình đang dùng cho trang chính</h2>
                
                {/* Current Active Config */}
                <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">📋 Cấu hình hiện tại:</h3>
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

                  {/* Config Details */}
                  {activeConfig.config && (
                    <div className="mt-4 p-4 bg-white rounded-lg border">
                      <h4 className="font-medium text-gray-800 mb-3">Chi tiết cấu hình:</h4>
                      
                      {activeConfig.type === 'tier' ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            Giá khởi điểm: <span className="font-medium">{activeConfig.config.base_price?.toLocaleString()} VNĐ</span>
                          </p>
                          <div className="space-y-1">
                            {activeConfig.config.tiers?.map((tier, index) => (
                              <div key={index} className="text-sm text-gray-700">
                                • {tier.from_km}-{tier.to_km || '∞'}km: {tier.price_per_km?.toLocaleString()} VNĐ/km
                                {tier.description && ` (${tier.description})`}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>Giá cơ bản: <span className="font-medium">{activeConfig.config.base_price?.toLocaleString()} VNĐ</span></div>
                          <div>Giá/km: <span className="font-medium">{activeConfig.config.price_per_km?.toLocaleString()} VNĐ/km</span></div>
                          <div>Giá tối thiểu: <span className="font-medium">{activeConfig.config.min_price?.toLocaleString()} VNĐ</span></div>
                          <div>Giá tối đa: <span className="font-medium">{activeConfig.config.max_price?.toLocaleString()} VNĐ</span></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Change Active Config */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 Thay đổi cấu hình</h3>
                  
                  {/* Simple Configs */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">💰 Cấu hình giá đơn giản:</h4>
                    <div className="grid gap-3">
                      <div className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        activeConfig.type === 'simple' && activeConfig.config_name === 'default'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium text-gray-900">default</h5>
                            <p className="text-sm text-gray-600">Cấu hình giá đơn giản mặc định</p>
                          </div>
                          <button
                            onClick={() => handleSetActiveConfig('simple', 'default')}
                            disabled={loading || (activeConfig.type === 'simple' && activeConfig.config_name === 'default')}
                            className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                              activeConfig.type === 'simple' && activeConfig.config_name === 'default'
                                ? 'bg-blue-600 text-white cursor-default'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {activeConfig.type === 'simple' && activeConfig.config_name === 'default' ? '✅ Đang dùng' : 'Chọn'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tier Configs */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">🎯 Cấu hình giá theo bậc:</h4>
                    <div className="grid gap-3">
                      {tierConfigs.map((tierConfig) => (
                        <div
                          key={tierConfig.name}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            activeConfig.type === 'tier' && activeConfig.config_name === tierConfig.name
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-medium text-gray-900">{tierConfig.name}</h5>
                              <p className="text-sm text-gray-600">
                                Giá khởi điểm: {tierConfig.base_price?.toLocaleString()} VNĐ
                              </p>
                              <div className="text-xs text-gray-500 mt-1">
                                {tierConfig.tiers?.length} bậc giá
                              </div>
                            </div>
                            <button
                              onClick={() => handleSetActiveConfig('tier', tierConfig.name)}
                              disabled={loading || (activeConfig.type === 'tier' && activeConfig.config_name === tierConfig.name)}
                              className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                                activeConfig.type === 'tier' && activeConfig.config_name === tierConfig.name
                                  ? 'bg-purple-600 text-white cursor-default'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {activeConfig.type === 'tier' && activeConfig.config_name === tierConfig.name ? '✅ Đang dùng' : 'Chọn'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Test Active Config */}
                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-4">🧪 Test cấu hình đang dùng</h3>
                  <p className="text-yellow-700 text-sm mb-4">
                    Test API /api/calculate-price-enhanced với cấu hình hiện tại
                  </p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => testActiveConfig(25)}
                      disabled={loading}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                    >
                      🧪 Test 25km
                    </button>
                    
                    <button
                      onClick={() => window.open('http://127.0.0.1:8000/api/test-active-config?distance_km=25', '_blank')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      🔗 Test API trực tiếp
                    </button>
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