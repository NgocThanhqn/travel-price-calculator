// 1. Component quản lý cấu hình giá theo bậc (frontend/src/components/TierPriceManager.jsx)

import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const TierPriceManager = () => {
  const [configs, setConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data cho cấu hình mới
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
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/tier-configs');
      setConfigs(response.data);
    } catch (err) {
      setError('Không thể tải cấu hình: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      setError('');
      
      await apiService.post('/tier-configs', formData);
      setSuccess('Lưu cấu hình thành công!');
      setIsEditing(false);
      loadConfigs();
      
      // Reset form
      setFormData({
        name: '',
        base_price: 10000,
        tiers: [
          { from_km: 0, to_km: 10, price_per_km: 15000, description: '0-10km: 15,000 VNĐ/km' },
          { from_km: 10, to_km: 50, price_per_km: 12000, description: '10-50km: 12,000 VNĐ/km' },
          { from_km: 50, to_km: null, price_per_km: 8000, description: 'Trên 50km: 8,000 VNĐ/km' }
        ]
      });
    } catch (err) {
      setError('Lỗi lưu cấu hình: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const addTier = () => {
    const newTier = {
      from_km: 0,
      to_km: null,
      price_per_km: 10000,
      description: ''
    };
    setFormData(prev => ({
      ...prev,
      tiers: [...prev.tiers, newTier]
    }));
  };

  const removeTier = (index) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index)
    }));
  };

  const updateTier = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.map((tier, i) => 
        i === index ? { ...tier, [field]: field.includes('km') || field === 'price_per_km' ? 
          (value === '' ? null : parseFloat(value)) : value } : tier
      )
    }));
  };

  const calculateExample = (distance) => {
    const config = formData;
    let total = config.base_price;
    let breakdown = [];
    
    for (const tier of config.tiers) {
      if (distance > tier.from_km) {
        const tierEnd = tier.to_km || distance;
        const tierDistance = Math.min(distance - tier.from_km, tierEnd - tier.from_km);
        
        if (tierDistance > 0) {
          const tierPrice = tierDistance * tier.price_per_km;
          total += tierPrice;
          breakdown.push({
            range: `${tier.from_km}-${tier.to_km || '∞'}km`,
            distance: tierDistance,
            price: tierPrice
          });
        }
      }
    }
    
    return { total, breakdown };
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🚗 Quản lý giá theo bậc quãng đường</h2>
        
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Danh sách cấu hình hiện có */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">📋 Cấu hình hiện có</h3>
          {configs.length === 0 ? (
            <p className="text-gray-500">Chưa có cấu hình nào</p>
          ) : (
            <div className="grid gap-4">
              {configs.map((config) => (
                <div key={config.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold">{config.name}</h4>
                  <p className="text-sm text-gray-600">Giá khởi điểm: {config.base_price?.toLocaleString()} VNĐ</p>
                  <div className="mt-2">
                    {config.tiers.map((tier, index) => (
                      <div key={index} className="text-sm text-gray-700">
                        • {tier.from_km}-{tier.to_km || '∞'}km: {tier.price_per_km?.toLocaleString()} VNĐ/km
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Button tạo cấu hình mới */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isEditing ? '❌ Hủy' : '➕ Tạo cấu hình mới'}
        </button>

        {/* Form tạo/chỉnh sửa cấu hình */}
        {isEditing && (
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">✏️ Tạo cấu hình mới</h3>
            
            {/* Tên cấu hình và giá khởi điểm */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên cấu hình
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: default_tier, weekend_pricing..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá khởi điểm (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.base_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Danh sách bậc giá */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">🎯 Các bậc giá</h4>
                <button
                  onClick={addTier}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  + Thêm bậc
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.tiers.map((tier, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Từ (km)
                        </label>
                        <input
                          type="number"
                          value={tier.from_km || ''}
                          onChange={(e) => updateTier(index, 'from_km', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          min="0"
                          step="0.1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Đến (km)
                        </label>
                        <input
                          type="number"
                          value={tier.to_km || ''}
                          onChange={(e) => updateTier(index, 'to_km', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          min="0"
                          step="0.1"
                          placeholder="Không giới hạn"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Giá/km (VNĐ)
                        </label>
                        <input
                          type="number"
                          value={tier.price_per_km || ''}
                          onChange={(e) => updateTier(index, 'price_per_km', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Mô tả
                        </label>
                        <input
                          type="text"
                          value={tier.description || ''}
                          onChange={(e) => updateTier(index, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          placeholder="VD: Giá gần"
                        />
                      </div>
                      
                      <button
                        onClick={() => removeTier(index)}
                        className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        disabled={formData.tiers.length === 1}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview tính giá */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-800 mb-3">💡 Ví dụ tính giá</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {[5, 25, 60].map(distance => {
                  const calc = calculateExample(distance);
                  return (
                    <div key={distance} className="bg-white p-3 rounded">
                      <div className="font-semibold text-blue-700">{distance}km:</div>
                      <div className="text-gray-600">
                        Khởi điểm: {formData.base_price?.toLocaleString()}đ
                      </div>
                      {calc.breakdown.map((item, i) => (
                        <div key={i} className="text-gray-600">
                          {item.range}: +{item.price?.toLocaleString()}đ
                        </div>
                      ))}
                      <div className="font-bold text-green-600 border-t pt-1 mt-1">
                        Tổng: {calc.total?.toLocaleString()} VNĐ
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nút lưu */}
            <div className="text-center">
              <button
                onClick={handleSaveConfig}
                disabled={loading || !formData.name}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? '⏳ Đang lưu...' : '💾 Lưu cấu hình'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TierPriceManager;