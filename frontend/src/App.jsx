import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PriceCalculator from './components/PriceCalculator';
import AdminPage from './pages/AdminPage';

// function App() {
//   return (
//     <Router>
//       <div className="min-h-screen bg-gray-100">
//         {/* Navigation */}
//         <nav className="bg-white shadow-sm border-b">
//           <div className="max-w-6xl mx-auto px-4">
//             <div className="flex justify-between items-center h-16">
//               <div className="flex items-center space-x-8">
//                 <Link to="/" className="text-xl font-bold text-gray-800">
//                   🚗 Travel Price Calculator
//                 </Link>
//                 <div className="flex space-x-4">
//                   <Link
//                     to="/"
//                     className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
//                   >
//                     🏠 Trang chủ
//                   </Link>
//                   <Link
//                     to="/admin"
//                     className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
//                   >
//                     ⚙️ Quản trị
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </nav>

//         {/* Main content */}
//         <div className="py-8">
//           <div className="container mx-auto px-4">
//             <Routes>
//               <Route path="/" element={<PriceCalculator />} />
//               <Route path="/admin" element={<AdminPage />} />
//             </Routes>
//           </div>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;
const TravelWebsite = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white shadow-lg">
          <div className="container mx-auto px-4">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center py-3 border-b border-white/20 gap-4 md:gap-0">
              <div className="flex items-center space-x-4 md:space-x-6">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-phone-alt text-yellow-300"></i>
                  <span className="font-semibold text-sm md:text-base">Hotline: 0985323531</span>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <i className="fas fa-envelope text-yellow-300"></i>
                  <span className="text-sm md:text-base">Haohuynh20072007@gmail.com</span>
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
            
            {/* Main Header */}
            <div className="py-4 md:py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <i className="fas fa-map-marked-alt text-xl md:text-2xl text-blue-900"></i>
                  </div>
                  <div className="text-center md:text-left">
                    <Link to="/" className="block">
                      <h1 className="text-xl md:text-2xl font-bold hover:text-yellow-300 transition-colors">TanuTravel</h1>
                      <p className="text-blue-100 text-xs md:text-sm">Khám phá Việt Nam cùng chúng tôi</p>
                    </Link>
                  </div>
                </div>
                
                {/* Navigation - Không có menu admin */}
                <nav className="hidden md:flex space-x-8">
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
                
                {/* Mobile Menu Button */}
                <button 
                  className="md:hidden block text-white focus:outline-none" 
                  onClick={toggleMobileMenu}
                >
                  <i className="fas fa-bars text-xl"></i>
                </button>
              </div>
              
              {/* Mobile Navigation Menu - Không có admin */}
              {showMobileMenu && (
                <div className="md:hidden mt-4 pb-4 border-t border-white/20">
                  <nav className="flex flex-col space-y-3 mt-4">
                    <Link to="/" className="hover:text-yellow-300 transition-colors font-medium text-center py-2">
                      🏠 Trang chủ
                    </Link>
                    <a href="#" className="hover:text-yellow-300 transition-colors font-medium text-center py-2">
                      📞 Liên hệ
                    </a>
                    <a href="#" className="hover:text-yellow-300 transition-colors font-medium text-center py-2">
                      ℹ️ Giới thiệu
                    </a>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Routes */}
        <Routes>
          {/* Trang chủ */}
          <Route path="/" element={
            <>
              {/* Banner Section */}
              <section 
                className="h-80 md:h-96 flex items-center justify-center relative overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80"></div>
                <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 animate-pulse">
                    🌟 Trải Nghiệm Du Lịch Tuyệt Vời
                  </h2>
                  <p className="text-base md:text-xl mb-6 md:mb-8 text-blue-100 px-4">
                    Khám phá vẻ đẹp Việt Nam với dịch vụ chuyên nghiệp và tận tâm
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
                <div className="backdrop-blur-sm bg-white/95 rounded-2xl shadow-2xl p-4 md:p-8 mb-8 md:mb-12">
                  <PriceCalculator />
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
                      <i className="fas fa-shield-alt text-xl md:text-2xl text-green-600"></i>
                    </div>
                    <h5 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">An toàn tuyệt đối</h5>
                    <p className="text-gray-600 text-xs md:text-sm">Bảo hiểm toàn diện cho mọi chuyến đi</p>
                  </div>
                  
                  <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <i className="fas fa-award text-xl md:text-2xl text-yellow-600"></i>
                    </div>
                    <h5 className="font-semibold text-gray-800 mb-2 text-sm md:text-base">Chất lượng hàng đầu</h5>
                    <p className="text-gray-600 text-xs md:text-sm">10+ năm kinh nghiệm trong ngành</p>
                  </div>
                </div>
              </main>
            </>
          } />
          
          {/* Trang Admin - Chỉ truy cập qua URL */}
          <Route path="/admin" element={
            <main className="container mx-auto px-4 py-8">
              <React.Suspense fallback={
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">⏳ Đang tải trang quản trị...</p>
                </div>
              }>
                <AdminPage />
              </React.Suspense>
            </main>
          } />
          
          {/* Trang 404 */}
          <Route path="*" element={
            <main className="container mx-auto px-4 py-16 text-center">
              <div className="max-w-md mx-auto">
                <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-600 mb-4">Trang không tồn tại</h2>
                <p className="text-gray-500 mb-8">Trang bạn tìm kiếm không được tìm thấy.</p>
                <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  🏠 Về trang chủ
                </Link>
              </div>
            </main>
          } />
        </Routes>

        {/* Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
              {/* Company Info */}
              <div className="text-center md:text-left">
                <div className="flex items-center space-x-3 mb-4 justify-center md:justify-start">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <i className="fas fa-map-marked-alt text-lg md:text-xl text-gray-900"></i>
                  </div>
                  <h4 className="text-lg md:text-xl font-bold">TanuTravel</h4>
                </div>
                <p className="text-gray-400 mb-4 text-sm md:text-base">
                  Đơn vị du lịch uy tín, chuyên nghiệp với hơn 10 năm kinh nghiệm phục vụ khách hàng.
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
                    <span className="text-gray-400 text-sm md:text-base">0985323531</span>
                  </div>
                  <div className="flex items-center space-x-3 justify-center md:justify-start">
                    <i className="fas fa-envelope text-yellow-400 text-sm"></i>
                    <span className="text-gray-400 text-sm md:text-base">Haohuynh20072007@gmail.com</span>
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

function App() {
  return <TravelWebsite />;
}

export default App;