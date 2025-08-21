import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const BookingForm = ({ selectedLocations, priceResult, onBookingSuccess }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    travel_date: '',
    travel_time: '',
    passenger_count: 1,
    vehicle_type: '4_seats',
    notes: ''
  });
  
  const [vehicleTypes, setVehicleTypes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadVehicleTypes();
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({
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
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!selectedLocations.from || !selectedLocations.to) {
      setError('Vui lòng chọn điểm đi và điểm đến trước khi đặt chuyến');
      setLoading(false);
      return;
    }

    try {
      const bookingData = {
        ...formData,
        from_lat: selectedLocations.from.lat,
        from_lng: selectedLocations.from.lng,
        to_lat: selectedLocations.to.lat,
        to_lng: selectedLocations.to.lng,
        from_address: selectedLocations.from.address,
        to_address: selectedLocations.to.address,
        passenger_count: parseInt(formData.passenger_count)
      };

      const response = await apiService.createBooking(bookingData);
      
      setSuccess('🎉 Đặt chuyến thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      
      if (onBookingSuccess) {
        onBookingSuccess(response.data);
      }

      // Reset form
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        travel_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        travel_time: '',
        passenger_count: 1,
        vehicle_type: '4_seats',
        notes: ''
      });

    } catch (err) {
      setError('Có lỗi xảy ra khi đặt chuyến: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const calculatePriceWithVehicle = () => {
    if (!priceResult || !vehicleTypes[formData.vehicle_type]) {
      return priceResult;
    }

    const multiplier = vehicleTypes[formData.vehicle_type].price_multiplier;
    return {
      ...priceResult,
      calculated_price: Math.round(priceResult.calculated_price * multiplier)
    };
  };

  const finalPrice = calculatePriceWithVehicle();

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border form-compact">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📋 Thông tin đặt chuyến
      </h2>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Trip Summary */}
      {selectedLocations.from && selectedLocations.to && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">📍 Thông tin chuyến đi</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Từ:</strong> {selectedLocations.from.address}</p>
            <p><strong>Đến:</strong> {selectedLocations.to.address}</p>
            {priceResult && (
              <>
                <p><strong>Khoảng cách:</strong> {priceResult.distance_km} km</p>
                <p><strong>Thời gian ước tính:</strong> {priceResult.duration_minutes} phút</p>
              </>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">👤 Thông tin khách hàng</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                value={formData.customer_phone}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                value={formData.customer_email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">🚗 Chi tiết chuyến đi</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày đi
              </label>
              <input
                type="date"
                name="travel_date"
                value={formData.travel_date}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ đi (dự kiến)
              </label>
              <input
                type="time"
                name="travel_time"
                value={formData.travel_time}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số hành khách
              </label>
              <select
                name="passenger_count"
                value={formData.passenger_count}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(num => (
                  <option key={num} value={num}>{num} khách</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại xe
              </label>
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(vehicleTypes).map(([key, vehicle]) => (
                  <option key={key} value={key}>
                    {vehicle.name} - {vehicle.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú đặc biệt
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Cần xe có WiFi, cần ghế trẻ em, điểm đón đặc biệt..."
              />
            </div>
          </div>
        </div>

        {/* Price Summary */}
        {finalPrice && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">💰 Tóm tắt giá cước</h3>
            <div className="space-y-2 text-sm text-green-700">
              <div className="flex justify-between">
                <span>Giá cơ bản:</span>
                <span>{finalPrice.breakdown?.base_price?.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between">
                <span>Khoảng cách ({finalPrice.distance_km} km):</span>
                <span>{(finalPrice.distance_km * finalPrice.breakdown?.price_per_km)?.toLocaleString('vi-VN')} VNĐ</span>
              </div>
              {vehicleTypes[formData.vehicle_type]?.price_multiplier !== 1.0 && (
                <div className="flex justify-between">
                  <span>Phụ phí xe {vehicleTypes[formData.vehicle_type]?.name}:</span>
                  <span>×{vehicleTypes[formData.vehicle_type]?.price_multiplier}</span>
                </div>
              )}
              <hr className="border-green-300" />
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span className="text-green-600">{finalPrice.calculated_price?.toLocaleString('vi-VN')} VNĐ</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading || !selectedLocations.from || !selectedLocations.to}
            className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
          >
            {loading ? '⏳ Đang đặt chuyến...' : '🚗 Đặt chuyến ngay'}
          </button>
          
          <p className="text-sm text-gray-500 mt-2">
            * Giá trên là ước tính. Giá cuối cùng sẽ được xác nhận khi liên hệ.
          </p>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;