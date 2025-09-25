import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateStructuredData } from '../utils/seoUtils';

const Breadcrumb = ({ items }) => {
  useEffect(() => {
    // Add breadcrumb structured data
    const breadcrumbData = generateStructuredData.breadcrumb(items);
    
    const existingScript = document.querySelector('script[data-breadcrumb-structured-data]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb-structured-data', 'true');
    script.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(script);
    
    return () => {
      const scriptToRemove = document.querySelector('script[data-breadcrumb-structured-data]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [items]);

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <i className="fas fa-chevron-right text-gray-400" aria-hidden="true"></i>
              )}
              {index === items.length - 1 ? (
                <span className="text-gray-600" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link 
                  to={item.url} 
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {index === 0 && <i className="fas fa-home mr-1" aria-hidden="true"></i>}
                  {item.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;
