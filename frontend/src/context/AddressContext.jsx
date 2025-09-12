import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AddressContext = createContext();

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

export const AddressProvider = ({ children }) => {
  const [provinces, setProvinces] = useState([]);
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [provincesError, setProvincesError] = useState(null);

  // Cache cho districts và wards
  const [districtsCache, setDistrictsCache] = useState({});
  const [wardsCache, setWardsCache] = useState({});

  const loadProvinces = async () => {
    if (provinces.length > 0) return; // Đã load rồi thì không load lại
    
    try {
      setProvincesLoading(true);
      setProvincesError(null);
      const response = await apiService.getProvinces();
      setProvinces(response.data.provinces || []);
      console.log('✅ Provinces loaded:', response.data.provinces?.length || 0);
    } catch (error) {
      console.error('❌ Lỗi load provinces:', error);
      setProvincesError(error.message);
    } finally {
      setProvincesLoading(false);
    }
  };

  const loadDistricts = async (provinceCode) => {
    // Kiểm tra cache trước
    if (districtsCache[provinceCode]) {
      return districtsCache[provinceCode];
    }

    try {
      const response = await apiService.getDistricts(provinceCode);
      const districts = response.data.districts || [];
      
      // Lưu vào cache
      setDistrictsCache(prev => ({
        ...prev,
        [provinceCode]: districts
      }));
      
      return districts;
    } catch (error) {
      console.error('❌ Lỗi load districts:', error);
      return [];
    }
  };

  const loadWards = async (districtCode) => {
    // Kiểm tra cache trước
    if (wardsCache[districtCode]) {
      return wardsCache[districtCode];
    }

    try {
      const response = await apiService.getWards(districtCode);
      const wards = response.data.wards || [];
      
      // Lưu vào cache
      setWardsCache(prev => ({
        ...prev,
        [districtCode]: wards
      }));
      
      return wards;
    } catch (error) {
      console.error('❌ Lỗi load wards:', error);
      return [];
    }
  };

  // Load provinces khi component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const value = {
    provinces,
    provincesLoading,
    provincesError,
    loadProvinces,
    loadDistricts,
    loadWards,
    // Expose cache để components có thể sử dụng
    districtsCache,
    wardsCache
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};

export default AddressContext;
