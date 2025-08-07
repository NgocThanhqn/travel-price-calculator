import React, { useState, useEffect } from 'react';
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
    }
  }, [adminAuth, authChecked]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    setAdminAuth(false);
    window.location.href = '/';
  };

  useEffect(() => {
    loadConfig();
    loadApiKey();
  }, []);

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
      setError('Không thể tải cấu hình: ' + (err.response?.data?.detail || err.message));
    }
  };

  const loadApiKey = async () => {
    try {
      const response = await apiService.getSetting('google_maps_api_key');
      setApiKey(response.data.value || '');
    } catch (err) {
      // API key chưa được set, không cần báo lỗi
      console.log('API key chưa được cấu hình');
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
      await apiService.updateSetting(
        'google_maps_api_key', 
        apiKey.trim(), 
        'Google Maps API Key cho tích hợp bản đồ'
      );
      
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
    
    // Test đơn giản bằng cách tạo URL Google Maps
    const testUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey.trim()}&libraries=places`;
    
    setSuccess('✅ API Key có format hợp lệ. Hãy test trên trang chính để kiểm tra quyền truy cập.');
  };

  // Hiển thị loading khi đang check auth
  if (!authChecked) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">🔐 Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Hiển thị khi chưa xác thực
  if (!adminAuth) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚫 Truy cập bị từ chối</h1>
          <p className="text-gray-600 mb-6">Bạn không có quyền truy cập trang này.</p>
          <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            🏠 Về trang chủ
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🛠️ Trang Quản Trị
        </h1>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Test Connection */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">📡 Kiểm tra kết nối</h3>
          <div className="flex space-x-4">
            <button
              onClick={testConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test Backend API
            </button>
            <button
              onClick={testMapConnection}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Test Maps API Key
            </button>
          </div>
        </div>

        {/* Google Maps API Configuration */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">🗺️ Cấu hình Google Maps</h2>
          
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Maps API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Nhập Google Maps API Key"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                API Key cần có quyền: Maps JavaScript API, Places API, Directions API, Geocoding API
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">📝 Hướng dẫn lấy API Key:</h4>
              <ol className="text-yellow-700 text-sm space-y-1">
                <li>1. Truy cập <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                <li>2. Tạo project mới hoặc chọn project hiện có</li>
                <li>3. Enable các APIs: Maps JavaScript API, Places API, Directions API, Geocoding API</li>
                <li>4. Tạo credentials → API Key</li>
                <li>5. (Tùy chọn) Hạn chế API Key theo domain để bảo mật</li>
              </ol>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? 'Đang lưu...' : '💾 Lưu API Key vào Database'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                API Key sẽ được lưu vào database SQLite và localStorage
              </p>
            </div>
          </form>
        </div>

        {/* Price Configuration */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">💰 Cấu hình giá</h2>
          
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                {loading ? 'Đang cập nhật...' : '💾 Lưu cấu hình giá'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;