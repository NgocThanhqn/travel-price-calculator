import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const TierPriceCalculator = ({ distance, onPriceCalculated }) => {
  const [configs, setConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState('');
  const [priceResult, setPriceResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  useEffect(() => {
    if (distance && selectedConfig) {
      calculatePrice();
    }
  }, [distance, selectedConfig]);

  const loadConfigs = async () => {
    try {
      const response = await apiService.getTierConfigs();
      setConfigs(response.data);
      if (response.data.length > 0) {
        setSelectedConfig(response.data[0].name);
      }
    } catch (err) {
      console.error('Error loading configs:', err);
    }
  };

  const calculatePrice = async () => {
    if (!distance || !selectedConfig) return;

    try {
      setLoading(true);
      const response = await apiService.calculateTierPrice(selectedConfig, distance);
      setPriceResult(response.data);
      if (onPriceCalculated) {
        onPriceCalculated(response.data);
      }
    } catch (err) {
      console.error('Error calculating price:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 form-compact">
      <h3 className="text-lg font-semibold mb-4">💰 Tính giá theo bậc quãng đường</h3>
      
      {/* Chọn cấu hình giá */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn bảng giá:
        </label>
        <select
          value={selectedConfig}
          onChange={(e) => setSelectedConfig(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {configs.map((config) => (
            <option key={config.name} value={config.name}>
              {config.name} - Khởi điểm: {config.base_price?.toLocaleString()} VNĐ
            </option>
          ))}
        </select>
      </div>

      {/* Kết quả tính giá */}
      {priceResult && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-green-600">
              {priceResult.total_price?.toLocaleString()} VNĐ
            </div>
            <div className="text-sm text-gray-600">
              Tổng chi phí cho {priceResult.distance_km}km
            </div>
          </div>

          {/* Chi tiết tính giá */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Giá khởi điểm:</span>
              <span className="font-medium">{priceResult.base_price?.toLocaleString()} VNĐ</span>
            </div>
            
            {priceResult.price_breakdown?.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.tier} ({item.distance}km × {item.price_per_km?.toLocaleString()}đ/km):
                </span>
                <span className="font-medium">+{item.tier_price?.toLocaleString()} VNĐ</span>
              </div>
            ))}
            
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Tổng cộng:</span>
              <span className="text-green-600">{priceResult.total_price?.toLocaleString()} VNĐ</span>
            </div>
          </div>

          {/* Hiển thị bảng giá đang áp dụng */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">📋 Bảng giá đang áp dụng:</h4>
            {configs.find(c => c.name === selectedConfig)?.tiers?.map((tier, index) => (
              <div key={index} className="text-xs text-gray-600">
                • {tier.from_km}-{tier.to_km || '∞'}km: {tier.price_per_km?.toLocaleString()} VNĐ/km
                {tier.description && ` (${tier.description})`}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Đang tính toán giá...</p>
        </div>
      )}
    </div>
  );
};

export default TierPriceCalculator;