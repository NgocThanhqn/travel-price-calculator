import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import MapSelector from './MapSelector';
import CompactAddressSelector from './CompactAddressSelector';
import googleMapsLoader from '../utils/googleMapsLoader';

const PriceCalculator = () => {
  const [mapsReady, setMapsReady] = useState(false);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsError, setMapsError] = useState('');
  const [showMapsReady, setShowMapsReady] = useState(false);

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
  const [fromAddressCollapsed, setFromAddressCollapsed] = useState(false);
  const [toAddressCollapsed, setToAddressCollapsed] = useState(false);
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

  // THÊM STATE MỚI để lưu thông tin vé:
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
        setShowMapsReady(true);
        console.log('✅ Google Maps ready for geocoding in PriceCalculator');
        
        // Ẩn thông báo "Google Maps sẵn sàng" sau 1 giây
        setTimeout(() => {
          setShowMapsReady(false);
        }, 1000);
        
      } catch (error) {
        setMapsError(error.message);
        console.error('❌ Maps initialization failed:', error);
      } finally {
        setMapsLoading(false);
      }
    };

    initializeMaps();
  }, []);

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
          "price_multiplier": 1.17,
          "max_passengers": 7
        },
        "16_seats": {
          "name": "Xe 16 chỗ",
          "description": "Phù hợp cho 7-15 khách", 
          "price_multiplier": 1.65,
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
      setFromAddressCollapsed(true);
    } else if (selectingMode === 'to') {
      setToCoords({ lat: location.lat.toString(), lng: location.lng.toString() });
      setToAddress(location.address);
      setSelectedLocations(prev => ({ ...prev, to: location }));
      setToAddressCollapsed(true);
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
      setFromAddressCollapsed(true);
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
      setToAddressCollapsed(true);
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
    
    // Thử nhiều cách để lấy giá cơ bản - THÊM SUPPORT CHO TIER PRICING
    const basePrice = result.data?.total_price ||       // Tier pricing
                     result.data?.calculated_price ||   // Simple pricing 
                     result.data?.final_price ||        
                     result.total_price ||              // Direct tier response
                     result.calculated_price ||
                     result.final_price || 
                     result.base_price || 
                     0;
    
    const multiplier = vehicleTypes[vehicleType].price_multiplier || 1;
    const adjustedPrice = Math.round(basePrice * multiplier);
    
    return {
      calculated_price: adjustedPrice,
      original_price: basePrice,
      vehicle_multiplier: multiplier
    };
  };

  const getDisplayPrice = () => {
    // Kiểm tra nếu là tier pricing (có total_price)
    if (result?.total_price || result?.data?.total_price) {
      const tierPrice = result?.total_price || result?.data?.total_price || 0;
      const multiplier = vehicleTypes[vehicleType]?.price_multiplier || 1.0;
      return Math.round(tierPrice * multiplier);
    }
    
    // Fallback cho simple pricing
    const adjustedResult = getAdjustedPrice();
    return adjustedResult?.calculated_price || 0;
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
      // Lấy giá đã tính từ form (đã bao gồm vehicle multiplier)
      const finalCalculatedPrice = getDisplayPrice();
      
      // Lấy thông tin distance và duration từ result
      const distance = result?.data?.distance_km || result?.distance_km || 0;
      const duration = result?.data?.duration_minutes || result?.duration_minutes || 0;

      const bookingPayload = {
        ...bookingData,
        from_lat: parseFloat(fromCoords.lat),
        from_lng: parseFloat(fromCoords.lng),
        to_lat: parseFloat(toCoords.lat),
        to_lng: parseFloat(toCoords.lng),
        from_address: fromAddress,
        to_address: toAddress,
        vehicle_type: vehicleType,
        passenger_count: parseInt(bookingData.passenger_count),
        calculated_price: finalCalculatedPrice,
        distance_km: distance,
        duration_minutes: duration,
        price_breakdown: result?.data || result
      };

      const response = await apiService.createBooking(bookingPayload);
      
      setTicketInfo({
        booking_id: response.data.id || Math.random().toString(36).substr(2, 9),
        customer_name: bookingData.customer_name,
        customer_phone: bookingData.customer_phone,
        from_address: fromAddress,
        to_address: toAddress,
        distance_km: distance,
        final_price: finalCalculatedPrice,
        vehicle_type: vehicleTypes[vehicleType]?.name || vehicleType,
        travel_date: bookingData.travel_date,
        travel_time: bookingData.travel_time,
        passenger_count: bookingData.passenger_count,
        booking_status: 'confirmed'
      });
      
      setBookingSuccess('🎉 Đặt xe thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      setShowBookingForm(false);
      
    } catch (err) {
      setError('❌ Lỗi đặt xe: ' + (err.response?.data?.detail || err.message));
    } finally {
      setBookingLoading(false);
    }
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

    // Clear address selectors - thêm dòng này để reset về bước đầu tiên
    setShowFromAddressSelector(false);
    setShowToAddressSelector(false);
    setFromAddressCollapsed(false);
    setToAddressCollapsed(false);

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

  // If showing map selector
  if (showMap) {
    return (
      <div className="max-w-6xl mx-auto p-2 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg md:text-2xl font-bold text-gray-800">
            🗺️ Chọn {selectingMode === 'from' ? 'điểm đi' : 'điểm đến'} trên bản đồ
          </h2>
          <button
            onClick={() => {
              setShowMap(false);
              // Auto-collapse the selected address after map selection
              if (selectingMode === 'from' && fromAddress) {
                setFromAddressCollapsed(true);
              } else if (selectingMode === 'to' && toAddress) {
                setToAddressCollapsed(true);
              }
            }}
            className="px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
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
            onClick={() => {
              setShowMap(false);
              // Auto-collapse the selected address after map selection
              if (selectingMode === 'from' && fromAddress) {
                setFromAddressCollapsed(true);
              } else if (selectingMode === 'to' && toAddress) {
                setToAddressCollapsed(true);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Xong - Quay lại tính giá
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={formRef} className="form-compact">
      {/* Desktop: Two column layout */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-8 md:max-w-6xl md:mx-auto">
        {/* Left Column: Address Form */}
        <div className="bg-white shadow-lg rounded-lg p-4">
      {/* Title - Responsive */}
      <h1 className="text-lg md:text-2xl font-bold text-center mb-3 md:mb-4 text-gray-800">
        Tính Giá Chuyến Đi
      </h1>
      
      {/* Maps Status - Compact */}
      {mapsLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            <p className="text-blue-700 text-xs">
              🗺️ Đang khởi tạo Google Maps...
            </p>
          </div>
        </div>
      )}
      
      {showMapsReady && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
          <p className="text-green-700 text-xs">
            ✅ Google Maps đã sẵn sàng!
          </p>
        </div>
      )}
      
      {mapsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
          <p className="text-red-700 text-xs">
            ❌ Lỗi khởi tạo Maps: {mapsError}
          </p>
        </div>
      )}
      
      {/* Input Form - Compact Grid */}
      <div className="grid grid-cols-1 gap-2 mb-3">
        {/* Điểm đi */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm md:text-base font-semibold text-gray-700">📍 Điểm đi</h3>
            <button
              onClick={() => openMapSelector('from')}
              className="p-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors"
              title="Chọn trên bản đồ"
            >
              🗺️
            </button>
          </div>

          {!fromAddressCollapsed && (
            <CompactAddressSelector
              onAddressSelect={handleFromAddressSelect}
              apiKey={apiKey}
              key={`from-${fromAddress}-${Date.now()}`}
            />
          )}

          {/* Display selected address if any */}
          {fromAddress && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-green-800">
                  Địa chỉ đã chọn:
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFromAddressCollapsed(!fromAddressCollapsed)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    title={fromAddressCollapsed ? "Mở rộng" : "Thu gọn"}
                  >
                    {fromAddressCollapsed ? '📝' : '📁'}
                  </button>
                  <button
                    onClick={() => {
                      setFromAddress('');
                      setFromCoords({ lat: '', lng: '' });
                      setSelectedLocations(prev => ({ ...prev, from: null }));
                      setFromAddressCollapsed(false);
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              
              {fromAddressCollapsed ? (
                <div className="text-sm text-green-700 font-medium truncate">
                  {fromAddress}
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.target.value)}
                    className="w-full p-2 border border-green-300 rounded text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Địa chỉ điểm đi"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-green-600">
                      {fromCoords.lat && fromCoords.lng ?
                        `📍 ${parseFloat(fromCoords.lat).toFixed(4)}, ${parseFloat(fromCoords.lng).toFixed(4)}` : 
                        '⚠️ Chưa có tọa độ chính xác'
                      }
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Điểm đến */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm md:text-base font-semibold text-gray-700">🎯 Điểm đến</h3>
            <button
              onClick={() => openMapSelector('to')}
              className="p-2 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors"
              title="Chọn trên bản đồ"
            >
              🗺️
            </button>
          </div>

          {!toAddressCollapsed && (
            <CompactAddressSelector
              onAddressSelect={handleToAddressSelect}
              apiKey={apiKey}
              key={`to-${toAddress}-${Date.now()}`}
            />
          )}

          {/* Display selected address if any */}
          {toAddress && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-red-800">
                  Địa chỉ đã chọn:
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setToAddressCollapsed(!toAddressCollapsed)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    title={toAddressCollapsed ? "Mở rộng" : "Thu gọn"}
                  >
                    {toAddressCollapsed ? '📝' : '📁'}
                  </button>
                  <button
                    onClick={() => {
                      setToAddress('');
                      setToCoords({ lat: '', lng: '' });
                      setSelectedLocations(prev => ({ ...prev, to: null }));
                      setToAddressCollapsed(false);
                    }}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              
              {toAddressCollapsed ? (
                <div className="text-sm text-red-700 font-medium truncate">
                  {toAddress}
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="w-full p-2 border border-red-300 rounded text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Địa chỉ điểm đến"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-red-600">
                      {toCoords.lat && toCoords.lng ?
                        `📍 ${parseFloat(toCoords.lat).toFixed(4)}, ${parseFloat(toCoords.lng).toFixed(4)}` : 
                        '⚠️ Chưa có tọa độ chính xác'
                      }
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Type Selection - Compact */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🚙 Loại xe
        </label>
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {Object.entries(vehicleTypes).map(([key, vehicle]) => (
            <option key={key} value={key}>
              {vehicle.name} - {vehicle.description} (×{vehicle.price_multiplier})
            </option>
          ))}
        </select>
      </div>

      {/* Buttons - Compact */}
      <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-3 mb-3">
        <button
          onClick={fillSampleData}
          className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 font-medium"
        >
          Điền dữ liệu mẫu
        </button>
        
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Đang tính toán...
            </div>
          ) : (
            '🧮 Tính Giá Chuyến Đi'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}

      {/* Success Message */}
      {bookingSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-700 text-sm font-medium">{bookingSuccess}</p>
        </div>
      )}

        {/* Results Display - Only show below address form on desktop */}
        {result && !ticketInfo && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4 shadow-md">
            <div className="text-center mb-4">
              <div className="text-2xl md:text-3xl font-bold text-green-600">
                {getDisplayPrice().toLocaleString()} VNĐ
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Giá cuối cùng cho chuyến đi
              </div>
            </div>

            {/* Trip Details - Compact grid */}
            <div className="grid grid-cols-2 gap-2 text-xs md:text-sm mb-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Quãng đường:</span>
                  <span className="font-medium">{result.data?.distance_km || result.distance_km} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian:</span>
                  <span className="font-medium">{result.data?.duration_minutes || result.duration_minutes || 'N/A'} phút</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Loại xe:</span>
                  <span className="font-medium">{vehicleTypes[vehicleType]?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hệ số:</span>
                  <span className="font-medium">×{vehicleTypes[vehicleType]?.price_multiplier}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!showBookingForm && (
              <div className="text-center">
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  📞 Đặt Xe Ngay
                </button>
              </div>
            )}
          </div>
        )}

        </div>
        
        {/* Right Column: Booking Form Only */}
        <div className="space-y-4">

          {/* Booking Form - Compact */}
          {showBookingForm && result && !ticketInfo && (
            <div className="bg-white border rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">📝 Thông Tin Đặt Xe</h3>
          
          <form onSubmit={handleBookingSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách hàng *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  required
                  value={bookingData.customer_name}
                  onChange={handleBookingInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  required
                  value={bookingData.customer_phone}
                  onChange={handleBookingInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="customer_email"
                value={bookingData.customer_email}
                onChange={handleBookingInputChange}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Email (tùy chọn)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày đi *
                </label>
                <input
                  type="date"
                  name="travel_date"
                  required
                  value={bookingData.travel_date}
                  onChange={handleBookingInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giờ đi
                </label>
                <input
                  type="time"
                  name="travel_time"
                  value={bookingData.travel_time}
                  onChange={handleBookingInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số hành khách
              </label>
              <input
                type="number"
                name="passenger_count"
                min="1"
                max="50"
                value={bookingData.passenger_count}
                onChange={handleBookingInputChange}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                name="notes"
                rows="2"
                value={bookingData.notes}
                onChange={handleBookingInputChange}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú thêm (tùy chọn)"
              />
            </div>

            {/* Trip Summary */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Tóm tắt chuyến đi:</h4>
              <div className="text-xs space-y-1">
                <div>📍 Từ: {fromAddress}</div>
                <div>🎯 Đến: {toAddress}</div>
                <div>📏 {result.data?.distance_km || result.distance_km}km • {result.data?.duration_text || result.duration_text}</div>
                <div className="font-semibold text-green-600">
                  💰 {getDisplayPrice().toLocaleString()} VNĐ
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={bookingLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {bookingLoading ? 'Đang xử lý...' : 'Xác Nhận Đặt'}
              </button>
              </div>
            </form>
          </div>
          )}

          {/* Ticket Info Display */}
          {ticketInfo && (
            <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-lg p-4 shadow-lg">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-green-800">🎫 Vé Đặt Xe Thành Công</h3>
                <p className="text-sm text-green-600">Mã đặt xe: <span className="font-mono font-bold">{ticketInfo.booking_id}</span></p>
              </div>
              
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="space-y-2">
                  <div><strong>Khách hàng:</strong> {ticketInfo.customer_name}</div>
                  <div><strong>Điện thoại:</strong> {ticketInfo.customer_phone}</div>
                  <div><strong>Từ:</strong> {ticketInfo.from_address}</div>
                  <div><strong>Đến:</strong> {ticketInfo.to_address}</div>
                  <div><strong>Ngày đi:</strong> {ticketInfo.travel_date}</div>
                  <div><strong>Giờ đi:</strong> {ticketInfo.travel_time}</div>
                  <div><strong>Loại xe:</strong> {ticketInfo.vehicle_type}</div>
                  <div><strong>Số khách:</strong> {ticketInfo.passenger_count} người</div>
                </div>
              </div>
              
              <div className="text-center mt-4 p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  💰 {ticketInfo.final_price.toLocaleString()} VNĐ
                </div>
                <div className="text-sm text-gray-600">
                  Quãng đường: {ticketInfo.distance_km} km
                </div>
              </div>
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={handleNewBooking}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  🔄 Đặt Chuyến Mới
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  🖨️ In Vé
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Single column layout */}
      <div className="md:hidden max-w-3xl mx-auto p-3 bg-white shadow-lg rounded-lg">
        {/* Title - Responsive */}
        <h1 className="text-lg md:text-2xl font-bold text-center mb-3 md:mb-4 text-gray-800">
          Tính Giá Chuyến Đi
        </h1>
        
        {/* Maps Status - Compact */}
        {mapsLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
              <p className="text-blue-700 text-xs">
                🗺️ Đang khởi tạo Google Maps...
              </p>
            </div>
          </div>
        )}
        
        {showMapsReady && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
            <p className="text-green-700 text-xs">
              ✅ Google Maps đã sẵn sàng!
            </p>
          </div>
        )}
        
        {mapsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
            <p className="text-red-700 text-xs">
              ❌ Lỗi khởi tạo Maps: {mapsError}
            </p>
          </div>
        )}
        
        {/* Input Form - Compact Grid */}
        <div className="grid grid-cols-1 gap-2 mb-3">
          {/* Điểm đi */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-semibold text-gray-700">📍 Điểm đi</h3>
              <button
                onClick={() => openMapSelector('from')}
                className="p-2 bg-blue-500 text-white text-sm rounded-full hover:bg-blue-600 transition-colors"
                title="Chọn trên bản đồ"
              >
                🗺️
              </button>
            </div>

            {!fromAddressCollapsed && (
              <CompactAddressSelector
                onAddressSelect={handleFromAddressSelect}
                apiKey={apiKey}
                key={`from-${fromAddress}-${Date.now()}`}
              />
            )}

            {/* Display selected address if any */}
            {fromAddress && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-green-800">
                    Địa chỉ đã chọn:
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFromAddressCollapsed(!fromAddressCollapsed)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      title={fromAddressCollapsed ? "Mở rộng" : "Thu gọn"}
                    >
                      {fromAddressCollapsed ? '📝' : '📁'}
                    </button>
                    <button
                      onClick={() => {
                        setFromAddress('');
                        setFromCoords({ lat: '', lng: '' });
                        setSelectedLocations(prev => ({ ...prev, from: null }));
                        setFromAddressCollapsed(false);
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                
                {fromAddressCollapsed ? (
                  <div className="text-sm text-green-700 font-medium truncate">
                    {fromAddress}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={fromAddress}
                      onChange={(e) => setFromAddress(e.target.value)}
                      className="w-full p-2 border border-green-300 rounded text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Địa chỉ điểm đi"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-green-600">
                        {fromCoords.lat && fromCoords.lng ?
                          `📍 ${parseFloat(fromCoords.lat).toFixed(4)}, ${parseFloat(fromCoords.lng).toFixed(4)}` : 
                          '⚠️ Chưa có tọa độ chính xác'
                        }
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Điểm đến */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-semibold text-gray-700">🎯 Điểm đến</h3>
              <button
                onClick={() => openMapSelector('to')}
                className="p-2 bg-red-500 text-white text-sm rounded-full hover:bg-red-600 transition-colors"
                title="Chọn trên bản đồ"
              >
                🗺️
              </button>
            </div>

            {!toAddressCollapsed && (
              <CompactAddressSelector
                onAddressSelect={handleToAddressSelect}
                apiKey={apiKey}
                key={`to-${toAddress}-${Date.now()}`}
              />
            )}

            {/* Display selected address if any */}
            {toAddress && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-red-800">
                    Địa chỉ đã chọn:
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setToAddressCollapsed(!toAddressCollapsed)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      title={toAddressCollapsed ? "Mở rộng" : "Thu gọn"}
                    >
                      {toAddressCollapsed ? '📝' : '📁'}
                    </button>
                    <button
                      onClick={() => {
                        setToAddress('');
                        setToCoords({ lat: '', lng: '' });
                        setSelectedLocations(prev => ({ ...prev, to: null }));
                        setToAddressCollapsed(false);
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                
                {toAddressCollapsed ? (
                  <div className="text-sm text-red-700 font-medium truncate">
                    {toAddress}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={toAddress}
                      onChange={(e) => setToAddress(e.target.value)}
                      className="w-full p-2 border border-red-300 rounded text-sm bg-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Địa chỉ điểm đến"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-red-600">
                        {toCoords.lat && toCoords.lng ?
                          `📍 ${parseFloat(toCoords.lat).toFixed(4)}, ${parseFloat(toCoords.lng).toFixed(4)}` : 
                          '⚠️ Chưa có tọa độ chính xác'
                        }
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Type Selection - Compact */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🚙 Loại xe
          </label>
          <select
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(vehicleTypes).map(([key, vehicle]) => (
              <option key={key} value={key}>
                {vehicle.name} - {vehicle.description} (×{vehicle.price_multiplier})
              </option>
            ))}
          </select>
        </div>

        {/* Buttons - Compact */}
        <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-3 mb-3">
          <button
            onClick={fillSampleData}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 font-medium"
          >
            Điền dữ liệu mẫu
          </button>
          
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tính toán...
              </div>
            ) : (
              '🧮 Tính Giá Chuyến Đi'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">❌ {error}</p>
          </div>
        )}

        {/* Success Message */}
        {bookingSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-700 text-sm font-medium">{bookingSuccess}</p>
          </div>
        )}

        {/* Results Display - Mobile */}
        {result && !ticketInfo && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4 shadow-md">
            <div className="text-center mb-4">
              <div className="text-2xl md:text-3xl font-bold text-green-600">
                {getDisplayPrice().toLocaleString()} VNĐ
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                Giá cuối cùng cho chuyến đi
              </div>
            </div>

            {/* Trip Details - Compact grid */}
            <div className="grid grid-cols-2 gap-2 text-xs md:text-sm mb-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Quãng đường:</span>
                  <span className="font-medium">{result.data?.distance_km || result.distance_km} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Thời gian:</span>
                  <span className="font-medium">{result.data?.duration_minutes || result.duration_minutes || 'N/A'} phút</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Loại xe:</span>
                  <span className="font-medium">{vehicleTypes[vehicleType]?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hệ số:</span>
                  <span className="font-medium">×{vehicleTypes[vehicleType]?.price_multiplier}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!showBookingForm && (
              <div className="text-center">
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  📞 Đặt Xe Ngay
                </button>
              </div>
            )}
          </div>
        )}

        {/* Booking Form - Mobile */}
        {showBookingForm && result && !ticketInfo && (
          <div className="bg-white border rounded-lg p-4 mb-4 shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">📝 Thông Tin Đặt Xe</h3>
            
            <form onSubmit={handleBookingSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    value={bookingData.customer_name}
                    onChange={handleBookingInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên của bạn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    name="customer_phone"
                    required
                    value={bookingData.customer_phone}
                    onChange={handleBookingInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={bookingData.customer_email}
                  onChange={handleBookingInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Email (tùy chọn)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày đi *
                  </label>
                  <input
                    type="date"
                    name="travel_date"
                    required
                    value={bookingData.travel_date}
                    onChange={handleBookingInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ đi
                  </label>
                  <input
                    type="time"
                    name="travel_time"
                    value={bookingData.travel_time}
                    onChange={handleBookingInputChange}
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số hành khách
                </label>
                <input
                  type="number"
                  name="passenger_count"
                  min="1"
                  max="50"
                  value={bookingData.passenger_count}
                  onChange={handleBookingInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  name="notes"
                  rows="2"
                  value={bookingData.notes}
                  onChange={handleBookingInputChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Ghi chú thêm (tùy chọn)"
                />
              </div>

              {/* Trip Summary */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Tóm tắt chuyến đi:</h4>
                <div className="text-xs space-y-1">
                  <div>📍 Từ: {fromAddress}</div>
                  <div>🎯 Đến: {toAddress}</div>
                  <div>📏 {result.data?.distance_km || result.distance_km}km • {result.data?.duration_text || result.duration_text}</div>
                  <div className="font-semibold text-green-600">
                    💰 {getDisplayPrice().toLocaleString()} VNĐ
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {bookingLoading ? 'Đang xử lý...' : 'Xác Nhận Đặt'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ticket Info Display */}
        {ticketInfo && (
          <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-lg p-4 mb-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-green-800">🎫 Vé Đặt Xe Thành Công</h3>
              <p className="text-sm text-green-600">Mã đặt xe: <span className="font-mono font-bold">{ticketInfo.booking_id}</span></p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div><strong>Khách hàng:</strong> {ticketInfo.customer_name}</div>
                <div><strong>Điện thoại:</strong> {ticketInfo.customer_phone}</div>
                <div><strong>Từ:</strong> {ticketInfo.from_address}</div>
                <div><strong>Đến:</strong> {ticketInfo.to_address}</div>
              </div>
              <div className="space-y-2">
                <div><strong>Ngày đi:</strong> {ticketInfo.travel_date}</div>
                <div><strong>Giờ đi:</strong> {ticketInfo.travel_time}</div>
                <div><strong>Loại xe:</strong> {ticketInfo.vehicle_type}</div>
                <div><strong>Số khách:</strong> {ticketInfo.passenger_count} người</div>
              </div>
            </div>
            
            <div className="text-center mt-4 p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                💰 {ticketInfo.final_price.toLocaleString()} VNĐ
              </div>
              <div className="text-sm text-gray-600">
                Quãng đường: {ticketInfo.distance_km} km
              </div>
            </div>
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleNewBooking}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                🔄 Đặt Chuyến Mới
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                🖨️ In Vé
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceCalculator;