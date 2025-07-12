import React, { useEffect, useRef } from 'react';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video' | 'direct-link';
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, className = '' }) => {
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!adRef.current || process.env.NODE_ENV === 'development') return;
    
    // Clean previous content
    adRef.current.innerHTML = '';
    
    if (type === 'banner') {
      // Create a centered container for the banner ad
      const adContainer = document.createElement('div');
      adContainer.style.display = 'flex';
      adContainer.style.justifyContent = 'center';
      adContainer.style.alignItems = 'center';
      adContainer.style.width = '100%';
      adContainer.style.overflow = 'hidden';
      adContainer.style.minHeight = '90px';
      
      // Banner ad configuration - responsive for mobile
      const script1 = document.createElement('script');
      script1.type = 'text/javascript';
      script1.innerHTML = `
        atOptions = {
          'key' : '6f9d1f3d2ad1eb4e3efaf82e5571ea37',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      
      const script2 = document.createElement('script');
      script2.type = 'text/javascript';
      script2.src = '//monkeyhundredsarmed.com/6f9d1f3d2ad1eb4e3efaf82e5571ea37/invoke.js';
      script2.async = true;
      
      // Add error handling
      script2.onerror = () => {
        console.log('Banner ad script failed to load');
      };
      
      script2.onload = () => {
        console.log('Banner ad script loaded successfully');
      };
      
      adContainer.appendChild(script1);
      adContainer.appendChild(script2);
      adRef.current.appendChild(adContainer);
      
    } else if (type === 'sidebar') {
      // Sidebar ad - new social bar ad script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//monkeyhundredsarmed.com/2d/10/9c/2d109cea62316aeb5d20389246c3d8a9.js';
      script.async = true;
      
      // Add error handling
      script.onerror = () => {
        console.log('Sidebar ad script failed to load');
      };
      
      script.onload = () => {
        console.log('Sidebar ad script loaded successfully');
      };
      
      adRef.current.appendChild(script);
      
    } else if (type === 'video') {
      // Video ad - new ad script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//monkeyhundredsarmed.com/ae/f7/eb/aef7eba12c46ca91518228f813db6ce5.js';
      script.async = true;
      
      // Add error handling
      script.onerror = () => {
        console.log('Video ad script failed to load');
      };
      
      script.onload = () => {
        console.log('Video ad script loaded successfully');
      };
      
      adRef.current.appendChild(script);
      
    } else if (type === 'direct-link') {
      // Direct link ad - mobile optimized
      const link = document.createElement('a');
      link.href = 'https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'block w-full h-16 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all text-sm sm:text-base';
      link.innerHTML = '🎯 Exclusive Offers - Click Here!';
      
      adRef.current.appendChild(link);
    }
    
    return () => {
      // Clean up when component unmounts
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [type]);
  
  // Don't show ads in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`bg-gray-200 dark:bg-gray-800 rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Advertisement Placeholder ({type}) - {type === 'banner' ? 'Banner: 728x90' : type === 'video' ? 'Video Ad' : type === 'sidebar' ? 'Sidebar Ad' : 'Ad'}
        </p>
      </div>
    );
  }
  
  return (
    <div 
      ref={adRef} 
      className={`ad-container flex justify-center items-center overflow-hidden min-h-[90px] w-full ${className}`} 
      data-ad-type={type}
      style={{ 
        minHeight: type === 'banner' ? '90px' : type === 'video' ? '250px' : type === 'sidebar' ? '200px' : 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  );
};

export default Advertisement;
