import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CompactAddressSelector = ({ 
  onAddressSelect, 
  disabled = false,
  apiKey = null 
}) => {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [specificAddress, setSpecificAddress] = useState('');
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [currentStep, setCurrentStep] = useState('province'); // 'province', 'district', 'ward', 'address'
  
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Load provinces khi component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Update filtered options khi search term thay đổi
  useEffect(() => {
    if (searchTerm.length >= 1) {
      let options = [];
      
      if (currentStep === 'province') {
        options = provinces.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.full_name && p.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      } else if (currentStep === 'district') {
        options = districts.filter(d => 
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (d.full_name && d.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      } else if (currentStep === 'ward') {
        options = wards.filter(w => 
          w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (w.full_name && w.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      setFilteredOptions(options.slice(0, 20));
      setShowDropdown(options.length > 0);
    } else {
      setFilteredOptions([]);
      setShowDropdown(false);
    }
  }, [searchTerm, provinces, districts, wards, currentStep]);

  const loadProvinces = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/address/provinces`);
      setProvinces(response.data.provinces || []);
    } catch (error) {
      console.error('❌ Lỗi load provinces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async (provinceCode) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/address/districts/${provinceCode}`);
      setDistricts(response.data.districts || []);
    } catch (error) {
      console.error('❌ Lỗi load districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWards = async (districtCode) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/address/wards/${districtCode}`);
      setWards(response.data.wards || []);
    } catch (error) {
      console.error('❌ Lỗi load wards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceSelect = (province) => {
    setSelectedProvince(province);
    setSearchTerm(province.full_name || province.name);
    setShowDropdown(false);
    setCurrentStep('district');
    
    // Reset districts và wards
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
    
    // Load districts cho tỉnh được chọn
    loadDistricts(province.code);
    
    // Clear search để chuẩn bị cho bước tiếp theo
    setTimeout(() => {
      setSearchTerm('');
    }, 100);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setSearchTerm(district.full_name || district.name);
    setShowDropdown(false);
    setCurrentStep('ward');
    
    // Reset wards
    setSelectedWard(null);
    setWards([]);
    
    // Load wards cho district được chọn
    loadWards(district.code);
    
    // Clear search để chuẩn bị cho bước tiếp theo
    setTimeout(() => {
      setSearchTerm('');
    }, 100);
  };

  const handleWardSelect = (ward) => {
    setSelectedWard(ward);
    setSearchTerm(ward.full_name || ward.name);
    setShowDropdown(false);
    setCurrentStep('address');
    
    // Clear search để nhập địa chỉ cụ thể
    setTimeout(() => {
      setSearchTerm('');
    }, 100);
  };

  const handleOptionSelect = (option) => {
    if (currentStep === 'province') {
      handleProvinceSelect(option);
    } else if (currentStep === 'district') {
      handleDistrictSelect(option);
    } else if (currentStep === 'ward') {
      handleWardSelect(option);
    }
  };

  const buildFullAddress = async () => {
    if (!selectedProvince) return;

    let addressParts = [];
    
    // Thêm địa chỉ cụ thể nếu có
    if (specificAddress.trim()) {
      addressParts.push(specificAddress.trim());
    }
    
    // Thêm các cấp địa chỉ
    if (selectedWard) {
      addressParts.push(selectedWard.full_name || selectedWard.name);
    }
    if (selectedDistrict) {
      addressParts.push(selectedDistrict.full_name || selectedDistrict.name);
    }
    if (selectedProvince) {
      addressParts.push(selectedProvince.full_name || selectedProvince.name);
    }
    
    const fullAddress = addressParts.join(', ');

    // Nếu có địa chỉ đầy đủ và API key, thực hiện geocoding
    if (fullAddress && apiKey && window.google) {
      geocodeAddress(fullAddress);
    } else if (fullAddress) {
      // Không có API key hoặc Google Maps chưa load
      if (onAddressSelect) {
        onAddressSelect({
          lat: null,
          lng: null,
          address: fullAddress,
          formatted_address: fullAddress,
          place_id: null,
          geocoding_failed: !apiKey || !window.google
        });
      }
    }
  };

  const geocodeAddress = async (address) => {
    try {
      setGeocoding(true);

      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode(
        { 
          address: address,
          componentRestrictions: { country: 'VN' }
        },
        (results, status) => {
          setGeocoding(false);
          
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const coords = {
              lat: location.lat(),
              lng: location.lng(),
              address: address,
              formatted_address: results[0].formatted_address,
              place_id: results[0].place_id
            };

            console.log('✅ Geocoding thành công:', coords);
            
            if (onAddressSelect) {
              onAddressSelect(coords);
            }
          } else {
            console.error('❌ Geocoding failed:', status);
            
            if (onAddressSelect) {
              onAddressSelect({
                lat: null,
                lng: null,
                address: address,
                formatted_address: address,
                place_id: null,
                geocoding_failed: true
              });
            }
          }
        }
      );

    } catch (error) {
      setGeocoding(false);
      console.error('❌ Lỗi geocoding:', error);
    }
  };

  const handleUseThisAddress = () => {
    if (selectedProvince) {
      buildFullAddress();
    }
  };

  const clearAll = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setSpecificAddress('');
    setSearchTerm('');
    setCurrentStep('province');
    setShowDropdown(false);
    setDistricts([]);
    setWards([]);
    
    if (onAddressSelect) {
      onAddressSelect(null);
    }
  };

  const goBackStep = () => {
    if (currentStep === 'address') {
      setCurrentStep('ward');
      setSearchTerm('');
    } else if (currentStep === 'ward') {
      setCurrentStep('district');
      setSelectedWard(null);
      setWards([]);
      setSearchTerm('');
    } else if (currentStep === 'district') {
      setCurrentStep('province');
      setSelectedDistrict(null);
      setDistricts([]);
      setSearchTerm('');
    }
  };

  const getCurrentPlaceholder = () => {
    switch (currentStep) {
      case 'province': return 'Tìm tỉnh/thành phố...';
      case 'district': return 'Tìm quận/huyện...';
      case 'ward': return 'Tìm phường/xã...';
      case 'address': return 'Nhập số nhà, tên đường...';
      default: return 'Tìm kiếm...';
    }
  };

  const getCurrentStepName = () => {
    switch (currentStep) {
      case 'province': return 'Bước 1: Chọn Tỉnh/Thành phố';
      case 'district': return 'Bước 2: Chọn Quận/Huyện';
      case 'ward': return 'Bước 3: Chọn Phường/Xã';
      case 'address': return 'Bước 4: Nhập địa chỉ cụ thể';
      default: return '';
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 'province': return '🏛️';
      case 'district': return '🏘️';
      case 'ward': return '🏠';
      case 'address': return '📍';
      default: return '📍';
    }
  };

  return (
    <div className="space-y-3">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStepIcon()}</span>
          <span className="text-sm font-medium text-gray-700">{getCurrentStepName()}</span>
        </div>
        {currentStep !== 'province' && (
          <button
            onClick={goBackStep}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            ← Quay lại
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: currentStep === 'province' ? '25%' : 
                   currentStep === 'district' ? '50%' : 
                   currentStep === 'ward' ? '75%' : '100%'
          }}
        ></div>
      </div>

      {/* Selected items display */}
      {selectedProvince && (
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            🏛️ {selectedProvince.full_name || selectedProvince.name}
          </span>
          {selectedDistrict && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              🏘️ {selectedDistrict.full_name || selectedDistrict.name}
            </span>
          )}
          {selectedWard && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
              🏠 {selectedWard.full_name || selectedWard.name}
            </span>
          )}
        </div>
      )}

      {/* Search Input */}
      {currentStep !== 'address' ? (
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length >= 1 && setShowDropdown(true)}
            placeholder={getCurrentPlaceholder()}
            disabled={disabled || loading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 pr-10"
          />
          
          {/* Search Icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              '🔍'
            )}
          </div>

          {/* Dropdown Results */}
          {showDropdown && filteredOptions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {filteredOptions.map((option, index) => (
                <div
                  key={`${option.code}`}
                  onClick={() => handleOptionSelect(option)}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{getStepIcon()}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {option.full_name || option.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {showDropdown && searchTerm.length >= 1 && filteredOptions.length === 0 && !loading && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
              <div className="text-sm text-gray-500 text-center">
                Không tìm thấy kết quả cho "{searchTerm}"
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Address input for final step */
        <input
          type="text"
          value={specificAddress}
          onChange={(e) => setSpecificAddress(e.target.value)}
          placeholder={getCurrentPlaceholder()}
          disabled={disabled}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
        />
      )}

      {/* Geocoding indicator */}
      {geocoding && (
        <div className="flex items-center text-blue-600 text-sm">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
          <span>Đang tìm tọa độ chính xác...</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleUseThisAddress}
          disabled={!selectedProvince || geocoding}
          className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          ✓ Chọn địa chỉ này
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors"
        >
          Làm lại
        </button>
      </div>

      {/* Helper text */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        💡 <strong>Hướng dẫn:</strong> Chọn từng bước Tỉnh → Quận/Huyện → Phường/Xã → Địa chỉ cụ thể. 
        Bạn có thể gõ để tìm kiếm nhanh tại mỗi bước.
      </div>
    </div>
  );
};

export default CompactAddressSelector;