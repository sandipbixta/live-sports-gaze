
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

    // Create and load the Google AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5505494656170063';
    script.crossOrigin = 'anonymous';

    // Add script to the ad container
    adRef.current.appendChild(script);

    // Create the ad unit
    const adUnit = document.createElement('ins');
    adUnit.className = 'adsbygoogle';
    adUnit.style.display = 'block';
    adUnit.setAttribute('data-ad-client', 'ca-pub-5505494656170063');
    adUnit.setAttribute('data-ad-slot', '1234567890'); // You'll need to replace this with your actual ad slot ID
    adUnit.setAttribute('data-ad-format', 'auto');
    adUnit.setAttribute('data-full-width-responsive', 'true');

    adRef.current.appendChild(adUnit);

    // Initialize the ad
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
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
        // Banner ad with Google AdSense script
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
