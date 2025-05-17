
import React, { useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video' | 'popunder';
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, className = '' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!adContainerRef.current) return;

    // Clean up previous ad content
    adContainerRef.current.innerHTML = '';

    // Create and add script based on ad type
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;

    if (type === 'banner') {
      // Configure banner ad - responsive sizing
      const adWidth = isMobile ? 320 : 728;
      const adHeight = isMobile ? 50 : 90;
      
      // Add configuration script
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.text = `
        atOptions = {
          'key' : '6f9d1f3d2ad1eb4e3efaf82e5571ea37',
          'format' : 'iframe',
          'height' : ${adHeight},
          'width' : ${adWidth},
          'params' : {}
        };
      `;
      adContainerRef.current.appendChild(configScript);
      
      // Add invoke script
      script.src = '//monkeyhundredsarmed.com/6f9d1f3d2ad1eb4e3efaf82e5571ea37/invoke.js';
    } else if (type === 'sidebar') {
      // Social bar script - updated to use the provided script
      script.src = '//monkeyhundredsarmed.com/2d/10/9c/2d109cea62316aeb5d20389246c3d8a9.js';
    } else if (type === 'video') {
      // Video ad script (placeholder for future implementation)
      script.src = '//monkeyhundredsarmed.com/ae/f7/eb/aef7eba12c46ca91518228f813db6ce5.js';
    } else if (type === 'popunder') {
      // Popunder ad script (placeholder for future implementation)
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.text = `
        var adConfig = {
          'sub1': '',
          'sub2': '',
          'sub3': '',
          'sub4': '',
          'sub5': ''
        };
      `;
      adContainerRef.current.appendChild(configScript);
      
      script.src = '//monkeyhundredsarmed.com/d7/42/96/d74296ac748d679dcec1c53a6cc49398.js';
    }

    adContainerRef.current.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [type, isMobile]);

  return (
    <div 
      ref={adContainerRef} 
      className={`ad-container ${className} ${
        type === 'banner' ? 'flex justify-center overflow-hidden mb-6' : ''
      } ${
        type === 'sidebar' ? 'w-full my-4' : ''
      } ${
        type === 'banner' && isMobile ? 'scale-90 origin-center transform mx-auto' : ''
      }`}
      data-ad-type={type}
    >
      {/* Placeholder that will be replaced by the ad script */}
      <div className="bg-[#242836] p-3 text-center rounded-lg text-gray-400 w-full">
        <p className="text-xs">Advertisement loading...</p>
      </div>
    </div>
  );
};

export default Advertisement;
