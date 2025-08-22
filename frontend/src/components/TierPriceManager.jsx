// frontend/src/components/TierPriceManager.jsx
import './TierPriceManager.css';
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const TierPriceManager = () => {
  const [configs, setConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State mới cho active config management
  const [activeConfig, setActiveConfig] = useState(null);

  // Form data cho cấu hình mới hoặc chỉnh sửa
  const [formData, setFormData] = useState({
    name: '',
    base_price: 10000,
    tiers: [
      { from_km: 0, to_km: 10, price_per_km: 15000, description: '0-10km: 15,000 VNĐ/km' },
      { from_km: 10, to_km: 50, price_per_km: 12000, description: '10-50km: 12,000 VNĐ/km' },
      { from_km: 50, to_km: null, price_per_km: 8000, description: 'Trên 50km: 8,000 VNĐ/km' }
    ]
  });

  useEffect(() => {
    loadConfigs();
    loadActiveConfig();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTierConfigs();
      setConfigs(response.data || []);
    } catch (err) {
      console.warn('Không thể tải cấu hình:', err.message);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveConfig = async () => {
    try {
      const response = await apiService.getActiveConfig();
      if (response.data && response.data.config_type === 'tier') {
        setActiveConfig(response.data.config_name);
      }
    } catch (err) {
      console.warn('Không thể tải active config:', err.message);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      if (!formData.name.trim()) {
        setError('Vui lòng nhập tên cấu hình');
        return;
      }

      if (formData.tiers.length === 0) {
        setError('Cấu hình phải có ít nhất 1 bậc giá');
        return;
      }

      if (selectedConfig) {
        // Cập nhật cấu hình hiện tại
        await apiService.updateTierConfig(selectedConfig.name, formData);
        setSuccess('Cập nhật cấu hình thành công!');
      } else {
        // Tạo cấu hình mới
        await apiService.createTierConfig(formData);
        setSuccess('Tạo cấu hình mới thành công!');
      }
      
      setIsEditing(false);
      setSelectedConfig(null);
      loadConfigs();
      resetForm();
      
    } catch (err) {
      setError('Lỗi lưu cấu hình: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfig = async (configName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa cấu hình "${configName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await apiService.deleteTierConfig(configName);
      setSuccess('Xóa cấu hình thành công!');
      loadConfigs();
      
      if (selectedConfig && selectedConfig.name === configName) {
        setSelectedConfig(null);
        setIsEditing(false);
        resetForm();
      }
      
    } catch (err) {
      setError('Lỗi xóa cấu hình: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditConfig = (config) => {
    setSelectedConfig(config);
    setFormData({
      name: config.name,
      base_price: config.base_price || 10000,
      tiers: config.tiers || []
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      base_price: 10000,
      tiers: [
        { from_km: 0, to_km: 10, price_per_km: 15000, description: '0-10km: 15,000 VNĐ/km' },
        { from_km: 10, to_km: 50, price_per_km: 12000, description: '10-50km: 12,000 VNĐ/km' },
        { from_km: 50, to_km: null, price_per_km: 8000, description: 'Trên 50km: 8,000 VNĐ/km' }
      ]
    });
  };

  // Function để set config làm active
  const handleSetActive = async (configName) => {
    try {
      setLoading(true);
      setError('');
      
      await apiService.setActiveConfig('tier', configName);
      setActiveConfig(configName);
      setSuccess(`Đã set "${configName}" làm cấu hình active`);
      
      // Reload configs để cập nhật trạng thái
      loadConfigs();
      
    } catch (err) {
      setError('Lỗi set active config: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const addTier = () => {
    const lastTier = formData.tiers[formData.tiers.length - 1];
    const newFromKm = lastTier ? (lastTier.to_km || 0) : 0;
    
    const newTier = {
      from_km: newFromKm,
      to_km: newFromKm + 10,
      price_per_km: 10000,
      description: `${newFromKm}-${newFromKm + 10}km: 10,000 VNĐ/km`
    };
    
    setFormData(prev => ({
      ...prev,
      tiers: [...prev.tiers, newTier]
    }));
  };

  const removeTier = (index) => {
    if (formData.tiers.length <= 1) {
      setError('Cấu hình phải có ít nhất 1 bậc giá');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index)
    }));
  };

  // Fixed updateTier function
  const updateTier = (index, field, value) => {
    try {
      setFormData(prev => ({
        ...prev,
        tiers: prev.tiers.map((tier, i) => {
          if (i === index) {
            // Handle numeric fields properly
            let processedValue = value;
            if (field === 'from_km' || field === 'to_km') {
              processedValue = value === '' || value === null ? 0 : Number(value);
            } else if (field === 'price_per_km') {
              processedValue = value === '' ? 0 : Number(value);
            }
            
            const updatedTier = { ...tier, [field]: processedValue };
            
            // Tự động cập nhật description
            if (field === 'from_km' || field === 'to_km' || field === 'price_per_km') {
              const fromKm = field === 'from_km' ? processedValue : tier.from_km;
              const toKm = field === 'to_km' ? processedValue : tier.to_km;
              const pricePerKm = field === 'price_per_km' ? processedValue : tier.price_per_km;
              
              updatedTier.description = toKm !== null && toKm !== undefined
                ? `${fromKm || 0}-${toKm}km: ${Number(pricePerKm || 0).toLocaleString()} VNĐ/km`
                : `Trên ${fromKm || 0}km: ${Number(pricePerKm || 0).toLocaleString()} VNĐ/km`;
            }
            
            return updatedTier;
          }
          return tier;
        })
      }));
    } catch (err) {
      console.error('Error updating tier:', err);
      setError('Lỗi cập nhật bậc giá: ' + err.message);
    }
  };

  // Enhanced test pricing function với multiple fallback methods
  const testPricing = async (configName, distance = 25) => {
    try {
      setError('');
      setSuccess('');
      
      console.log(`🧪 Testing config: ${configName} with distance: ${distance}km`);
      
      // Kiểm tra input
      if (!configName) {
        throw new Error('Tên cấu hình không được để trống');
      }
      
      if (!distance || distance <= 0) {
        throw new Error('Khoảng cách phải lớn hơn 0');
      }

      // Method 1: Dùng tier-specific GET endpoint
      try {
        const response = await apiService.calculateTierPriceGet(configName, distance);
        
        if (response.data && response.data.total_price) {
          setSuccess(`✅ Test thành công: ${distance}km = ${response.data.total_price.toLocaleString()} VNĐ`);
          return;
        }
      } catch (getError) {
        console.warn('Tier GET method failed:', getError.message);
      }

      // Method 2: Dùng tier-specific POST endpoint  
      try {
        const postResponse = await apiService.calculateTierPrice({
          config_name: configName,
          distance_km: distance,
          from_address: 'Test điểm A',
          to_address: 'Test điểm B'
        });
        
        if (postResponse.data && postResponse.data.total_price) {
          setSuccess(`✅ Test thành công: ${distance}km = ${postResponse.data.total_price.toLocaleString()} VNĐ`);
          return;
        }
      } catch (postError) {
        console.warn('Tier POST method failed:', postError.message);
      }

      // Method 3: Dùng general calculate-price API với đúng format
      try {
        const generalResponse = await apiService.calculatePrice({
          // Fixed: Thêm coordinates bắt buộc cho backend
          from_lat: 10.762622,  // HCM Quận 1
          from_lng: 106.660172,
          to_lat: 10.732599,    // HCM Quận 7
          to_lng: 106.719749,
          from_address: 'Test điểm A - HCM',
          to_address: 'Test điểm B - HCM',
          distance_km: distance,
          // Thêm các field cho tier config nếu cần
          config_name: configName,
          config_type: 'tier'
        });
        
        if (generalResponse.data) {
          const price = generalResponse.data.calculated_price || generalResponse.data.total_price;
          if (price) {
            setSuccess(`✅ Test thành công: ${distance}km = ${price.toLocaleString()} VNĐ`);
            return;
          }
        }
      } catch (generalError) {
        console.warn('General API failed:', generalError.message);
        console.error('General API error details:', generalError.response?.data);
      }

      // Method 4: Dùng enhanced API với full coordinates
      try {
        const enhancedResponse = await apiService.calculatePriceEnhanced({
          from_lat: 10.762622,
          from_lng: 106.660172,
          to_lat: 10.732599,
          to_lng: 106.719749,
          from_address: 'Test điểm A - HCM',
          to_address: 'Test điểm B - HCM',
          distance_km: distance
        });
        
        if (enhancedResponse.data) {
          const price = enhancedResponse.data.calculated_price || enhancedResponse.data.total_price;
          if (price) {
            setSuccess(`✅ Test thành công (enhanced): ${distance}km = ${price.toLocaleString()} VNĐ`);
            return;
          }
        }
      } catch (enhancedError) {
        console.warn('Enhanced API failed:', enhancedError.message);
      }

      // Nếu tất cả methods đều fail
      throw new Error('Tất cả các phương thức test đều thất bại');
      
    } catch (err) {
      console.error('❌ Test pricing error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Lỗi không xác định';
      setError('Lỗi test: ' + errorMessage);
      
      // Hiển thị thêm thông tin debug
      if (err.response?.data) {
        console.error('Error response data:', err.response.data);
      }
    }
  };

  // Function debug config
  const debugConfig = async (configName) => {
    try {
      console.log(`🔍 Debugging config: ${configName}`);
      
      const configResponse = await apiService.getTierConfig(configName);
      console.log('Config data:', configResponse.data);
      
      const config = configResponse.data;
      if (!config.tiers || !Array.isArray(config.tiers)) {
        console.error('❌ Config structure invalid:', config);
        setError('Cấu hình không hợp lệ: thiếu tiers data');
        return;
      }
      
      config.tiers.forEach((tier, index) => {
        console.log(`Tier ${index}:`, tier);
        if (tier.price_per_km === null || tier.price_per_km === undefined) {
          console.error(`❌ Tier ${index} has null price_per_km`);
        }
        if (tier.from_km === null || tier.from_km === undefined) {
          console.error(`❌ Tier ${index} has null from_km`);
        }
      });
      
      setSuccess('✅ Config debug complete - check console for details');
      
    } catch (err) {
      console.error('Debug error:', err);
      setError('Lỗi debug: ' + err.message);
    }
  };

  // Error boundary cho component
  if (error && error.includes('Cannot read properties')) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <h3 className="font-semibold">⚠️ Lỗi component</h3>
          <p>Có lỗi xảy ra khi tải component. Vui lòng tải lại trang.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            🔄 Tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">🎯 Cấu hình giá theo bậc</h2>
          {activeConfig && (
            <p className="text-sm text-green-600 mt-1">
              ⭐ Active: {activeConfig}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setIsEditing(true);
            setSelectedConfig(null);
            resetForm();
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          ➕ Thêm cấu hình mới
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          ✅ {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Danh sách cấu hình */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Danh sách cấu hình</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Đang tải...</p>
            </div>
          ) : configs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có cấu hình nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {configs.map((config) => (
                <div key={config.id || config.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{config.name}</h4>
                        {config.is_active && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Giá cơ sở: {config.base_price?.toLocaleString() || 'N/A'} VNĐ
                      </p>
                      <p className="text-sm text-gray-600">
                        Bậc giá: {config.tiers?.length || 0} bậc
                      </p>
                      {config.created_at && (
                        <p className="text-xs text-gray-500">
                          Tạo: {new Date(config.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => testPricing(config.name)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          title="Test với 25km"
                        >
                          🧪 Test
                        </button>
                        <button
                          onClick={() => debugConfig(config.name)}
                          className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                          title="Debug config data"
                        >
                          🔍 Debug
                        </button>
                      </div>
                      <div className="flex space-x-2">
                        {!config.is_active && (
                          <button
                            onClick={() => handleSetActive(config.name)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                            disabled={loading}
                          >
                            ⭐ Set Active
                          </button>
                        )}
                        <button
                          onClick={() => handleEditConfig(config)}
                          className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteConfig(config.name)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          disabled={loading}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hiển thị tiers */}
                  {config.tiers && Array.isArray(config.tiers) && (
                    <div className="mt-3 space-y-1">
                      {config.tiers.map((tier, idx) => (
                        <div key={idx} className="text-xs bg-gray-50 px-2 py-1 rounded">
                          {tier.description || `${tier.from_km || 0}-${tier.to_km || '∞'}km: ${tier.price_per_km?.toLocaleString() || 'N/A'} VNĐ/km`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form tạo/chỉnh sửa cấu hình */}
        {isEditing && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedConfig ? '✏️ Chỉnh sửa cấu hình' : '➕ Thêm cấu hình mới'}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedConfig(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Tên cấu hình */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên cấu hình *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Ví dụ: tier_city_2025"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={selectedConfig !== null}
                />
              </div>

              {/* Giá cơ sở */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá cơ sở (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData(prev => ({...prev, base_price: Number(e.target.value) || 0}))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Bậc giá */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Bậc giá *
                  </label>
                  <button
                    onClick={addTier}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    ➕ Thêm bậc
                  </button>
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {formData.tiers && formData.tiers.map((tier, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Bậc {index + 1}</span>
                        {formData.tiers.length > 1 && (
                          <button
                            onClick={() => removeTier(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Từ (km)</label>
                          <input
                            type="number"
                            value={tier.from_km || ''}
                            onChange={(e) => updateTier(index, 'from_km', e.target.value)}
                            className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Đến (km)</label>
                          <input
                            type="number"
                            value={tier.to_km || ''}
                            onChange={(e) => updateTier(index, 'to_km', e.target.value)}
                            placeholder="∞"
                            className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Giá/km (VNĐ)</label>
                          <input
                            type="number"
                            value={tier.price_per_km || ''}
                            onChange={(e) => updateTier(index, 'price_per_km', e.target.value)}
                            className="w-full p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        {tier.description || 'Chưa có mô tả'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSaveConfig}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {loading ? 'Đang lưu...' : selectedConfig ? '💾 Cập nhật' : '💾 Lưu cấu hình'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedConfig(null);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  ❌ Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hướng dẫn */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">💡 Hướng dẫn sử dụng:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Mỗi cấu hình có thể có nhiều bậc giá khác nhau theo khoảng cách</li>
          <li>• Bậc cuối cùng có thể để trống "Đến (km)" để áp dụng cho tất cả khoảng cách lớn hơn</li>
          <li>• Sử dụng nút "Test" để kiểm tra tính giá với khoảng cách 25km</li>
          <li>• Sử dụng nút "Set Active" để chọn cấu hình sử dụng cho hệ thống</li>
          <li>• Chỉ có một cấu hình được active tại một thời điểm</li>
          <li>• Tên cấu hình không thể thay đổi sau khi tạo</li>
        </ul>
      </div>
    </div>
  );
};

export default TierPriceManager;