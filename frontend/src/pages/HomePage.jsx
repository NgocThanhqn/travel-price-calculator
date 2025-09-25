import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const HomePage = () => {
  const homeStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Du Lịch Huỳnh Vũ",
    "image": "https://datxeviet.com/images/logo.png",
    "telephone": "+84985323531",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "VN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 10.8231,
      "longitude": 106.6297
    },
    "url": "https://datxeviet.com",
    "priceRange": "$$",
    "openingHours": "Mo-Su 00:00-23:59",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "1000"
    }
  };

  return (
    <>
      <SEOHead 
        title="Du Lịch Huỳnh Vũ - Đặt Xe Du Lịch Uy Tín #1 Việt Nam | datxeviet.com"
        description="🚗 Dịch vụ đặt xe du lịch uy tín #1 Việt Nam. Tính giá minh bạch, xe đời mới, tài xế kinh nghiệm 10+ năm. ☎️ Hotline: 0985323531. Đặt xe ngay!"
        keywords="đặt xe du lịch, thuê xe du lịch việt nam, xe 4 chỗ, xe 7 chỗ, tour du lịch, datxeviet, tính giá xe du lịch, thuê xe giá rẻ"
        canonical="https://datxeviet.com"
        structuredData={homeStructuredData}
      />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Khám Phá Việt Nam
            <span className="block text-yellow-400 text-3xl md:text-5xl mt-2">
              Cùng Du Lịch Huỳnh Vũ
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 text-gray-200">
            Trải nghiệm du lịch tuyệt vời với dịch vụ chất lượng cao
          </p>
          
          <p className="text-lg md:text-xl mb-8 text-yellow-300 font-semibold">
            datxeviet.com - Đặt xe du lịch uy tín #1
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              to="/booking"
              className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <i className="fas fa-calendar-check mr-2"></i>
              Đặt Chuyến Ngay
            </Link>
            <a 
              href="tel:0985323531"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-900 transition-all duration-300 transform hover:scale-105"
            >
              <i className="fas fa-phone mr-2"></i>
              Gọi Ngay: 0985323531
            </a>
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 w-full flex justify-center text-white animate-bounce">
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Khám phá thêm</span>
            <i className="fas fa-chevron-down text-2xl"></i>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.9)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
              Dịch Vụ Du Lịch Chuyên Nghiệp
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cung cấp dịch vụ thuê xe du lịch với đội xe đời mới, tài xế kinh nghiệm và giá cả hợp lý
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Xe 4 chỗ */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <i className="fas fa-car text-5xl mb-4"></i>
                  <h3 className="text-2xl font-bold">Xe 4 Chỗ</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Sedan & Hatchback</h4>
                <ul className="text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Phù hợp gia đình nhỏ, cặp đôi
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Tiết kiệm nhiên liệu
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Di chuyển linh hoạt trong phố
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Giá thuê hợp lý
                  </li>
                </ul>
                <div className="text-center">
                  <Link 
                    to="/booking"
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-300"
                  >
                    Đặt Xe 4 Chỗ
                  </Link>
                </div>
              </div>
            </div>

            {/* Xe 7 chỗ */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <i className="fas fa-shuttle-van text-5xl mb-4"></i>
                  <h3 className="text-2xl font-bold">Xe 7 Chỗ</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">SUV & MPV</h4>
                <ul className="text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Phù hợp gia đình đông người
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Không gian rộng rãi, thoải mái
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Phù hợp đường dài, địa hình khó
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Hành lý nhiều, tiện nghi cao
                  </li>
                </ul>
                <div className="text-center">
                  <Link 
                    to="/booking"
                    className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300"
                  >
                    Đặt Xe 7 Chỗ
                  </Link>
                </div>
              </div>
            </div>

            {/* Đặc chuyến */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 md:col-span-2 lg:col-span-1">
              <div className="h-48 bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <i className="fas fa-star text-5xl mb-4"></i>
                  <h3 className="text-2xl font-bold">Đặc Chuyến</h3>
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">Tour Riêng</h4>
                <ul className="text-gray-600 space-y-2 mb-6">
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Tùy chỉnh lịch trình theo ý muốn
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Tài xế kinh nghiệm, am hiểu địa phương
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Dịch vụ VIP, riêng tư
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    Giá ưu đãi cho chuyến dài ngày
                  </li>
                </ul>
                <div className="text-center">
                  <Link 
                    to="/booking"
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors duration-300"
                  >
                    Đặt Chuyến Ngay
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vietnam Gallery Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
              Vẻ Đẹp Việt Nam
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Khám phá những điểm đến tuyệt đẹp trên khắp đất nước hình chữ S
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Hạ Long Bay */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div 
                className="h-64 md:h-80 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                style={{
                  backgroundImage: `url('/images/halong-bay.jpg')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Vịnh Hạ Long</h3>
                  <p className="text-sm md:text-base text-gray-200">Di sản thế giới UNESCO</p>
                </div>
              </div>
            </div>

            {/* Đà Nẵng */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div 
                className="h-64 md:h-80 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                style={{
                  backgroundImage: `url('/images/danang-dragon-bridge.jpg')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Đà Nẵng</h3>
                  <p className="text-sm md:text-base text-gray-200">Cầu Rồng phun lửa</p>
                </div>
              </div>
            </div>

            {/* Vũng Tàu */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div 
                className="h-64 md:h-80 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                style={{
                  backgroundImage: `url('/images/vungtau-christ-statue.jpg')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Vũng Tàu</h3>
                  <p className="text-sm md:text-base text-gray-200">Tượng Chúa Kitô</p>
                </div>
              </div>
            </div>

            {/* Phú Quốc */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div 
                className="h-64 md:h-80 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                style={{
                  backgroundImage: `url('/images/phuquoc-beach.jpg')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Phú Quốc</h3>
                  <p className="text-sm md:text-base text-gray-200">Đảo ngọc thiên đường</p>
                </div>
              </div>
            </div>

            {/* Mũi Né */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div 
                className="h-64 md:h-80 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                style={{
                  backgroundImage: `url('/images/muine-sand-dunes.jpg')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Mũi Né</h3>
                  <p className="text-sm md:text-base text-gray-200">Đồi cát & resort biển</p>
                </div>
              </div>
            </div>

            {/* Cần Thơ */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div 
                className="h-64 md:h-80 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                style={{
                  backgroundImage: `url('/images/cantho-floating-market.jpg')`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">Cần Thơ</h3>
                  <p className="text-sm md:text-base text-gray-200">Chợ nổi Cái Răng</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              to="/booking"
              className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <i className="fas fa-route mr-3"></i>
              Khám Phá Ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Experience Section */}
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
              Trải Nghiệm Du Lịch Khó Quên
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Cùng chúng tôi khám phá những vùng đất tuyệt đẹp trên khắp Việt Nam
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-mountain text-3xl text-gray-800"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Du Lịch Miền Núi</h3>
              <p className="text-gray-300">
                Sapa, Đà Lạt, Ba Na Hills... Trải nghiệm khí hậu mát mẻ và cảnh quan hùng vĩ
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-water text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Du Lịch Biển</h3>
              <p className="text-gray-300">
                Nha Trang, Phú Quốc, Hạ Long... Tận hưởng làn nước trong xanh và bãi cát trắng
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-landmark text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Du Lịch Văn Hóa</h3>
              <p className="text-gray-300">
                Hà Nội, Huế, Hội An... Khám phá di sản văn hóa và lịch sử Việt Nam
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-red-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-utensils text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold mb-4">Ẩm Thực</h3>
              <p className="text-gray-300">
                Khám phá ẩm thực địa phương tại mỗi điểm đến, từ phở Hà Nội đến cơm tấm Sài Gòn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.88), rgba(255,255,255,0.92)), url('https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
              Tại Sao Chọn Du Lịch Huỳnh Vũ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Với nhiều năm kinh nghiệm trong lĩnh vực du lịch, chúng tôi cam kết mang đến dịch vụ tốt nhất
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 bg-blue-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-calculator text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Tính Giá Minh Bạch</h3>
              <p className="text-gray-600">
                Hệ thống tính giá tự động, chính xác đến từng km. Không phát sinh chi phí ẩn
              </p>
            </div>
            
            <div className="text-center p-8 bg-green-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-car text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Xe Đời Mới</h3>
              <p className="text-gray-600">
                Đội xe đời mới, được bảo dưỡng định kỳ, đầy đủ tiện nghi và đảm bảo an toàn
              </p>
            </div>
            
            <div className="text-center p-8 bg-yellow-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-headset text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Hỗ Trợ 24/7</h3>
              <p className="text-gray-600">
                Đội ngũ hỗ trợ khách hàng 24/7, sẵn sàng giải đáp mọi thắc mắc của bạn
              </p>
            </div>
            
            <div className="text-center p-8 bg-purple-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-shield-alt text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Bảo Hiểm Toàn Diện</h3>
              <p className="text-gray-600">
                Tất cả xe đều có bảo hiểm toàn diện, đảm bảo an toàn tuyệt đối cho hành khách
              </p>
            </div>
            
            <div className="text-center p-8 bg-red-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-users text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Tài Xế Kinh Nghiệm</h3>
              <p className="text-gray-600">
                Đội ngũ tài xế có nhiều năm kinh nghiệm, am hiểu địa phương và lái xe an toàn
              </p>
            </div>
            
            <div className="text-center p-8 bg-indigo-50 rounded-xl hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-star text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Uy Tín Hàng Đầu</h3>
              <p className="text-gray-600">
                Hàng ngàn khách hàng tin tưởng và đánh giá 5 sao về chất lượng dịch vụ
              </p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              Sẵn sàng cho chuyến đi tiếp theo?
            </h3>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link 
                to="/booking"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <i className="fas fa-calendar-check mr-2"></i>
                Tính Giá & Đặt Chuyến
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
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
              Khách Hàng Nói Gì Về Chúng Tôi
            </h2>
            <p className="text-xl text-gray-600">
              Những phản hồi tích cực từ khách hàng là động lực để chúng tôi không ngừng hoàn thiện
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "Dịch vụ tuyệt vời! Xe sạch sẽ, tài xế lịch sự và am hiểu địa phương. 
                Chuyến đi Đà Lạt của gia đình tôi thật tuyệt vời."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  AN
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Anh Nguyễn Văn An</h4>
                  <p className="text-gray-500 text-sm">TP. Hồ Chí Minh</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "Giá cả minh bạch, không có phát sinh. Đặt xe online rất tiện lợi. 
                Tôi sẽ tiếp tục sử dụng dịch vụ cho những chuyến đi sau."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  LH
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Chị Lê Thị Hoa</h4>
                  <p className="text-gray-500 text-sm">Hà Nội</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "Đặc chuyến đi Phú Quốc 3 ngày 2 đêm. Tài xế rất nhiệt tình, 
                đưa đón đúng giờ và hỗ trợ rất tốt. Rất hài lòng!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  MT
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Anh Trần Minh Tuấn</h4>
                  <p className="text-gray-500 text-sm">Đà Nẵng</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
