import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PriceCalculator from './components/PriceCalculator';
import AdminPage from './pages/AdminPage';
import ContactButtons from './components/ContactButtons';

const TravelWebsite = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header - Tối ưu cho mobile */}
        <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white shadow-lg">
          <div className="container mx-auto px-2 md:px-4">
            {/* Mobile: Chỉ hiển thị hotline và logo compact */}
            <div className="md:hidden py-3">
              <div className="flex items-center justify-between">
                {/* Logo compact */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <i className="fas fa-map-marked-alt text-sm text-blue-900"></i>
                  </div>
                  <Link to="/" className="text-lg font-bold hover:text-yellow-300">
                    TanuTravel
                  </Link>
                </div>
                
                {/* Hotline prominently displayed */}
                <div className="flex items-center space-x-2 bg-yellow-400 text-blue-900 px-3 py-1 rounded-full">
                  <i className="fas fa-phone-alt text-sm"></i>
                  <span className="font-bold text-sm">0985323531</span>
                </div>
              </div>
            </div>

            {/* Desktop: Full header */}
            <div className="hidden md:block">
              {/* Top Bar */}
              <div className="flex justify-between items-center py-3 border-b border-white/20">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-phone-alt text-yellow-300"></i>
                    <span className="font-semibold">Hotline: 0985323531</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-envelope text-yellow-300"></i>
                    <span>oanhngoc198324@gmail.com</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    <i className="fab fa-facebook-f text-xl"></i>
                  </a>
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    <i className="fab fa-instagram text-xl"></i>
                  </a>
                  <a href="#" className="hover:text-yellow-300 transition-colors">
                    <i className="fab fa-youtube text-xl"></i>
                  </a>
                </div>
              </div>
              
              {/* Main Header */}
              <div className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <i className="fas fa-map-marked-alt text-2xl text-blue-900"></i>
                    </div>
                    <div>
                      <Link to="/" className="block">
                        <h1 className="text-2xl font-bold hover:text-yellow-300 transition-colors">TanuTravel</h1>
                        <p className="text-blue-100 text-sm">Khám phá Việt Nam cùng chúng tôi</p>
                      </Link>
                    </div>
                  </div>
                  
                  <nav className="flex space-x-8">
                    <Link to="/" className="hover:text-yellow-300 transition-colors font-medium">
                      🏠 Trang chủ
                    </Link>
                    <a href="#" className="hover:text-yellow-300 transition-colors font-medium">
                      📞 Liên hệ
                    </a>
                    <a href="#" className="hover:text-yellow-300 transition-colors font-medium">
                      ℹ️ Giới thiệu
                    </a>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Routes */}
        <Routes>
          {/* Trang chủ */}
          <Route path="/" element={
            <>
              {/* Banner Section - Chỉ hiển thị trên desktop */}
              <section className="hidden md:block h-96 flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                <div className="text-center text-white z-10">
                  <h1 className="text-5xl font-bold mb-6">Khám Phá Việt Nam</h1>
                  <p className="text-xl mb-8">Trải nghiệm du lịch tuyệt vời với dịch vụ chất lượng</p>
                  <div className="flex justify-center space-x-4">
                    <button className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors">
                      🗺️ Tính Giá Ngay
                    </button>
                    <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-900 transition-colors">
                      📞 Liên Hệ
                    </button>
                  </div>
                </div>
              </section>

              {/* Price Calculator Section */}
              <section className="py-4 md:py-12">
                <div className="container mx-auto px-2 md:px-4">
                  <PriceCalculator />
                </div>
              </section>

              {/* Features Section - Chỉ hiển thị trên desktop */}
              <section className="hidden md:block py-20 bg-white">
                <div className="container mx-auto px-4">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Tại Sao Chọn TanuTravel?</h2>
                    <p className="text-xl text-gray-600">Chúng tôi mang đến trải nghiệm du lịch tốt nhất</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center p-8 bg-blue-50 rounded-xl">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-map-marked-alt text-2xl text-white"></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Tính Giá Chính Xác</h3>
                      <p className="text-gray-600">Hệ thống tính giá tự động, minh bạch và chính xác đến từng km</p>
                    </div>
                    
                    <div className="text-center p-8 bg-green-50 rounded-xl">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-car text-2xl text-white"></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Xe Đời Mới</h3>
                      <p className="text-gray-600">Đội xe đời mới, đầy đủ tiện nghi, đảm bảo an toàn</p>
                    </div>
                    
                    <div className="text-center p-8 bg-yellow-50 rounded-xl">
                      <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-headset text-2xl text-white"></i>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Hỗ Trợ 24/7</h3>
                      <p className="text-gray-600">Đội ngũ hỗ trợ khách hàng 24/7, sẵn sàng giải đáp mọi thắc mắc</p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          } />
          
          {/* Admin route */}
          <Route path="/admin" element={<AdminPage />} />
        </Routes>

        {/* Footer - Compact cho mobile */}
        <footer className="bg-gray-800 text-white py-6 md:py-12">
          <div className="container mx-auto px-2 md:px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
              {/* Company info */}
              <div className="text-center md:text-left">
                <h5 className="font-bold mb-3 text-lg">TanuTravel</h5>
                <p className="text-gray-400 text-sm mb-3">
                  Khám phá Việt Nam cùng chúng tôi
                </p>
                <div className="flex space-x-4 justify-center md:justify-start">
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <i className="fab fa-facebook-f text-lg"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <i className="fab fa-instagram text-lg"></i>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors">
                    <i className="fab fa-youtube text-lg"></i>
                  </a>
                </div>
              </div>

              {/* Contact - Prominent on mobile */}
              <div className="text-center md:text-left">
                <h5 className="font-semibold mb-3 text-base md:text-lg">Liên hệ</h5>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 justify-center md:justify-start">
                    <i className="fas fa-phone-alt text-yellow-400"></i>
                    <span className="text-sm md:text-base font-semibold">0985323531</span>
                  </div>
                  <div className="flex items-center space-x-2 justify-center md:justify-start">
                    <i className="fas fa-envelope text-yellow-400"></i>
                    <span className="text-sm">oanhngoc198324@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* Quick links - Hidden on mobile */}
              <div className="hidden md:block text-center md:text-left">
                <h5 className="font-semibold mb-4 text-lg">Liên kết nhanh</h5>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Trang chủ</Link></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tour trong nước</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Dịch vụ</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tin tức</a></li>
                </ul>
              </div>

              {/* Services - Hidden on mobile */}
              <div className="hidden md:block text-center md:text-left">
                <h5 className="font-semibold mb-4 text-lg">Dịch vụ</h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Tour trọn gói</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Thuê xe du lịch</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Booking khách sạn</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Vé máy bay</a></li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-700 mt-6 md:mt-8 pt-4 md:pt-6 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 TanuTravel. Tất cả quyền được bảo lưu.
              </p>
            </div>
          </div>
        </footer>

        <ContactButtons />
      </div>
    </Router>
  );
};

function App() {
  return <TravelWebsite />;
}

export default App;