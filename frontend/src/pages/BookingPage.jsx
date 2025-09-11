import React from 'react';
import { Link } from 'react-router-dom';
import PriceCalculator from '../components/PriceCalculator';

const BookingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white shadow-sm border-b hidden">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors">
              <i className="fas fa-home mr-1"></i>
              Trang chủ
            </Link>
            <i className="fas fa-chevron-right text-gray-400"></i>
            <span className="text-gray-600">Đặt chuyến</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-8 md:py-20 hidden">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-5xl font-bold mb-4 md:mb-6">
            Đặt Chuyến Du Lịch
          </h1>
          <p className="text-base md:text-xl text-blue-100 mb-3 md:mb-4">
            Tính giá và đặt xe du lịch nhanh chóng, tiện lợi
          </p>
          <p className="text-yellow-300 font-semibold text-sm md:text-base">
            <i className="fas fa-shield-alt mr-2"></i>
            Giá cả minh bạch - Không phát sinh chi phí ẩn
          </p>
        </div>
      </section>

      {/* Desktop Banner Section - Khám Phá Việt Nam */}
      <section className="hidden md:block h-96 flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white z-10">
            <h1 className="text-5xl font-bold mb-6">Khám Phá Việt Nam</h1>
            <p className="text-xl mb-4">Trải nghiệm du lịch tuyệt vời với dịch vụ chất lượng</p>
            <p className="text-lg mb-8 text-yellow-300 font-semibold">datxeviet.com</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => {
                  const formElement = document.querySelector('.form-compact');
                  if (formElement) {
                    formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
              >
                Tính Giá Ngay
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-900 transition-colors">
                Liên Hệ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-8 md:py-16 relative">
        {/* Background for desktop */}
        <div className="hidden md:block absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.2)), url('https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}>
        </div>
        
        {/* Mobile background */}
        <div className="md:hidden absolute inset-0 z-0 bg-gradient-to-br from-gray-100 to-gray-200">
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <PriceCalculator />
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.75), rgba(255,255,255,0.85)), url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Thông Tin Hữu Ích
            </h2>
            <p className="text-gray-600">
              Những điều bạn cần biết khi đặt chuyến với Du Lịch Huỳnh Vũ
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-clock text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Đặt Trước 24h</h3>
              <p className="text-gray-600">
                Để đảm bảo có xe, vui lòng đặt trước ít nhất 24 giờ. 
                Trường hợp khẩn cấp, gọi hotline để được hỗ trợ.
              </p>
            </div>
            
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-credit-card text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Thanh Toán Linh Hoạt</h3>
              <p className="text-gray-600">
                Hỗ trợ thanh toán tiền mặt, chuyển khoản hoặc ví điện tử. 
                Có thể thanh toán sau khi hoàn thành chuyến đi.
              </p>
            </div>
            
            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-phone-alt text-2xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Hỗ Trợ 24/7</h3>
              <p className="text-gray-600">
                Đội ngũ hỗ trợ khách hàng luôn sẵn sàng. 
                Gọi ngay <strong className="text-yellow-600">0985323531</strong> để được tư vấn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 md:py-16 bg-gray-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Cần Hỗ Trợ Thêm?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Liên hệ ngay với chúng tôi để được tư vấn chi tiết
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
            <a 
              href="tel:0985323531"
              className="flex items-center space-x-3 bg-yellow-400 text-gray-800 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors"
            >
              <i className="fas fa-phone-alt"></i>
              <span>Hotline: 0985323531</span>
            </a>
            
            <a 
              href="mailto:haohuynh2007.2007@gmail.com"
              className="flex items-center space-x-3 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-envelope"></i>
              <span>Email hỗ trợ</span>
            </a>
            
            <Link 
              to="/"
              className="flex items-center space-x-3 border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-gray-800 transition-colors"
            >
              <i className="fas fa-home"></i>
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingPage;
