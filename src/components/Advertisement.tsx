
import React, { useEffect, useRef } from 'react';

// TypeScript declaration for aclib global
declare global {
  interface Window {
    aclib?: {
      runAutoTag: (options: { zoneId: string }) => void;
    };
  }
}

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video' | 'direct-link' | 'native-bar' | 'autotag';
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
      
    } else if (type === 'native-bar') {
      // Native bar ad - script and container
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//monkeyhundredsarmed.com/a873bc1d3d203f2f13c32a99592441b8/invoke.js';
      
      const container = document.createElement('div');
      container.id = 'container-a873bc1d3d203f2f13c32a99592441b8';
      
      // Add error handling
      script.onerror = () => {
        console.log('Native bar ad script failed to load');
      };
      
      script.onload = () => {
        console.log('Native bar ad script loaded successfully');
      };
      
      adRef.current.appendChild(script);
      adRef.current.appendChild(container);
      
    } else if (type === 'direct-link') {
      // Direct link ad - mobile optimized
      const link = document.createElement('a');
      link.href = 'https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'block w-full h-16 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all text-sm sm:text-base';
      link.innerHTML = '🎯 Exclusive Offers - Click Here!';
      
      adRef.current.appendChild(link);
      
    } else if (type === 'autotag') {
      // AutoTag ad - aclib integration
      // First load the aclib library if not already loaded
      if (!window.aclib) {
        const aclibScript = document.createElement('script');
        aclibScript.type = 'text/javascript';
        aclibScript.src = '//acscdn.com/script/aclib.js';
        aclibScript.async = true;
        
        aclibScript.onload = () => {
          // Run AutoTag after aclib is loaded
          if (window.aclib && window.aclib.runAutoTag) {
            window.aclib.runAutoTag({
              zoneId: 'bz3drbnei2',
            });
          }
        };
        
        aclibScript.onerror = () => {
          console.log('AutoTag aclib script failed to load');
        };
        
        document.head.appendChild(aclibScript);
      } else {
        // aclib already loaded, run AutoTag directly
        window.aclib.runAutoTag({
          zoneId: 'bz3drbnei2',
        });
      }
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
          Advertisement Placeholder ({type}) - {type === 'banner' ? 'Banner: 728x90' : type === 'video' ? 'Video Ad' : type === 'sidebar' ? 'Sidebar Ad' : type === 'native-bar' ? 'Native Bar Ad' : type === 'autotag' ? 'AutoTag Ad' : 'Ad'}
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
        minHeight: type === 'banner' ? '90px' : type === 'video' ? '250px' : type === 'sidebar' ? '200px' : type === 'native-bar' ? '120px' : type === 'autotag' ? '100px' : 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  );
};

export default Advertisement;
