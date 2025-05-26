
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
    if (!adRef.current || type !== 'banner') return;

    // Clear any existing content
    adRef.current.innerHTML = '';

    // Create the ad configuration
    (window as any).atOptions = {
      'key': '6f9d1f3d2ad1eb4e3efaf82e5571ea37',
      'format': 'iframe',
      'height': 90,
      'width': 728,
      'params': {}
    };

    // Create and load the ad script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//monkeyhundredsarmed.com/6f9d1f3d2ad1eb4e3efaf82e5571ea37/invoke.js';
    script.async = true;

    // Add script to the ad container
    adRef.current.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
      // Clean up global atOptions
      delete (window as any).atOptions;
    };
  }, [type]);

  // Fallback dimensions for non-banner ads
  const getAdDimensions = () => {
    switch (type) {
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
      {type === 'banner' ? (
        // Banner ad with script
        <div ref={adRef} className="w-full flex justify-center" />
      ) : (
        // Placeholder for other ad types
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
