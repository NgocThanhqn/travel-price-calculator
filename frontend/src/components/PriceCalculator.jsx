import React, { useState, useEffect } from 'react';
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

  // Booking form states
  const [vehicleType, setVehicleType] = useState('4_seats');
  const [vehicleTypes, setVehicleTypes] = useState({});
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    travel_date: '',
    travel_time: '08:00',
    passenger_count: 1,
    notes: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');

  useEffect(() => {
    loadVehicleTypes();
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingData(prev => ({
      ...prev,
      travel_date: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  const loadVehicleTypes = async () => {
    try {
      const response = await apiService.getVehicleTypes();
      setVehicleTypes(response.data);
    } catch (err) {
      console.error('Error loading vehicle types:', err);
      // Fallback vehicle types
      setVehicleTypes({
        "4_seats": {
          "name": "Xe 4 chỗ",
          "description": "Phù hợp cho 1-3 khách",
          "price_multiplier": 1.0,
          "max_passengers": 4
        },
        "7_seats": {
          "name": "Xe 7 chỗ", 
          "description": "Phù hợp cho 4-6 khách",
          "price_multiplier": 1.2,
          "max_passengers": 7
        },
        "16_seats": {
          "name": "Xe 16 chỗ",
          "description": "Phù hợp cho 7-15 khách", 
          "price_multiplier": 1.5,
          "max_passengers": 16
        }
      });
    }
  };

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
    setShowBookingForm(false);
    setBookingSuccess('');

    try {
      const requestData = {
        from_lat: parseFloat(fromCoords.lat),
        from_lng: parseFloat(fromCoords.lng),
        to_lat: parseFloat(toCoords.lat),
        to_lng: parseFloat(toCoords.lng),
        from_address: fromAddress || null,
        to_address: toAddress || null,
        vehicle_type: vehicleType
      };

      // Sử dụng enhanced API để có khoảng cách chính xác từ Google Maps
      const response = await apiService.calculatePriceEnhanced(requestData);
      setResult(response.data);
      
      // Auto show booking form after successful price calculation
      setTimeout(() => {
        setShowBookingForm(true);
      }, 1000);
      
    } catch (err) {
      setError('Có lỗi xảy ra khi tính toán: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleTestCalculation = async () => {
    setLoading(true);
    setError('');
    setShowBookingForm(false);
    setBookingSuccess('');
    try {
      // Test với enhanced API để có khoảng cách chính xác
      const response = await apiService.testGoogleMaps();
      if (response.data && response.data.success) {
        // Tạo fake result object từ test data để hiển thị
        const testResult = {
          distance_km: response.data.test_result?.distance || 15.2,
          duration_minutes: response.data.test_result?.duration || 28.5,
          calculated_price: 76000, // Giá mẫu
          from_address: response.data.test_result?.from_address || "Quận 1, TP.HCM",
          to_address: response.data.test_result?.to_address || "Quận 7, TP.HCM",
          calculation_method: response.data.test_result?.method || "google_maps",
          breakdown: {
            base_price: 10000,
            price_per_km: 5000,
            final_price: 76000
          }
        };
        setResult(testResult);
        
        // Auto show booking form after test
        setTimeout(() => {
          setShowBookingForm(true);
        }, 1000);
      } else if (response.data && response.data.will_use_fallback) {
        // Fallback case - vẫn hiển thị kết quả
        const fallbackResult = {
          distance_km: response.data.test_result?.distance || 12.8,
          duration_minutes: response.data.test_result?.duration || 30.7,
          calculated_price: 74000,
          from_address: "Quận 1, TP.HCM (ước tính)",
          to_address: "Quận 7, TP.HCM (ước tính)", 
          calculation_method: response.data.test_result?.method || "haversine_adjusted",
          breakdown: {
            base_price: 10000,
            price_per_km: 5000,
            final_price: 74000
          }
        };
        setResult(fallbackResult);
        
        setTimeout(() => {
          setShowBookingForm(true);
        }, 1000);
      } else {
        throw new Error('Test failed');
      }
      
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

  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setError('');
    setBookingSuccess('');

    try {
      const bookingRequestData = {
        customer_name: bookingData.customer_name,
        customer_phone: bookingData.customer_phone,
        customer_email: bookingData.customer_email,
        from_lat: parseFloat(fromCoords.lat),
        from_lng: parseFloat(fromCoords.lng),
        to_lat: parseFloat(toCoords.lat),
        to_lng: parseFloat(toCoords.lng),
        from_address: fromAddress,
        to_address: toAddress,
        travel_date: bookingData.travel_date,
        travel_time: bookingData.travel_time,
        passenger_count: parseInt(bookingData.passenger_count),
        vehicle_type: vehicleType,
        notes: bookingData.notes
      };

      const response = await apiService.createBooking(bookingRequestData);
      
      if (response.data.success) {
        setBookingSuccess(`🎉 Đặt chuyến thành công! Mã đặt chuyến: #${response.data.booking_id}. Chúng tôi sẽ liên hệ với bạn sớm nhất.`);
        
        // Reset booking form
        setBookingData({
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          travel_date: '',
          travel_time: '08:00',
          passenger_count: 1,
          notes: ''
        });
        
        // Hide booking form after 5 seconds
        setTimeout(() => {
          setShowBookingForm(false);
        }, 5000);
      }
      
    } catch (err) {
      setError('Có lỗi xảy ra khi đặt chuyến: ' + (err.response?.data?.detail || err.message));
    } finally {
      setBookingLoading(false);
    }
  };

  // Calculate price with vehicle multiplier
  const getAdjustedPrice = () => {
    if (!result || !vehicleTypes[vehicleType]) return result;
    
    const multiplier = vehicleTypes[vehicleType].price_multiplier;
    const basePrice = result.calculated_price || result.price_info?.final_price;
    
    return {
      ...result,
      calculated_price: Math.round(basePrice * multiplier),
      original_price: basePrice,
      vehicle_multiplier: multiplier
    };
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

  const adjustedResult = getAdjustedPrice();

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

      {/* Vehicle Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🚙 Loại xe
        </label>
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Object.entries(vehicleTypes).map(([key, vehicle]) => (
            <option key={key} value={key}>
              {vehicle.name} - {vehicle.description} (×{vehicle.price_multiplier})
            </option>
          ))}
        </select>
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

      {/* Success Display */}
      {bookingSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {bookingSuccess}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border mb-6">
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
              <p className="flex items-center">
                <span className="font-medium text-gray-700">Loại xe:</span> 
                <span className="text-indigo-600">{vehicleTypes[vehicleType]?.name}</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium text-gray-700">Phương thức:</span> 
                <span className="text-blue-600">
                  {result.calculation_method === 'google_maps' ? '🗺️ Google Maps' : 
                   result.calculation_method === 'enhanced_haversine' ? '🧮 Ước tính nâng cao' :
                   result.calculation_method === 'haversine_adjusted' ? '📐 Ước tính điều chỉnh' : 
                   '🔍 Đang tính toán'}
                </span>
              </p>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Tổng chi phí</p>
                <p className="text-4xl font-bold text-green-600">
                  {adjustedResult.calculated_price?.toLocaleString('vi-VN')} 
                  <span className="text-lg ml-1">VNĐ</span>
                </p>
                {adjustedResult.vehicle_multiplier !== 1.0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    (Giá gốc: {adjustedResult.original_price?.toLocaleString('vi-VN')} VNĐ × {adjustedResult.vehicle_multiplier})
                  </p>
                )}
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

          {/* Book Now Button */}
          {!showBookingForm && (
            <div className="text-center mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowBookingForm(true)}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                🚗 Đặt chuyến ngay
              </button>
              <p className="text-sm text-gray-500 mt-2">
                * Giá trên là ước tính. Giá cuối cùng sẽ được xác nhận khi liên hệ.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Booking Form - Styled like HappyTrip */}
      {showBookingForm && result && (
        <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-green-50 p-6 rounded-xl border-2 border-orange-200 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-orange-600 mb-2">
              🎫 Đặt chuyến đi ngay
            </h3>
            <p className="text-gray-600">Điền thông tin để chúng tôi liên hệ xác nhận</p>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* Customer Information - HappyTrip Style */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-orange-100">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                👤 Thông tin liên hệ
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    value={bookingData.customer_name}
                    onChange={handleBookingInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    value={bookingData.customer_phone}
                    onChange={handleBookingInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0901234567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (tùy chọn)
                  </label>
                  <input
                    type="email"
                    name="customer_email"
                    value={bookingData.customer_email}
                    onChange={handleBookingInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-orange-100">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                📅 Chi tiết chuyến đi
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày đi *
                  </label>
                  <input
                    type="date"
                    name="travel_date"
                    value={bookingData.travel_date}
                    onChange={handleBookingInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giờ đi *
                  </label>
                  <input
                    type="time"
                    name="travel_time"
                    value={bookingData.travel_time}
                    onChange={handleBookingInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số hành khách
                  </label>
                  <select
                    name="passenger_count"
                    value={bookingData.passenger_count}
                    onChange={handleBookingInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    {[...Array(vehicleTypes[vehicleType]?.max_passengers || 4)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} người
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú đặc biệt
                </label>
                <textarea
                  name="notes"
                  value={bookingData.notes}
                  onChange={handleBookingInputChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Yêu cầu đặc biệt, điểm đón cụ thể, ghi chú về hành lý..."
                ></textarea>
              </div>
            </div>

            {/* Trip Summary - HappyTrip Style */}
            <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-5 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                📋 Tóm tắt đặt chuyến
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><span className="font-medium text-gray-700">Từ:</span> <span className="text-blue-600">{fromAddress}</span></p>
                  <p><span className="font-medium text-gray-700">Đến:</span> <span className="text-blue-600">{toAddress}</span></p>
                  <p><span className="font-medium text-gray-700">Khoảng cách:</span> <span className="text-orange-600">{result.distance_km} km</span></p>
                  <p><span className="font-medium text-gray-700">Thời gian:</span> <span className="text-purple-600">{result.duration_minutes} phút</span></p>
                </div>
                <div className="space-y-2">
                  <p><span className="font-medium text-gray-700">Loại xe:</span> <span className="text-indigo-600">{vehicleTypes[vehicleType]?.name}</span></p>
                  <p><span className="font-medium text-gray-700">Số khách:</span> <span className="text-green-600">{bookingData.passenger_count} người</span></p>
                  <div className="bg-white p-3 rounded-lg mt-3">
                    <p className="text-center">
                      <span className="text-lg font-medium text-gray-700">Tổng chi phí:</span>
                    </p>
                    <p className="text-center text-2xl font-bold text-green-600">
                      {adjustedResult.calculated_price?.toLocaleString('vi-VN')} VNĐ
                    </p>
                    <p className="text-center text-xs text-gray-500 mt-1">
                      * Giá ước tính, sẽ được xác nhận lại
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold transition-colors"
              >
                ← Quay lại
              </button>
              <button
                type="submit"
                disabled={bookingLoading}
                className="flex-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                {bookingLoading ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    📞 Đặt chuyến ngay
                  </>
                )}
              </button>
            </div>

            {/* Terms Notice */}
            <div className="text-center text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded-lg">
              <p>
                ✓ Bằng việc đặt chuyến, bạn đồng ý với <span className="text-blue-600 underline cursor-pointer">điều khoản dịch vụ</span> của chúng tôi
              </p>
              <p className="mt-1">
                📞 Chúng tôi sẽ liên hệ xác nhận trong vòng 5-10 phút
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;