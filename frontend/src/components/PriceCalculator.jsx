import React, { useState } from 'react';
import { apiService } from '../services/api';
import MapSelector from './MapSelector';

const PriceCalculator = () => {
  const [fromCoords, setFromCoords] = useState({ lat: '', lng: '' });
  const [toCoords, setToCoords] = useState({ lat: '', lng: '' });
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [selectingMode, setSelectingMode] = useState(null); // 'from' or 'to'
  const [selectedLocations, setSelectedLocations] = useState({});

  // Temporary API key - replace with real one
  //const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY_HERE';

  const handleLocationSelect = (location) => {
    if (selectingMode === 'from') {
      setFromCoords({ lat: location.lat.toString(), lng: location.lng.toString() });
      setFromAddress(location.address);
      setSelectedLocations(prev => ({ ...prev, from: location }));
    } else if (selectingMode === 'to') {
      setToCoords({ lat: location.lat.toString(), lng: location.lng.toString() });
      setToAddress(location.address);
      setSelectedLocations(prev => ({ ...prev, to: location }));
    }
  };

  const openMapSelector = (mode) => {
    setSelectingMode(mode);
    setShowMap(true);
  };

  const handleCalculate = async () => {
    if (!fromCoords.lat || !fromCoords.lng || !toCoords.lat || !toCoords.lng) {
      setError('Vui lòng nhập đầy đủ tọa độ điểm đi và điểm đến');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData = {
        from_lat: parseFloat(fromCoords.lat),
        from_lng: parseFloat(fromCoords.lng),
        to_lat: parseFloat(toCoords.lat),
        to_lng: parseFloat(toCoords.lng),
        from_address: fromAddress || null,
        to_address: toAddress || null,
      };

      const response = await apiService.calculatePrice(requestData);
      setResult(response.data);
    } catch (err) {
      setError('Có lỗi xảy ra khi tính toán: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTestCalculation = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.testDistance();
      setResult(response.data);
    } catch (err) {
      setError('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillSampleData = () => {
    const fromLoc = { lat: 10.762622, lng: 106.660172, address: 'Quận 1, TP.HCM' };
    const toLoc = { lat: 10.732599, lng: 106.719749, address: 'Quận 7, TP.HCM' };
    
    setFromCoords({ lat: '10.762622', lng: '106.660172' });
    setToCoords({ lat: '10.732599', lng: '106.719749' });
    setFromAddress('Quận 1, TP.HCM');
    setToAddress('Quận 7, TP.HCM');
    setSelectedLocations({ from: fromLoc, to: toLoc });
  };

  if (showMap) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Chọn {selectingMode === 'from' ? 'điểm đi' : 'điểm đến'} trên bản đồ
          </h2>
          <button
            onClick={() => setShowMap(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ← Quay lại
          </button>
        </div>
        
        <MapSelector 
          onLocationSelect={handleLocationSelect}
          selectedLocations={selectedLocations}
          // apiKey={GOOGLE_MAPS_API_KEY}
        />
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowMap(false)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Xong - Quay lại tính giá
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Tính Giá Chuyến Đi
      </h1>

      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Điểm đi */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">📍 Điểm đi</h3>
            <button
              onClick={() => openMapSelector('from')}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              🗺️ Chọn trên bản đồ
            </button>
          </div>
          <input
            type="text"
            placeholder="Địa chỉ điểm đi"
            value={fromAddress}
            onChange={(e) => setFromAddress(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude (VD: 10.762622)"
              value={fromCoords.lat}
              onChange={(e) => setFromCoords({...fromCoords, lat: e.target.value})}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude (VD: 106.660172)"
              value={fromCoords.lng}
              onChange={(e) => setFromCoords({...fromCoords, lng: e.target.value})}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Điểm đến */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">🎯 Điểm đến</h3>
            <button
              onClick={() => openMapSelector('to')}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              🗺️ Chọn trên bản đồ
            </button>
          </div>
          <input
            type="text"
            placeholder="Địa chỉ điểm đến"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude (VD: 10.732599)"
              value={toCoords.lat}
              onChange={(e) => setToCoords({...toCoords, lat: e.target.value})}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude (VD: 106.719749)"
              value={toCoords.lng}
              onChange={(e) => setToCoords({...toCoords, lng: e.target.value})}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={fillSampleData}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
        >
          Điền dữ liệu mẫu
        </button>
        
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Đang tính toán...' : '💰 Tính giá'}
        </button>
        
        <button
          onClick={handleTestCalculation}
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          🧪 Test mẫu
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">📊 Kết quả tính toán</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-20">Từ:</span> 
                <span className="text-blue-600">{result.from_address || result.from}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-20">Đến:</span> 
                <span className="text-blue-600">{result.to_address || result.to}</span>
              </p>
              <p className="flex items-center">
                <span className="font-semibold text-gray-700 w-20">Khoảng cách:</span> 
                <span className="text-orange-600 font-semibold">{result.distance_km} km</span>
              </p>
              {result.duration_minutes && (
                <p className="flex items-center">
                  <span className="font-semibold text-gray-700 w-20">Thời gian:</span> 
                  <span className="text-purple-600">{result.duration_minutes} phút</span>
                </p>
              )}
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Tổng chi phí</p>
                <p className="text-4xl font-bold text-green-600">
                  {(result.calculated_price || result.price_info?.final_price)?.toLocaleString('vi-VN')} 
                  <span className="text-lg ml-1">VNĐ</span>
                </p>
              </div>
            </div>
          </div>

          {/* Price breakdown */}
          {(result.breakdown || result.price_info) && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold mb-3 text-gray-700">💡 Chi tiết tính giá:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600">Giá cơ bản</p>
                  <p className="font-semibold text-blue-600">
                    {(result.breakdown?.base_price || result.price_info?.base_price)?.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600">Giá theo km</p>
                  <p className="font-semibold text-orange-600">
                    {(result.breakdown?.price_per_km || result.price_info?.price_per_km)?.toLocaleString('vi-VN')} VNĐ/km
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600">Chi phí khoảng cách</p>
                  <p className="font-semibold text-purple-600">
                    {(result.breakdown?.breakdown?.distance_cost || (result.distance_km * result.price_info?.price_per_km))?.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;