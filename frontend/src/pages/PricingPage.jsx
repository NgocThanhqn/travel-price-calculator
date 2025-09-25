import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const PricingPage = () => {
  const pricingStructuredData = {
    "@context": "https://schema.org",
    "@type": "PriceSpecification",
    "name": "Bảng Giá Thuê Xe Du Lịch",
    "description": "Bảng giá thuê xe du lịch chi tiết cho các tuyến phổ biến từ TP.HCM",
    "priceCurrency": "VND",
    "offers": [
      {
        "@type": "Offer",
        "name": "Xe 4 chỗ TP.HCM - Vũng Tàu",
        "price": "700000",
        "priceCurrency": "VND"
      },
      {
        "@type": "Offer", 
        "name": "Xe 7 chỗ TP.HCM - Vũng Tàu",
        "price": "800000",
        "priceCurrency": "VND"
      }
    ]
  };

  const pricingData = [
    {
      title: "HỒ CHÍ MINH ⇆ XUYÊN MỘC, HỒ TRÀM",
      routes: [
        {
          vehicle: "XE 4 CHỖ",
          oneWay: "900.000 VNĐ",
          roundTrip: "1.500.000 VNĐ",
          overnight: "2.600.000 VNĐ"
        },
        {
          vehicle: "XE 7 CHỖ",
          oneWay: "1.000.000 VNĐ",
          roundTrip: "1.600.000 VNĐ",
          overnight: "2.800.000 VNĐ"
        },
        {
          vehicle: "XE 7 CHỖ TOYOTA FORTUNER",
          oneWay: "1.100.000 VNĐ",
          roundTrip: "1.800.000 VNĐ",
          overnight: "3.000.000 VNĐ"
        }
      ]
    },
    {
      title: "HỒ CHÍ MINH ⇆ VŨNG TÀU",
      routes: [
        {
          vehicle: "XE 4 CHỖ",
          oneWay: "700.000 VNĐ",
          roundTrip: "1.200.000 VNĐ",
          overnight: "2.200.000 VNĐ"
        },
        {
          vehicle: "XE 7 CHỖ",
          oneWay: "800.000 VNĐ",
          roundTrip: "1.300.000 VNĐ",
          overnight: "2.400.000 VNĐ"
        },
        {
          vehicle: "XE 7 CHỖ TOYOTA FORTUNER",
          oneWay: "900.000 VNĐ",
          roundTrip: "1.500.000 VNĐ",
          overnight: "2.600.000 VNĐ"
        }
      ]
    },
    {
      title: "HỒ CHÍ MINH ⇆ MŨI NÉ, PHAN THIẾT",
      routes: [
        {
          vehicle: "XE 4 CHỖ",
          oneWay: "1.200.000 VNĐ",
          roundTrip: "2.000.000 VNĐ",
          overnight: "3.500.000 VNĐ"
        },
        {
          vehicle: "XE 7 CHỖ",
          oneWay: "1.300.000 VNĐ",
          roundTrip: "2.200.000 VNĐ",
          overnight: "3.800.000 VNĐ"
        },
        {
          vehicle: "XE 7 CHỖ TOYOTA FORTUNER",
          oneWay: "1.500.000 VNĐ",
          roundTrip: "2.500.000 VNĐ",
          overnight: "4.200.000 VNĐ"
        },
        {
          vehicle: "XE 16 CHỖ",
          oneWay: "2.000.000 VNĐ",
          roundTrip: "3.500.000 VNĐ",
          overnight: "6.000.000 VNĐ"
        }
      ]
    },
    {
      title: "VŨNG TÀU ⇆ MŨI NÉ, PHAN THIẾT",
      routes: [
        {
          vehicle: "XE 4 CHỖ",
          oneWay: "800.000 VNĐ",
          roundTrip: "1.400.000 VNĐ",
          overnight: "2.500.000 VNĐ"
        },
        {
          vehicle: "XE 7 CHỖ",
          oneWay: "900.000 VNĐ",
          roundTrip: "1.500.000 VNĐ",
          overnight: "2.700.000 VNĐ"
        },
        {
          vehicle: "XE 7 CHỖ TOYOTA FORTUNER",
          oneWay: "1.000.000 VNĐ",
          roundTrip: "1.700.000 VNĐ",
          overnight: "3.000.000 VNĐ"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Bảng Giá Thuê Xe Du Lịch 2025 - Minh Bạch, Cạnh Tranh | Du Lịch Huỳnh Vũ"
        description="💰 Bảng giá thuê xe du lịch 2025 cập nhật mới nhất. Xe 4 chỗ từ 700k, xe 7 chỗ từ 800k. Giá cố định, không phát sinh. Xem giá ngay!"
        keywords="bảng giá thuê xe du lịch, giá xe 4 chỗ, giá xe 7 chỗ, thuê xe vũng tàu, thuê xe hồ tràm, giá thuê xe 2025"
        canonical="https://datxeviet.com/pricing"
        structuredData={pricingStructuredData}
      />
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors">
              <i className="fas fa-home mr-1"></i>
              Trang chủ
            </Link>
            <i className="fas fa-chevron-right text-gray-400"></i>
            <span className="text-gray-600">Bảng giá</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-12 md:py-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Bảng Giá Dịch Vụ 2025
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-4">
            Giá cả minh bạch, uy tín cho các tuyến đường phổ biến
          </p>
          <p className="text-yellow-300 font-semibold">
            <i className="fas fa-star mr-2"></i>
            Giá đã bao gồm xăng xe, phí cầu đường, tài xế
          </p>
        </div>
      </section>

      {/* Pricing Tables Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.92)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="space-y-12">
            {pricingData.map((section, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-center">
                    {section.title}
                  </h2>
                </div>
                
                <div className="p-4 md:p-8">
                  {/* Mobile: Card Layout */}
                  <div className="block md:hidden space-y-4">
                    {section.routes.map((route, routeIndex) => (
                      <div key={routeIndex} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center mb-3">
                          <i className="fas fa-car text-blue-500 mr-2"></i>
                          <span className="font-bold text-gray-800 text-sm">
                            {route.vehicle}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <div className="flex items-center">
                              <i className="fas fa-arrow-right text-blue-500 mr-2 text-sm"></i>
                              <span className="text-sm font-medium">Đi 1 chiều</span>
                            </div>
                            <span className="text-base font-bold text-blue-600">
                              {route.oneWay}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <div className="flex items-center">
                              <i className="fas fa-exchange-alt text-green-500 mr-2 text-sm"></i>
                              <span className="text-sm font-medium">Đi về trong ngày</span>
                            </div>
                            <span className="text-base font-bold text-green-600">
                              {route.roundTrip}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <div className="flex items-center">
                              <i className="fas fa-moon text-purple-500 mr-2 text-sm"></i>
                              <span className="text-sm font-medium">Đi 2 ngày 1 đêm</span>
                            </div>
                            <span className="text-base font-bold text-purple-600">
                              {route.overnight}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop: Table Layout */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-4 px-4 font-bold text-gray-800">
                            Loại xe
                          </th>
                          <th className="text-center py-4 px-4 font-bold text-gray-800">
                            <div className="flex flex-col items-center">
                              <i className="fas fa-arrow-right text-blue-500 mb-1"></i>
                              <span className="text-base">Đi 1 chiều</span>
                            </div>
                          </th>
                          <th className="text-center py-4 px-4 font-bold text-gray-800">
                            <div className="flex flex-col items-center">
                              <i className="fas fa-exchange-alt text-green-500 mb-1"></i>
                              <span className="text-base">Đi về trong ngày</span>
                            </div>
                          </th>
                          <th className="text-center py-4 px-4 font-bold text-gray-800">
                            <div className="flex flex-col items-center">
                              <i className="fas fa-moon text-purple-500 mb-1"></i>
                              <span className="text-base">Đi 2 ngày 1 đêm</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.routes.map((route, routeIndex) => (
                          <tr key={routeIndex} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center">
                                <i className="fas fa-car text-blue-500 mr-3"></i>
                                <span className="font-semibold text-gray-800 text-base">
                                  {route.vehicle}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-lg font-bold text-blue-600">
                                {route.oneWay}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-lg font-bold text-green-600">
                                {route.roundTrip}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-lg font-bold text-purple-600">
                                {route.overnight}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-800 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1559592413-7cec4d0d1b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Dịch Vụ Bao Gồm
            </h2>
            <p className="text-xl text-gray-300">
              Giá trên đã bao gồm đầy đủ các dịch vụ cần thiết
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-gas-pump text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Xăng Xe</h3>
              <p className="text-gray-300">
                Chi phí nhiên liệu đã được tính toán đầy đủ cho cả chuyến đi
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-road text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Phí Cầu Đường</h3>
              <p className="text-gray-300">
                Tất cả phí BOT, cầu đường trên tuyến đường đã được bao gồm
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-user-tie text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Tài Xế Kinh Nghiệm</h3>
              <p className="text-gray-300">
                Tài xế am hiểu địa phương, lái xe an toàn và nhiệt tình
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-shield-alt text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Bảo Hiểm</h3>
              <p className="text-gray-300">
                Xe được bảo hiểm toàn diện, đảm bảo an toàn cho hành khách
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
            Cần Tư Vấn Thêm?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Liên hệ ngay với chúng tôi để được báo giá chi tiết cho tuyến đường của bạn
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
            <Link 
              to="/booking"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <i className="fas fa-calculator mr-2"></i>
              Tính Giá Chính Xác
            </Link>
            <a 
              href="tel:0985323531"
              className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <i className="fas fa-phone mr-2"></i>
              Gọi Tư Vấn: 0985323531
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
