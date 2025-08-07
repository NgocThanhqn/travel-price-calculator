import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import MapSelector from './MapSelector';
import CompactAddressSelector from './CompactAddressSelector';

import googleMapsLoader from '../utils/googleMapsLoader';

const PriceCalculator = () => {
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsError, setMapsError] = useState('');

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

  // Address selector states
  const [showFromAddressSelector, setShowFromAddressSelector] = useState(false);
  const [showToAddressSelector, setShowToAddressSelector] = useState(false);
  const [apiKey, setApiKey] = useState('');

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
  // 1. THÊM STATE MỚI để lưu thông tin vé:
  const [ticketInfo, setTicketInfo] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    loadVehicleTypes();
    loadApiKey();
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingData(prev => ({
      ...prev,
      travel_date: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  // Khởi tạo Google Maps ngay khi component mount
  useEffect(() => {
    const initializeMaps = async () => {
      try {
        setMapsLoading(true);
        console.log('🗺️ Initializing Google Maps for geocoding...');
        
        // Sử dụng GoogleMapsLoader của bạn
        await googleMapsLoader.load();
        
        setMapsReady(true);
        setMapsError('');
        console.log('✅ Google Maps ready for geocoding in PriceCalculator');
        
      } catch (error) {
        setMapsError(error.message);
        console.error('❌ Maps initialization failed:', error);
      } finally {
        setMapsLoading(false);
      }
    };

    initializeMaps();
  }, []);

  // Cập nhật geocoding function để sử dụng GoogleMapsLoader
  const geocodeAddress = async (address) => {
    try {
      if (!mapsReady) {
        throw new Error('Google Maps chưa sẵn sàng. Vui lòng chờ...');
      }

      console.log('🔍 Geocoding address:', address);
      
      // Sử dụng method geocodeAddress từ GoogleMapsLoader
      const coords = await googleMapsLoader.geocodeAddress(address);
      
      console.log('✅ Geocoding success:', coords);
      return coords;
      
    } catch (error) {
      console.error('❌ Geocoding failed:', error);
      throw error;
    }
  };
  // Cập nhật search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    const searchQuery = e.target.search.value.trim();
    
    if (!searchQuery) return;

    if (!mapsReady) {
      setError('Google Maps đang khởi tạo, vui lòng chờ...');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const coords = await geocodeAddress(searchQuery);
      
      if (coords.lat && coords.lng) {
        // Handle location select based on current mode
        if (selectingFromAddress) {
          handleFromAddressSelect(coords);
        } else if (selectingToAddress) {
          handleToAddressSelect(coords);
        }
        
        // Clear search after selection
        e.target.search.value = '';
      }
    } catch (error) {
      setError('Lỗi tìm kiếm: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadApiKey = async () => {
    try {
      const key = localStorage.getItem('googleMapsApiKey');
      if (key) {
        setApiKey(key);
      }
    } catch (error) {
      console.error('❌ Lỗi tải API key:', error);
    }
  };

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

  const handleFromAddressSelect = (location) => {
    if (location) {
      setFromCoords({ 
        lat: location.lat ? location.lat.toString() : '', 
        lng: location.lng ? location.lng.toString() : '' 
      });
      setFromAddress(location.address);
      setSelectedLocations(prev => ({ ...prev, from: location }));
    }
    setShowFromAddressSelector(false);
  };

  const handleToAddressSelect = (location) => {
    if (location) {
      setToCoords({ 
        lat: location.lat ? location.lat.toString() : '', 
        lng: location.lng ? location.lng.toString() : '' 
      });
      setToAddress(location.address);
      setSelectedLocations(prev => ({ ...prev, to: location }));
    }
    setShowToAddressSelector(false);
  };

  const openMapSelector = (mode) => {
    setSelectingMode(mode);
    setShowMap(true);
  };

  const handleCalculate = async () => {
    if (!fromCoords.lat || !fromCoords.lng || !toCoords.lat || !toCoords.lng) {
      setError('Vui lòng chọn đầy đủ điểm đi và điểm đến');
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
    try {
      const response = await apiService.testDistance();
      if (response.data && response.data.success) {
        // Fake a complete result for test
        const fallbackResult = {
          success: true,
          data: {
            distance_km: 15.2,
            duration_minutes: 25,
            base_price: 50000,
            distance_price: 24000,
            vehicle_multiplier: 1.0,
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

  const getAdjustedPrice = () => {
    if (!result || !vehicleTypes[vehicleType]) return null;
    
    // Thử nhiều cách để lấy giá cơ bản
    const basePrice = result.data?.final_price || 
                     result.data?.base_price || 
                     result.final_price || 
                     result.base_price || 
                     result.calculated_price || 
                     0;
    
    const multiplier = vehicleTypes[vehicleType].price_multiplier || 1;
    const adjustedPrice = Math.round(basePrice * multiplier);
    
    return {
      calculated_price: adjustedPrice,
      original_price: basePrice,
      vehicle_multiplier: multiplier
    };
  };

  const handleNewBooking = () => {
    // Reset all states
    setBookingSuccess('');
    setTicketInfo(null);
    setShowBookingForm(false);
    setResult(null);
    setError('');
    
    // Clear location data
    setFromCoords({ lat: '', lng: '' });
    setToCoords({ lat: '', lng: '' });
    setFromAddress('');
    setToAddress('');
    setSelectedLocations({});
    
    // Reset vehicle type
    setVehicleType('4_seats');
    
    // Reset booking data
    setBookingData({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      travel_date: '',
      travel_time: '08:00',
      passenger_count: 1,
      notes: ''
    });

    // Scroll to form địa chỉ
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }
    }, 100);
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
        // LUU THÔNG TIN VÉ TRƯỚC KHI RESET
        setTicketInfo({
          ...bookingData,  // Thông tin khách hàng
          from_address: fromAddress,
          to_address: toAddress,
          vehicle_type_name: vehicleTypes[vehicleType]?.name,
          distance_km: result.data?.distance_km || result.distance_km || 0,
          duration_minutes: result.data?.duration_minutes || result.duration_minutes || 0,
          calculated_price: getAdjustedPrice()?.calculated_price || result.data?.final_price || result.final_price || result.calculated_price || 0,
          booking_id: response.data.booking_id
        });

        setBookingSuccess(`🎉 Đặt chuyến thành công! Mã đặt chuyến: #${response.data.booking_id}. Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.`);
        
        // Reset form SAU KHI đã lưu thông tin vé
        setBookingData({
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          travel_date: '',
          travel_time: '08:00',
          passenger_count: 1,
          notes: ''
        });
      } else {
        setError('Có lỗi xảy ra khi đặt chuyến. Vui lòng thử lại.');
      }
      
    } catch (err) {
      setError('Có lỗi xảy ra: ' + (err.response?.data?.detail || err.message));
    } finally {
      setBookingLoading(false);
    }
  };

  // Nếu đang hiển thị map selector
  if (showMap) {
    return (
      <div className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🗺️ Chọn {selectingMode === 'from' ? 'điểm đi' : 'điểm đến'} trên bản đồ
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
    <div ref={formRef} className="max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Tính Giá Chuyến Đi
      </h1>
      
      {/* Maps Status Indicator */}
        {mapsLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <p className="text-blue-700 text-sm">
                🗺️ Đang khởi tạo Google Maps... Tính năng tìm kiếm sẽ hoạt động sau ít giây.
              </p>
            </div>
          </div>
        )}
        
        {mapsReady && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <p className="text-green-700 text-sm">
              ✅ Google Maps đã sẵn sàng! Bạn có thể tìm kiếm địa chỉ và chọn trên bản đồ.
            </p>
          </div>
        )}
        
        {mapsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-red-700 text-sm">
              ❌ Lỗi khởi tạo Maps: {mapsError}. 
              <a href="/admin" className="underline ml-1">Kiểm tra cấu hình API Key</a>
            </p>
          </div>
        )}
      
      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Điểm đi */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">📍 Chọn điểm đi</h3>
            <button
              onClick={() => openMapSelector('from')}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 font-medium"
              title="Chọn trên bản đồ"
            >
              🗺️ Chọn trên bản đồ
            </button>
          </div>

          {/* Default: Address Selector Form */}
          <CompactAddressSelector
            onAddressSelect={handleFromAddressSelect}
            apiKey={apiKey}
          />

          {/* Display selected address if any */}
          {fromAddress && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <label className="block text-sm font-medium text-green-800 mb-1">
                Địa chỉ đã chọn:
              </label>
              <input
                type="text"
                value={fromAddress}
                onChange={(e) => setFromAddress(e.target.value)}
                className="w-full p-2 border border-green-300 rounded bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Địa chỉ điểm đi"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-green-600">
                  {fromCoords.lat && fromCoords.lng ? 
                    `📍 Tọa độ: ${parseFloat(fromCoords.lat).toFixed(4)}, ${parseFloat(fromCoords.lng).toFixed(4)}` : 
                    '⚠️ Chưa có tọa độ chính xác'
                  }
                </span>
                <button
                  onClick={() => {
                    setFromAddress('');
                    setFromCoords({ lat: '', lng: '' });
                    setSelectedLocations(prev => ({ ...prev, from: null }));
                  }}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Xóa
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Điểm đến */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">🎯 Chọn điểm đến</h3>
            <button
              onClick={() => openMapSelector('to')}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 font-medium"
              title="Chọn trên bản đồ"
            >
              🗺️ Chọn trên bản đồ
            </button>
          </div>

          {/* Default: Address Selector Form */}
          <CompactAddressSelector
            onAddressSelect={handleToAddressSelect}
            apiKey={apiKey}
          />

          {/* Display selected address if any */}
          {toAddress && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <label className="block text-sm font-medium text-red-800 mb-1">
                Địa chỉ đã chọn:
              </label>
              <input
                type="text"
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="w-full p-2 border border-red-300 rounded bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Địa chỉ điểm đến"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-red-600">
                  {toCoords.lat && toCoords.lng ? 
                    `📍 Tọa độ: ${parseFloat(toCoords.lat).toFixed(4)}, ${parseFloat(toCoords.lng).toFixed(4)}` : 
                    '⚠️ Chưa có tọa độ chính xác'
                  }
                </span>
                <button
                  onClick={() => {
                    setToAddress('');
                    setToCoords({ lat: '', lng: '' });
                    setSelectedLocations(prev => ({ ...prev, to: null }));
                  }}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Xóa
                </button>
              </div>
            </div>
          )}
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
          {loading ? 'Đang tính toán...' : 'Tính giá'}
        </button>

        <button
          onClick={handleTestCalculation}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          Test mẫu
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">❌ {error}</p>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-green-800 mb-4">💰 Kết quả tính giá</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Khoảng cách</p>
              <p className="text-2xl font-bold text-blue-600">
                {(result.data?.distance_km || result.distance_km || 0)} km
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  (result.data?.calculation_method || result.calculation_method) === 'google_maps' ? 'bg-green-500' : 
                  (result.data?.calculation_method || result.calculation_method) === 'enhanced_haversine' ? 'bg-orange-500' :
                  (result.data?.calculation_method || result.calculation_method) === 'haversine_adjusted' ? 'bg-blue-500' : 
                  'bg-gray-500'
                }`}>
                </span>
                {(result.data?.calculation_method || result.calculation_method) === 'google_maps' ? '🗺️ Google Maps' : 
                 (result.data?.calculation_method || result.calculation_method) === 'enhanced_haversine' ? '🧮 Ước tính nâng cao' :
                 (result.data?.calculation_method || result.calculation_method) === 'haversine_adjusted' ? '📐 Ước tính điều chỉnh' : 
                 '🔍 Đang tính toán'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Thời gian ước tính</p>
              <p className="text-2xl font-bold text-orange-600">
                {(result.data?.duration_minutes || result.duration_minutes || 0)} phút
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Tổng chi phí</p>
              <p className="text-3xl font-bold text-green-600">
                {(adjustedResult?.calculated_price || result.data?.final_price || result.final_price || result.calculated_price || 0).toLocaleString('vi-VN')} 
                <span className="text-lg ml-1">VNĐ</span>
              </p>
              {adjustedResult?.vehicle_multiplier !== 1.0 && (
                <p className="text-sm text-gray-500 mt-1">
                  (Giá gốc: {adjustedResult?.original_price?.toLocaleString('vi-VN')} VNĐ × {adjustedResult?.vehicle_multiplier})
                </p>
              )}
            </div>
          </div>

          {/* Price breakdown */}
          {(result.data?.breakdown || result.data?.price_info || result.breakdown || result.price_info) && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold mb-3 text-gray-700">💡 Chi tiết tính giá:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600">Giá cơ bản</p>
                  <p className="font-semibold text-blue-600">
                    {(result.data?.breakdown?.base_price || result.data?.price_info?.base_price || result.data?.base_price || result.breakdown?.base_price || result.price_info?.base_price || result.base_price || 0)?.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600">Giá theo km</p>
                  <p className="font-semibold text-orange-600">
                    {(result.data?.breakdown?.price_per_km || result.data?.price_info?.price_per_km || result.data?.distance_price || result.breakdown?.price_per_km || result.price_info?.price_per_km || result.distance_price || 0)?.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-gray-600">Loại xe</p>
                  <p className="font-semibold text-purple-600">
                    {vehicleTypes[vehicleType]?.name} (×{vehicleTypes[vehicleType]?.price_multiplier})
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
                * Giá trên là ước tính. Giá cuối cùng sẽ được xác nhận qua điện thoại.
              </p>
            </div>
          )}
        </div>
      )}

      {bookingSuccess && ticketInfo && (
        <div className="mb-6 mx-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 text-center">
            <div className="text-3xl mb-2">✅</div>
            <h2 className="text-xl font-bold">Đặt vé thành công!</h2>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 mt-2 inline-block">
              <span className="text-sm font-medium">Mã đặt chuyến: #{ticketInfo.booking_id}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Customer Info */}
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h3 className="flex items-center font-semibold text-gray-800 mb-3">
                <span className="text-lg mr-2">👤</span>
                Thông tin khách hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Họ tên:</span>
                  <span className="font-medium text-gray-800">{ticketInfo.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Điện thoại:</span>
                  <span className="font-medium text-blue-600">{ticketInfo.customer_phone}</span>
                </div>
                {ticketInfo.customer_email && (
                  <div className="flex justify-between md:col-span-2">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-800">{ticketInfo.customer_email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trip Info */}
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h3 className="flex items-center font-semibold text-gray-800 mb-3">
                <span className="text-lg mr-2">🚗</span>
                Chi tiết chuyến đi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày đi:</span>
                  <span className="font-medium text-gray-800">{ticketInfo.travel_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giờ đi:</span>
                  <span className="font-medium text-gray-800">{ticketInfo.travel_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số khách:</span>
                  <span className="font-medium text-gray-800">{ticketInfo.passenger_count} người</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại xe:</span>
                  <span className="font-medium text-gray-800">{ticketInfo.vehicle_type_name}</span>
                </div>
              </div>
            </div>

            {/* Route Info */}
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h3 className="flex items-center font-semibold text-gray-800 mb-3">
                <span className="text-lg mr-2">🗺️</span>
                Tuyến đường
              </h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Điểm đi</div>
                    <div className="text-sm text-gray-800 font-medium">{ticketInfo.from_address}</div>
                  </div>
                </div>
                
                <div className="ml-6 border-l-2 border-dashed border-gray-300 h-4"></div>
                
                <div className="flex items-start">
                  <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">Điểm đến</div>
                    <div className="text-sm text-gray-800 font-medium">{ticketInfo.to_address}</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-2">
                      <div className="text-xs text-blue-600 mb-1">Khoảng cách</div>
                      <div className="text-sm font-semibold text-blue-800">{ticketInfo.distance_km} km</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2">
                      <div className="text-xs text-purple-600 mb-1">Thời gian dự kiến</div>
                      <div className="text-sm font-semibold text-purple-800">{ticketInfo.duration_minutes} phút</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Info */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Tổng chi phí</div>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {ticketInfo.calculated_price?.toLocaleString('vi-VN')} VNĐ
                </div>
                <div className="text-xs text-gray-500">
                  * Giá đã bao gồm thuế và phí dịch vụ
                </div>
              </div>
            </div>

            {/* Notes */}
            {ticketInfo.notes && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="flex items-center font-medium text-gray-800 mb-2">
                  <span className="text-lg mr-2">📝</span>
                  Ghi chú đặc biệt
                </h4>
                <p className="text-sm text-gray-700 italic">{ticketInfo.notes}</p>
              </div>
            )}

            {/* Status & Contact */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-center mb-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-blue-800">Trạng thái: Đang xử lý</span>
              </div>
              <div className="text-center text-sm text-blue-700">
                <p className="mb-2">📞 Chúng tôi sẽ liên hệ xác nhận trong <strong>15 phút</strong></p>
                <p className="text-xs text-blue-600">
                  Nếu có thay đổi, vui lòng gọi: <strong>1900 xxxx</strong>
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => {
                  setBookingSuccess('');
                  setTicketInfo(null);  // Reset ticket info
                  setShowBookingForm(false);
                  setBookingData();
                  handleNewBooking();
                }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <span className="mr-2">🚗</span>
                Đặt chuyến khác
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form */}
      {showBookingForm && result && !bookingSuccess && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold text-blue-800 mb-4">📞 Đặt chuyến ngay</h2>
          {/*{bookingSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">{bookingSuccess}</p>
            </div>
          )}
          */}

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* Summary */}
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3">📋 Thông tin chuyến đi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p><span className="font-medium text-gray-700">Từ:</span> <span className="text-blue-600">{fromAddress}</span></p>
                  <p><span className="font-medium text-gray-700">Đến:</span> <span className="text-blue-600">{toAddress}</span></p>
                  <p><span className="font-medium text-gray-700">Khoảng cách:</span> <span className="text-orange-600">{(result.data?.distance_km || result.distance_km || 0)} km</span></p>
                  <p><span className="font-medium text-gray-700">Thời gian:</span> <span className="text-purple-600">{(result.data?.duration_minutes || result.duration_minutes || 0)} phút</span></p>
                </div>
                <div className="space-y-2">
                  <p><span className="font-medium text-gray-700">Loại xe:</span> <span className="text-indigo-600">{vehicleTypes[vehicleType]?.name}</span></p>
                  <p><span className="font-medium text-gray-700">Số khách:</span> <span className="text-green-600">{bookingData.passenger_count} người</span></p>
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded-lg mt-3">
                    <p className="text-center">
                      <span className="text-lg font-medium text-gray-700">Tổng chi phí:</span>
                    </p>
                    <p className="text-center text-2xl font-bold text-green-600">
                      {(adjustedResult?.calculated_price || result.data?.final_price || result.final_price || result.calculated_price || 0)?.toLocaleString('vi-VN')} VNĐ
                    </p>
                    <p className="text-center text-xs text-gray-500 mt-1">
                      * Giá ước tính, sẽ được xác nhận lại
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={bookingData.customer_name}
                  onChange={handleBookingInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={bookingData.customer_phone}
                  onChange={handleBookingInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0901234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (tùy chọn)
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={bookingData.customer_email}
                  onChange={handleBookingInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày đi *
                </label>
                <input
                  type="date"
                  name="travel_date"
                  value={bookingData.travel_date}
                  onChange={handleBookingInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ đi *
                </label>
                <input
                  type="time"
                  name="travel_time"
                  value={bookingData.travel_time}
                  onChange={handleBookingInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số hành khách
                </label>
                <select
                  name="passenger_count"
                  value={bookingData.passenger_count}
                  onChange={handleBookingInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(num => (
                    <option key={num} value={num}>{num} khách</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú đặc biệt
              </label>
              <textarea
                name="notes"
                value={bookingData.notes}
                onChange={handleBookingInputChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Cần xe có WiFi, ghế trẻ em, điểm đón đặc biệt..."
              />
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

      {/* Hướng dẫn sử dụng */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">💡 Hướng dẫn sử dụng:</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li><strong>🏠 Chọn địa chỉ:</strong> Chọn theo tỉnh/huyện/xã sau đó nhập địa chỉ cụ thể (khuyến nghị)</li>
          <li><strong>🗺️ Chọn trên bản đồ:</strong> Click để chọn điểm chính xác trên Google Maps</li>
          <li><strong>🚙 Chọn loại xe:</strong> Xe 4 chỗ, 7 chỗ, hoặc 16 chỗ với giá khác nhau</li>
          <li><strong>📞 Đặt chuyến:</strong> Sau khi tính giá, điền thông tin để đặt chuyến ngay</li>
          <li><strong>🎯 Dữ liệu mẫu:</strong> Click "Điền dữ liệu mẫu" để test nhanh tính năng</li>
        </ul>
      </div>
    </div>
  );
};

export default PriceCalculator;