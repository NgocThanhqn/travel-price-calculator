// frontend/src/components/FixedPriceManager.jsx

import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAddress } from '../context/AddressContext';

const FixedPriceManager = () => {
  // Sử dụng Address Context
  const { provinces, loadDistricts, loadWards } = useAddress();
  
  const [routes, setRoutes] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    from_province_id: '',
    from_district_id: '',
    from_ward_id: '',
    from_address_text: '',
    to_province_id: '',
    to_district_id: '',
    to_ward_id: '',
    to_address_text: '',
    fixed_price: '',
    description: ''
  });

  // Load data khi component mount
  useEffect(() => {
    loadRoutes();
    // Không cần loadProvinces nữa vì đã có trong context
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFixedPriceRoutes();
      setRoutes(response.data || []);
    } catch (err) {
      setError('Lỗi tải danh sách cấu hình: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Đã không cần loadProvinces nữa vì sử dụng context

  // loadDistricts và loadWards giờ đã được cung cấp từ context

  // Helper function để xây dựng tên địa chỉ hiển thị
  const buildAddressText = (wardId, districtId, provinceId, fieldPrefix) => {
    const parts = [];
    
    // Lấy thông tin ward
    if (wardId) {
      const wardArray = fieldPrefix === 'from' ? wards.from : wards.to;
      const selectedWard = wardArray?.find(w => w.id == wardId);
      if (selectedWard) {
        parts.push(selectedWard.name);
      }
    }
    
    // Lấy thông tin district
    if (districtId) {
      const districtArray = fieldPrefix === 'from' ? districts.from : districts.to;
      const selectedDistrict = districtArray?.find(d => d.id == districtId);
      if (selectedDistrict) {
        parts.push(selectedDistrict.name);
      }
    }
    
    // Lấy thông tin province
    if (provinceId) {
      const selectedProvince = provinces.find(p => p.id == provinceId);
      if (selectedProvince) {
        parts.push(selectedProvince.name);
      }
    }
    
    return parts.join(', ');
  };

  const handleProvinceChange = async (field, provinceId) => {
    const fieldPrefix = field === 'from_province_id' ? 'from' : 'to';
    const addressTextField = `${fieldPrefix}_address_text`;
    
    // Reset district và ward khi thay đổi province
    setFormData(prev => ({
      ...prev,
      [field]: provinceId,
      [`${field.replace('province', 'district')}`]: '',
      [`${field.replace('province', 'ward')}`]: '',
      // Tự động fill tên địa chỉ hiển thị với tên province
      [addressTextField]: provinceId ? 
        (provinces.find(p => p.id == provinceId)?.name || '') : ''
    }));

    if (provinceId) {
      // Tìm province được chọn để lấy code
      const selectedProvince = provinces.find(p => p.id == provinceId);
      if (selectedProvince) {
        const districtList = await loadDistricts(selectedProvince.code);
        if (field === 'from_province_id') {
          setDistricts(prev => ({ ...prev, from: districtList }));
        } else {
          setDistricts(prev => ({ ...prev, to: districtList }));
        }
      }
    } else {
      // Clear districts và wards khi không chọn province
      if (field === 'from_province_id') {
        setDistricts(prev => ({ ...prev, from: [] }));
        setWards(prev => ({ ...prev, from: [] }));
      } else {
        setDistricts(prev => ({ ...prev, to: [] }));
        setWards(prev => ({ ...prev, to: [] }));
      }
    }
  };

  const handleDistrictChange = async (field, districtId) => {
    const fieldPrefix = field === 'from_district_id' ? 'from' : 'to';
    const addressTextField = `${fieldPrefix}_address_text`;
    const provinceField = `${fieldPrefix}_province_id`;
    
    setFormData(prev => {
      const provinceId = prev[provinceField];
      
      // Xây dựng tên địa chỉ mới với district + province
      const newAddressText = buildAddressText(null, districtId, provinceId, fieldPrefix);
      
      return {
        ...prev,
        [field]: districtId,
        [`${field.replace('district', 'ward')}`]: '',
        // Cập nhật tên địa chỉ hiển thị
        [addressTextField]: newAddressText
      };
    });

    if (districtId) {
      // Tìm district được chọn để lấy code
      const districtArray = field === 'from_district_id' ? districts.from : districts.to;
      const selectedDistrict = districtArray?.find(d => d.id == districtId);
      if (selectedDistrict) {
        const wardList = await loadWards(selectedDistrict.code);
        if (field === 'from_district_id') {
          setWards(prev => ({ ...prev, from: wardList }));
        } else {
          setWards(prev => ({ ...prev, to: wardList }));
        }
      }
    } else {
      // Clear wards khi không chọn district
      if (field === 'from_district_id') {
        setWards(prev => ({ ...prev, from: [] }));
      } else {
        setWards(prev => ({ ...prev, to: [] }));
      }
    }
  };

  const handleWardChange = (field, wardId) => {
    const fieldPrefix = field === 'from_ward_id' ? 'from' : 'to';
    const addressTextField = `${fieldPrefix}_address_text`;
    const provinceField = `${fieldPrefix}_province_id`;
    const districtField = `${fieldPrefix}_district_id`;
    
    setFormData(prev => {
      const provinceId = prev[provinceField];
      const districtId = prev[districtField];
      
      // Xây dựng tên địa chỉ mới với ward + district + province
      const newAddressText = buildAddressText(wardId, districtId, provinceId, fieldPrefix);
      
      return {
        ...prev,
        [field]: wardId,
        // Cập nhật tên địa chỉ hiển thị
        [addressTextField]: newAddressText
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.from_province_id || !formData.to_province_id || !formData.fixed_price) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      // Build address text
      const fromProvince = provinces.find(p => p.id == formData.from_province_id);
      const toProvince = provinces.find(p => p.id == formData.to_province_id);
      
      const submitData = {
        ...formData,
        from_province_id: parseInt(formData.from_province_id),
        to_province_id: parseInt(formData.to_province_id),
        from_district_id: formData.from_district_id ? parseInt(formData.from_district_id) : null,
        to_district_id: formData.to_district_id ? parseInt(formData.to_district_id) : null,
        from_ward_id: formData.from_ward_id ? parseInt(formData.from_ward_id) : null,
        to_ward_id: formData.to_ward_id ? parseInt(formData.to_ward_id) : null,
        fixed_price: parseFloat(formData.fixed_price),
        from_address_text: formData.from_address_text || fromProvince?.name || '',
        to_address_text: formData.to_address_text || toProvince?.name || ''
      };

      if (editingRoute) {
        await apiService.updateFixedPriceRoute(editingRoute.id, submitData);
        setSuccess('✅ Cập nhật cấu hình giá cố định thành công!');
      } else {
        await apiService.createFixedPriceRoute(submitData);
        setSuccess('✅ Tạo cấu hình giá cố định thành công!');
      }

      resetForm();
      loadRoutes();
    } catch (err) {
      setError('Lỗi: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      from_province_id: '',
      from_district_id: '',
      from_ward_id: '',
      from_address_text: '',
      to_province_id: '',
      to_district_id: '',
      to_ward_id: '',
      to_address_text: '',
      fixed_price: '',
      description: ''
    });
    setShowForm(false);
    setEditingRoute(null);
    setDistricts([]);
    setWards([]);
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      from_province_id: route.from_province_id.toString(),
      from_district_id: route.from_district_id?.toString() || '',
      from_ward_id: route.from_ward_id?.toString() || '',
      from_address_text: route.from_address_text,
      to_province_id: route.to_province_id.toString(),
      to_district_id: route.to_district_id?.toString() || '',
      to_ward_id: route.to_ward_id?.toString() || '',
      to_address_text: route.to_address_text,
      fixed_price: route.fixed_price.toString(),
      description: route.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (routeId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cấu hình này?')) return;

    try {
      setLoading(true);
      await apiService.deleteFixedPriceRoute(routeId);
      setSuccess('✅ Xóa cấu hình thành công!');
      loadRoutes();
    } catch (err) {
      setError('Lỗi xóa: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">🛣️ Cấu hình giá cố định theo tuyến</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? '❌ Hủy' : '➕ Thêm tuyến mới'}
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Form thêm/sửa */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingRoute ? '✏️ Chỉnh sửa cấu hình' : '➕ Thêm cấu hình mới'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Điểm đi */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">📍 Điểm đi</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <select
                    value={formData.from_province_id}
                    onChange={(e) => handleProvinceChange('from_province_id', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {Array.isArray(provinces) && provinces.map(province => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {districts.from && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện
                    </label>
                    <select
                      value={formData.from_district_id}
                      onChange={(e) => handleDistrictChange('from_district_id', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn quận/huyện --</option>
                      {districts.from && districts.from.map(district => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {wards.from && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã
                    </label>
                    <select
                      value={formData.from_ward_id}
                      onChange={(e) => handleWardChange('from_ward_id', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn phường/xã --</option>
                      {wards.from && wards.from.map(ward => (
                        <option key={ward.id} value={ward.id}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      Tên địa chỉ hiển thị
                      <span className="ml-1 text-blue-500" title="Tự động điền khi chọn tỉnh/huyện/xã. Bạn có thể chỉnh sửa nếu cần.">
                        ℹ️
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.from_address_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, from_address_text: e.target.value }))}
                    placeholder="Sẽ tự động điền khi chọn tỉnh/huyện/xã"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Điểm đến */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">🎯 Điểm đến</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <select
                    value={formData.to_province_id}
                    onChange={(e) => handleProvinceChange('to_province_id', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Chọn tỉnh/thành phố --</option>
                    {Array.isArray(provinces) && provinces.map(province => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                {districts.to && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quận/Huyện
                    </label>
                    <select
                      value={formData.to_district_id}
                      onChange={(e) => handleDistrictChange('to_district_id', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn quận/huyện --</option>
                      {districts.to && districts.to.map(district => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {wards.to && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phường/Xã
                    </label>
                    <select
                      value={formData.to_ward_id}
                      onChange={(e) => handleWardChange('to_ward_id', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn phường/xã --</option>
                      {wards.to && wards.to.map(ward => (
                        <option key={ward.id} value={ward.id}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center">
                      Tên địa chỉ hiển thị
                      <span className="ml-1 text-blue-500" title="Tự động điền khi chọn tỉnh/huyện/xã. Bạn có thể chỉnh sửa nếu cần.">
                        ℹ️
                      </span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.to_address_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, to_address_text: e.target.value }))}
                    placeholder="Sẽ tự động điền khi chọn tỉnh/huyện/xã"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Giá và mô tả */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá cố định (VNĐ) *
                </label>
                <input
                  type="number"
                  value={formData.fixed_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, fixed_price: e.target.value }))}
                  placeholder="VD: 500000"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="VD: Tuyến cao tốc, giá ưu đãi..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
              >
                {loading ? 'Đang xử lý...' : (editingRoute ? '💾 Cập nhật' : '➕ Thêm mới')}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold"
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách cấu hình */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">📋 Danh sách cấu hình hiện tại</h3>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Đang tải...</p>
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có cấu hình giá cố định nào</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tuyến đường
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá cố định
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {routes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{route.from_address_text}</div>
                        <div className="text-gray-500">↓</div>
                        <div className="font-medium">{route.to_address_text}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {route.fixed_price?.toLocaleString()} VNĐ
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {route.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        route.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {route.is_active ? '✅ Hoạt động' : '❌ Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(route)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(route.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Hướng dẫn */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Hướng dẫn sử dụng:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• <strong>Ưu tiên tìm kiếm:</strong> Xã → Huyện → Tỉnh (từ chi tiết đến tổng quát)</li>
          <li>• <strong>Tỉnh/Thành phố:</strong> Bắt buộc phải chọn cho cả điểm đi và điểm đến</li>
          <li>• <strong>Quận/Huyện, Phường/Xã:</strong> Tùy chọn, để trống nếu muốn áp dụng cho toàn tỉnh</li>
          <li>• <strong>Giá cố định:</strong> Sẽ được áp dụng thay vì tính theo km khi có tuyến phù hợp</li>
        </ul>
      </div>
    </div>
  );
};

export default FixedPriceManager;
