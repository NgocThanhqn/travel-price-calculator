import { useEffect } from 'react';

const SEOHead = ({ 
  title = "Du Lịch Huỳnh Vũ - Đặt Xe Du Lịch Uy Tín | datxeviet.com",
  description = "Du Lịch Huỳnh Vũ - Dịch vụ đặt xe du lịch uy tín #1 Việt Nam. Tính giá minh bạch, xe đời mới, tài xế kinh nghiệm. Hotline: 0985323531. Đặt xe ngay tại datxeviet.com!",
  keywords = "đặt xe du lịch, thuê xe du lịch, xe 4 chỗ, xe 7 chỗ, tour du lịch, datxeviet, du lịch việt nam, tính giá xe du lịch",
  canonical = "https://datxeviet.com",
  ogImage = "https://datxeviet.com/images/og-image.jpg",
  structuredData = null
}) => {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMetaTag = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let metaTag = document.querySelector(selector);
      
      if (metaTag) {
        metaTag.setAttribute('content', content);
      } else {
        metaTag = document.createElement('meta');
        if (property) {
          metaTag.setAttribute('property', name);
        } else {
          metaTag.setAttribute('name', name);
        }
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    };
    
    // Update basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Update Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:url', canonical, true);
    updateMetaTag('og:image', ogImage, true);
    
    // Update Twitter Card tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    
    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonical);
      document.head.appendChild(canonicalLink);
    }
    
    // Add structured data if provided
    if (structuredData) {
      const existingScript = document.querySelector('script[data-seo-structured-data]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-structured-data', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
    
  }, [title, description, keywords, canonical, ogImage, structuredData]);
  
  return null; // This component doesn't render anything
};

export default SEOHead;
