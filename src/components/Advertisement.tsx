
import React, { useEffect, useRef } from 'react';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video';
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, className = '' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adContainerRef.current) return;
    
    // Clear any previous content
    adContainerRef.current.innerHTML = '';
    
    // Create script element
    const script = document.createElement('script');
    script.type = 'text/javascript';
    
    switch (type) {
      case 'banner':
        // Set script for banner ad
        script.innerHTML = `
          atOptions = {
            'key' : '7c589340b2a1155dcea92f44cc468438',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        `;
        adContainerRef.current.appendChild(script);
        
        // Create the invoke script
        const invokeScript = document.createElement('script');
        invokeScript.type = 'text/javascript';
        invokeScript.src = '//monkeyhundredsarmed.com/7c589340b2a1155dcea92f44cc468438/invoke.js';
        adContainerRef.current.appendChild(invokeScript);
        break;
        
      case 'sidebar':
        // Set script for sidebar ad
        script.src = '//monkeyhundredsarmed.com/2d/10/9c/2d109cea62316aeb5d20389246c3d8a9.js';
        adContainerRef.current.appendChild(script);
        break;
        
      case 'video':
        // Set script for video ad
        script.src = '//monkeyhundredsarmed.com/ae/f7/eb/aef7eba12c46ca91518228f813db6ce5.js';
        adContainerRef.current.appendChild(script);
        break;
    }

    // Clean up function
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [type]);

  return (
    <div 
      ref={adContainerRef} 
      className={`ad-container ${className}`}
      data-ad-type={type}
    />
  );
};

export default Advertisement;
