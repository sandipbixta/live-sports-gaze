import React, { useEffect, useRef } from 'react';
import { adConfig, shouldShowAds } from '@/utils/adConfig';

interface AdultBannerAdProps {
  type?: 'mobile' | 'sidebar';
  className?: string;
}

const AdultBannerAd: React.FC<AdultBannerAdProps> = ({ 
  type = 'mobile', 
  className = '' 
}) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!shouldShowAds() || scriptLoadedRef.current) return;

    const config = adConfig.adult[type];
    
    if (adContainerRef.current && config) {
      // Set up the atOptions global variable
      (window as any).atOptions = {
        'key': config.key,
        'format': 'iframe',
        'height': config.height,
        'width': config.width,
        'params': {}
      };

      // Create and append the script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = config.scriptSrc;
      script.async = true;
      
      // Append to the ad container
      adContainerRef.current.appendChild(script);
      scriptLoadedRef.current = true;
    }

    return () => {
      scriptLoadedRef.current = false;
    };
  }, [type]);

  if (!shouldShowAds()) {
    return null;
  }

  const config = adConfig.adult[type];

  return (
    <div 
      className={`flex justify-center items-center bg-muted/10 rounded-lg border border-border/20 ${className}`}
      style={{ 
        minWidth: `${config.width}px`, 
        minHeight: `${config.height}px`,
        maxWidth: `${config.width}px`, 
        maxHeight: `${config.height}px`
      }}
    >
      <div 
        ref={adContainerRef}
        className="w-full h-full flex justify-center items-center"
        style={{ 
          width: `${config.width}px`, 
          height: `${config.height}px` 
        }}
      />
    </div>
  );
};

export default AdultBannerAd;