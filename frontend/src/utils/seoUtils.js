// SEO utility functions
export const generateSEOData = {
  home: {
    title: "Du Lịch Huỳnh Vũ - Đặt Xe Du Lịch Uy Tín #1 Việt Nam | datxeviet.com",
    description: "🚗 Dịch vụ đặt xe du lịch uy tín #1 Việt Nam. Tính giá minh bạch, xe đời mới, tài xế kinh nghiệm 10+ năm. ☎️ Hotline: 0985323531. Đặt xe ngay!",
    keywords: "đặt xe du lịch, thuê xe du lịch việt nam, xe 4 chỗ, xe 7 chỗ, tour du lịch, datxeviet, tính giá xe du lịch, thuê xe giá rẻ",
    canonical: "https://datxeviet.com"
  },
  
  booking: {
    title: "Đặt Xe Du Lịch Online - Tính Giá Minh Bạch | Du Lịch Huỳnh Vũ",
    description: "✅ Đặt xe du lịch online nhanh chóng tại datxeviet.com. Tính giá tự động, minh bạch. Xe 4 chỗ, 7 chỗ, tour đặc chuyến. Hotline: 0985323531",
    keywords: "đặt xe du lịch online, tính giá xe du lịch, booking xe du lịch, đặt xe 4 chỗ, đặt xe 7 chỗ, tour đặc chuyến",
    canonical: "https://datxeviet.com/booking"
  },
  
  pricing: {
    title: "Bảng Giá Thuê Xe Du Lịch 2025 - Minh Bạch, Cạnh Tranh | Du Lịch Huỳnh Vũ",
    description: "💰 Bảng giá thuê xe du lịch 2025 cập nhật mới nhất. Xe 4 chỗ từ 700k, xe 7 chỗ từ 800k. Giá cố định, không phát sinh. Xem giá ngay!",
    keywords: "bảng giá thuê xe du lịch, giá xe 4 chỗ, giá xe 7 chỗ, thuê xe vũng tàu, thuê xe hồ tràm, giá thuê xe 2025",
    canonical: "https://datxeviet.com/pricing"
  }
};

// Generate structured data for different page types
export const generateStructuredData = {
  organization: {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Du Lịch Huỳnh Vũ",
    "alternateName": "datxeviet.com",
    "url": "https://datxeviet.com",
    "logo": "https://datxeviet.com/images/logo.png",
    "description": "Dịch vụ đặt xe du lịch uy tín #1 Việt Nam. Tính giá minh bạch, xe đời mới, tài xế kinh nghiệm.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "VN",
      "addressRegion": "Vietnam"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+84985323531",
      "contactType": "customer service",
      "availableLanguage": "Vietnamese"
    },
    "sameAs": [
      "https://www.facebook.com/datxeviet",
      "https://www.instagram.com/datxeviet"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "1000"
    }
  },
  
  breadcrumb: (items) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }),
  
  service: (serviceName, description) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "provider": {
      "@type": "Organization",
      "name": "Du Lịch Huỳnh Vũ"
    },
    "description": description,
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": "2025-12-31"
    }
  })
};

// Common keywords for Vietnam travel
export const vietnamTravelKeywords = [
  "du lịch việt nam",
  "tour việt nam",
  "đặt xe du lịch",
  "thuê xe du lịch",
  "xe 4 chỗ",
  "xe 7 chỗ",
  "hạ long",
  "đà nẵng", 
  "vũng tàu",
  "phú quốc",
  "mũi né",
  "cần thơ",
  "sapa",
  "đà lạt",
  "nha trang",
  "hội an",
  "huế"
];

// Generate meta description with emojis and call-to-action
export const generateMetaDescription = (baseDescription, location = "", service = "") => {
  const emojis = ["🚗", "✅", "💰", "⭐", "📞"];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  
  let description = `${randomEmoji} ${baseDescription}`;
  
  if (location) {
    description += ` Phục vụ khu vực ${location}.`;
  }
  
  if (service) {
    description += ` Chuyên ${service}.`;
  }
  
  description += " ☎️ Hotline: 0985323531";
  
  return description;
};
