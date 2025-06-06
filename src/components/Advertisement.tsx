
import React, { useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video' | 'popunder';
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, className = '' }) => {
  const isMobile = useIsMobile();
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    // Clear any existing content
    adRef.current.innerHTML = '';

    if (type === 'banner') {
      // Create the banner ad with your provided script
      const atOptionsScript = document.createElement('script');
      atOptionsScript.type = 'text/javascript';
      atOptionsScript.text = `
        atOptions = {
          'key' : '6f9d1f3d2ad1eb4e3efaf82e5571ea37',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = '//monkeyhundredsarmed.com/6f9d1f3d2ad1eb4e3efaf82e5571ea37/invoke.js';
      invokeScript.async = true;

      adRef.current.appendChild(atOptionsScript);
      adRef.current.appendChild(invokeScript);
    } else if (type === 'video') {
      // Create the video ad with your provided script
      const videoScript = document.createElement('script');
      videoScript.type = 'text/javascript';
      videoScript.src = '//monkeyhundredsarmed.com/ae/f7/eb/aef7eba12c46ca91518228f813db6ce5.js';
      videoScript.async = true;

      adRef.current.appendChild(videoScript);
    }

    return () => {
      // Cleanup on unmount
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [type]);

  // Fallback dimensions for non-banner ads
  const getAdDimensions = () => {
    switch (type) {
      case 'banner':
        return {
          width: isMobile ? '320px' : '728px',
          height: '90px'
        };
      case 'sidebar':
        return {
          width: '300px',
          height: '250px'
        };
      case 'video':
        return {
          width: '300px',
          height: '250px'
        };
      default:
        return {
          width: '300px',
          height: '250px'
        };
    }
  };

  const dimensions = getAdDimensions();

  if (type === 'popunder') {
    // Popunder doesn't need visible content
    return null;
  }

  return (
    <div 
      className={`ad-container ${className} ${
        type === 'banner' ? 'flex justify-center overflow-hidden mb-6' : ''
      } ${
        type === 'sidebar' ? 'w-full my-4' : ''
      } ${
        type === 'banner' && isMobile ? 'scale-90 origin-center transform mx-auto' : ''
      }`}
      data-ad-type={type}
    >
      {(type === 'banner' || type === 'video') ? (
        // Real ad with provided scripts
        <div ref={adRef} className="w-full flex justify-center" />
      ) : (
        // Placeholder for sidebar ads
        <div 
          className="bg-[#242836] border border-[#343a4d] rounded-lg flex items-center justify-center text-gray-400"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            maxWidth: '100%'
          }}
        >
          <div className="text-center p-2">
            <div className="text-xs opacity-60 mb-1">Advertisement</div>
            <div className="text-[10px] opacity-40">Space Available</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advertisement;
