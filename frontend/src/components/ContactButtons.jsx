import React, { useState } from 'react';

const ContactButtons = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contactInfo = {
    phone: '0985323531',
    zalo: '0985323531',
    whatsapp: '84985323531'
  };

  const handlePhoneCall = () => {
    window.open(`tel:${contactInfo.phone}`, '_self');
  };

  const handleZaloChat = () => {
    window.open(`https://zalo.me/${contactInfo.zalo}`, '_blank');
  };

  const handleWhatsAppChat = () => {
    const message = encodeURIComponent('Xin chào! Tôi muốn tư vấn về dịch vụ đặt xe.');
    window.open(`https://wa.me/${contactInfo.whatsapp}?text=${message}`, '_blank');
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999
    }}>
      {/* Contact buttons with conditional rendering */}
      {isExpanded && (
        <div style={{
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={handlePhoneCall}
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              fontSize: '20px'
            }}
            title="Gọi điện thoại"
          >
            📞
          </button>
          
            <button
                onClick={handleZaloChat}
                style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#0068ff', // Màu xanh Zalo chính thức
                    color: 'white',
                    borderRadius: '50%',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '6px'
                }}
                title="Chat Zalo"
                >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                    <path fill="#2962ff" d="M15,36V6.827l-1.211-0.811C8.64,8.083,5,13.112,5,19v10c0,7.732,6.268,14,14,14h10	c4.722,0,8.883-2.348,11.417-5.931V36H15z"></path><path fill="#eee" d="M29,5H19c-1.845,0-3.601,0.366-5.214,1.014C10.453,9.25,8,14.528,8,19	c0,6.771,0.936,10.735,3.712,14.607c0.216,0.301,0.357,0.653,0.376,1.022c0.043,0.835-0.129,2.365-1.634,3.742	c-0.162,0.148-0.059,0.419,0.16,0.428c0.942,0.041,2.843-0.014,4.797-0.877c0.557-0.246,1.191-0.203,1.729,0.083	C20.453,39.764,24.333,40,28,40c4.676,0,9.339-1.04,12.417-2.916C42.038,34.799,43,32.014,43,29V19C43,11.268,36.732,5,29,5z"></path><path fill="#2962ff" d="M36.75,27C34.683,27,33,25.317,33,23.25s1.683-3.75,3.75-3.75s3.75,1.683,3.75,3.75	S38.817,27,36.75,27z M36.75,21c-1.24,0-2.25,1.01-2.25,2.25s1.01,2.25,2.25,2.25S39,24.49,39,23.25S37.99,21,36.75,21z"></path><path fill="#2962ff" d="M31.5,27h-1c-0.276,0-0.5-0.224-0.5-0.5V18h1.5V27z"></path><path fill="#2962ff" d="M27,19.75v0.519c-0.629-0.476-1.403-0.769-2.25-0.769c-2.067,0-3.75,1.683-3.75,3.75	S22.683,27,24.75,27c0.847,0,1.621-0.293,2.25-0.769V26.5c0,0.276,0.224,0.5,0.5,0.5h1v-7.25H27z M24.75,25.5	c-1.24,0-2.25-1.01-2.25-2.25S23.51,21,24.75,21S27,22.01,27,23.25S25.99,25.5,24.75,25.5z"></path><path fill="#2962ff" d="M21.25,18h-8v1.5h5.321L13,26h0.026c-0.163,0.211-0.276,0.463-0.276,0.75V27h7.5	c0.276,0,0.5-0.224,0.5-0.5v-1h-5.321L21,19h-0.026c0.163-0.211,0.276-0.463,0.276-0.75V18z"></path>
                </svg>
            </button>
            
            <button
                onClick={handleWhatsAppChat}
                style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#25d366',
                    color: 'white',
                    borderRadius: '50%',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    padding: '8px'
                }}
                title="Chat WhatsApp"
                >
                <svg width="24" height="24" viewBox="0 0 58 58" fill="currentColor">
                    <path d="M47.683,37.985c-1.316-2.487-6.169-5.331-6.169-5.331c-1.098-0.626-2.423-0.696-3.049,0.42
                    c0,0-1.577,1.891-1.978,2.163c-1.832,1.241-3.529,1.193-5.242-0.52l-3.981-3.981l-3.981-3.981c-1.713-1.713-1.761-3.41-0.52-5.242
                    c0.272-0.401,2.163-1.978,2.163-1.978c1.116-0.627,1.046-1.951,0.42-3.049c0,0-2.844-4.853-5.331-6.169
                    c-1.058-0.56-2.357-0.364-3.203,0.482l-1.758,1.758c-5.577,5.577-2.831,11.873,2.746,17.45l5.097,5.097l5.097,5.097
                    c5.577,5.577,11.873,8.323,17.45,2.746l1.758-1.758C48.048,40.341,48.243,39.042,47.683,37.985z"/>
                </svg>
            </button>
        </div>
      )}
      
      {/* Main toggle button */}
      <button
        onClick={toggleExpand}
        style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#2563eb',
          color: 'white',
          borderRadius: '50%',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)',
          fontSize: '24px',
          transition: 'transform 0.2s'
        }}
        title="Liên hệ hỗ trợ"
      >
        {isExpanded ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default ContactButtons;