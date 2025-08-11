import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PriceCalculator from './PriceCalculator';
import TierPriceCalculator from './TierPriceCalculator';
import AdminPage from '../pages/AdminPage';

const TravelWebsite = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [pricingMode, setPricingMode] = useState('tier'); // 'simple' hoặc 'tier'

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        {/* Header */}
        <header className="bg-blue-900/90 backdrop-blur-sm text-white shadow-lg sticky top-0 z-50">
          {/* Top Bar */}
          <div className="bg-blue-800/50 py-2 md:py-3">
            <div className="container mx-auto px-2 md:px-4">
              <div className="flex flex-col md:flex-row justify-between items-center text-xs md:text-sm space-y-1 md:space-y-0">
                <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-6">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-phone-alt text-yellow-300"></i>
                    <span className="text-xs md:text-sm md:text-base">Hotline: 0123-456-789</span>
                  </div>
                  <div className="hidden md:flex items-center space-x-2">
                    <i className="fas fa-envelope text-yellow-300"></i>
                    <span className="text-sm md:text-base">info@tanutrave.com</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 md:space-x-4">
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    <i className="fab fa-facebook-f text-lg md:text-xl"></i>
                  </a>
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    <i className="fab fa-instagram text-lg md:text-xl"></i>
                  </a>
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    <i className="fab fa-youtube text-lg md:text-xl"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Header */}
          <div className="py-4 md:py-6">
            <div className="container mx-auto px-2 md:px-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <i className="fas fa-map-marked-alt text-xl md:text-2xl text-blue-900"></i>
                  </div>
                  <div className="text-center md:text-left">
                    <h1 className="text-xl md:text-2xl font-bold">TanuTravel</h1>
                    <p className="text-blue-100 text-xs md:text-sm">Khám phá Việt Nam cùng chúng tôi</p>
                  </div>
                </div>
                
                <nav className="hidden md:flex space-x-8">
                  <Link to="/" className="hover:text-yellow-300 transition-colors font-medium">Trang chủ</Link>
                  <a href="#" className="hover:text-yellow-300 transition-colors font-medium">Tour</a>
                  <a href="#" className="hover:text-yellow-300 transition-colors font-medium">Dịch vụ</a>
                  <a href="#" className="hover:text-yellow-300 transition-colors font-medium">Tin tức</a>
                  <a href="#" className="hover:text-yellow-300 transition-colors font-medium">Liên hệ</a>
                  <Link to="/admin" className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-300 transition-colors">
                    ⚙️ Quản trị
                  </Link>
                </nav>
                
                {/* Mobile menu button */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 rounded-lg bg-blue-800 hover:bg-blue-700 transition-colors"
                >
                  <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                </button>
              </div>
              
              {/* Mobile Navigation */}
              {showMobileMenu && (
                <div className="md:hidden mt-4 py-4 border-t border-blue-700">
                  <nav className="flex flex-col space-y-3">
                    <Link to="/" className="text-center py-2 hover:text-yellow-300 transition-colors font-medium">Trang chủ</Link>
                    <a href="#" className="text-center py-2 hover:text-yellow-300 transition-colors font-medium">Tour</a>
                    <a href="#" className="text-center py-2 hover:text-yellow-300 transition-colors font-medium">Dịch vụ</a>
                    <a href="#" className="text-center py-2 hover:text-yellow-300 transition-colors font-medium">Tin tức</a>
                    <a href="#" className="text-center py-2 hover:text-yellow-300 transition-colors font-medium">Liên hệ</a>
                    <Link to="/admin" className="text-center py-2 bg-yellow-400 text-blue-900 rounded-lg font-medium mx-4">
                      ⚙️ Quản trị
                    </Link>
                  </nav>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Mode Selector */}
          <div className="bg-blue-800/30 py-3 border-t border-blue-700/50">
            <div className="container mx-auto px-2 md:px-4">
              <div className="flex justify-center">
                <div className="flex items-center space-x-4 bg-blue-800/50 rounded-lg px-4 py-2">
                  <span className="text-sm font-medium">Chế độ tính giá:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPricingMode('tier')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        pricingMode === 'tier'
                          ? 'bg-yellow-400 text-blue-900 shadow-md'
                          : 'bg-blue-700 text-white hover:bg-blue-600'
                      }`}
                    >
                      🎯 Theo bậc
                    </button>
                    <button
                      onClick={() => setPricingMode('simple')}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                        pricingMode === 'simple'
                          ? 'bg-yellow-400 text-blue-900 shadow-md'
                          : 'bg-blue-700 text-white hover:bg-blue-600'
                      }`}
                    >
                      💰 Đơn giản
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <section className="relative py-16 md:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                <div className="relative container mx-auto px-2 md:px-4 text-center text-white">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                    Khám phá <span className="text-yellow-400">Việt Nam</span> 
                    <br className="hidden md:block" />
                    cùng chúng tôi
                  </h2>
                  <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
                    Dịch vụ du lịch chuyên nghiệp, an toàn và tận tâm
                  </p>
                  <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-8 text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 md:p-4 mx-auto md:mx-0 w-40 md:w-auto">
                      <i className="fas fa-star text-2xl md:text-3xl text-yellow-400 mb-2"></i>
                      <p className="font-semibold text-xs md:text-base">Dịch vụ 5 sao</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 md:p-4 mx-auto md:mx-0 w-40 md:w-auto">
                      <i className="fas fa-shield-alt text-2xl md:text-3xl text-green-400 mb-2"></i>
                      <p className="font-semibold text-xs md:text-base">An toàn tuyệt đối</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 md:p-4 mx-auto md:mx-0 w-40 md:w-auto">
                      <i className="fas fa-heart text-2xl md:text-3xl text-red-400 mb-2"></i>
                      <p className="font-semibold text-xs md:text-base">Tận tâm phục vụ</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Main Content */}
              <main className="container mx-auto px-2 md:px-4 py-8 md:py-12">
                {/* Form Section */}
                <div className="backdrop-blur-sm bg-white/95 rounded-2xl shadow-2xl p-4 md:p-8 mb-8 md:mb-12">
                  
                  {/* Pricing Mode Info */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {pricingMode === 'tier' ? '🎯' : '💰'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {pricingMode === 'tier' ? 'Tính giá theo bậc quãng đường' : 'Tính giá đơn giản'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {pricingMode === 'tier' 
                              ? 'Giá khác nhau theo từng khoảng cách (0-10km, 10-50km, 50km+)'
                              : 'Giá cố định theo công thức: Giá cơ bản + (Khoảng cách × Giá/km)'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Quick switch buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setPricingMode('tier')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            pricingMode === 'tier'
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          🎯 Theo bậc
                        </button>
                        <button
                          onClick={() => setPricingMode('simple')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            pricingMode === 'simple'
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          💰 Đơn giản
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Render pricing calculator based on mode */}
                  {pricingMode === 'tier' ? (
                    <TierPriceCalculator />
                  ) : (
                    <PriceCalculator />
                  )}
                  
                  {/* Comparison info */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">💡 So sánh các chế độ tính giá:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h5 className="font-medium text-blue-800 mb-2">🎯 Theo bậc quãng đường</h5>
                        <ul className="text-blue-700 space-y-1">
                          <li>• Giá khác nhau theo từng khoảng cách</li>
                          <li>• Linh hoạt, có thể có nhiều mức giá</li>
                          <li>• Phù hợp cho dịch vụ chuyên nghiệp</li>
                          <li>• Ví dụ: 0-10km (15k), 10-50km (12k), 50km+ (8k)</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h5 className="font-medium text-green-800 mb-2">💰 Tính giá đơn giản</h5>
                        <ul className="text-green-700 space-y-1">
                          <li>• Công thức cố định dễ hiểu</li>
                          <li>• Tính toán nhanh và đơn giản</li>
                          <li>• Phù hợp cho dịch vụ cơ bản</li>
                          <li>• Ví dụ: 10,000đ + (khoảng cách × 5,000đ/km)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12 px-2 md:px-0">
                  <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <i className="fas fa-clock text-xl md:text-2xl text-blue-600"></i>
                    </div>
                    <h5 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Phản hồi nhanh</h5>
                    <p className="text-gray-600 text-xs md:text-sm">Tư vấn và báo giá trong 30 phút</p>
                  </div>

                  <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <i className="fas fa-map-marked-alt text-xl md:text-2xl text-green-600"></i>
                    </div>
                    <h5 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Hành trình đa dạng</h5>
                    <p className="text-gray-600 text-xs md:text-sm">Khám phá mọi miền đất nước</p>
                  </div>

                  <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <i className="fas fa-users text-xl md:text-2xl text-yellow-600"></i>
                    </div>
                    <h5 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Đội ngũ chuyên nghiệp</h5>
                    <p className="text-gray-600 text-xs md:text-sm">HDV giàu kinh nghiệm, nhiệt tình</p>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="text-center py-8 md:py-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white mb-8 md:mb-12">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Sẵn sàng khám phá?</h3>
                  <p className="text-base md:text-lg mb-6 max-w-2xl mx-auto">
                    Liên hệ ngay với chúng tôi để được tư vấn và lên kế hoạch cho chuyến đi của bạn
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                    <a href="#" className="bg-yellow-400 text-blue-900 px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-sm md:text-base hover:bg-yellow-300 transition-colors">
                      📞 Gọi ngay: 0123-456-789
                    </a>
                    <a href="#" className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-semibold text-sm md:text-base hover:bg-white hover:text-blue-600 transition-colors">
                      💬 Chat với chúng tôi
                    </a>
                  </div>
                </div>
              </main>
            </>
          } />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="container mx-auto px-2 md:px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
              {/* Company Info */}
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <i className="fas fa-map-marked-alt text-xl text-blue-900"></i>
                  </div>
                  <h5 className="text-xl font-bold">TanuTravel</h5>
                </div>
                <p className="text-gray-400 mb-4 text-sm md:text-base">
                  Đồng hành cùng bạn trên mọi hành trình khám phá đất nước Việt Nam xinh đẹp
                </p>
                <div className="flex space-x-4 justify-center md:justify-start">
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <i className="fab fa-facebook-f text-lg md:text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <i className="fab fa-instagram text-lg md:text-xl"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <i className="fab fa-youtube text-lg md:text-xl"></i>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="text-center md:text-left">
                <h5 className="font-semibold mb-4 text-base md:text-lg">Liên kết nhanh</h5>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Trang chủ</Link></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Tour trong nước</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Tour nước ngoài</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Dịch vụ</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Tin tức</a></li>
                </ul>
              </div>

              {/* Services */}
              <div className="text-center md:text-left">
                <h5 className="font-semibold mb-4 text-base md:text-lg">Dịch vụ</h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Tour trọn gói</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Thuê xe du lịch</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Booking khách sạn</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Vé máy bay</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm md:text-base">Visa - Hộ chiếu</a></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="text-center md:text-left">
                <h5 className="font-semibold mb-4 text-base md:text-lg">Liên hệ</h5>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 justify-center md:justify-start">
                    <i className="fas fa-phone-alt text-yellow-400 text-sm"></i>
                    <span className="text-gray-400 text-sm md:text-base">0123-456-789</span>
                  </div>
                  <div className="flex items-center space-x-3 justify-center md:justify-start">
                    <i className="fas fa-envelope text-yellow-400 text-sm"></i>
                    <span className="text-gray-400 text-sm md:text-base">info@tanutrave.com</span>
                  </div>
                  <div className="flex items-start space-x-3 justify-center md:justify-start text-center md:text-left">
                    <i className="fas fa-map-marker-alt text-yellow-400 mt-1 text-sm"></i>
                    <span className="text-gray-400 text-sm md:text-base">123 Đường ABC, Quận XYZ, TP.HCM</span>
                  </div>
                  <div className="flex items-center space-x-3 justify-center md:justify-start">
                    <i className="fas fa-clock text-yellow-400 text-sm"></i>
                    <span className="text-gray-400 text-sm md:text-base">24/7 - Luôn sẵn sàng phục vụ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800 mt-6 md:mt-8 pt-4 md:pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                <p className="text-gray-400 text-xs md:text-sm">
                  © 2025 by Tanu. All rights reserved.
                </p>
                <div className="flex space-x-4 md:space-x-6 mt-3 md:mt-0">
                  <a href="#" className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors">Chính sách bảo mật</a>
                  <a href="#" className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors">Điều khoản sử dụng</a>
                  <a href="#" className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors">Hỗ trợ</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default TravelWebsite;