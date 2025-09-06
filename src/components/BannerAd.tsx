
import React, { useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const BannerAd: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  useEffect(() => {
    const adContainer = adRef.current;
    if (!adContainer) return;

    // Clean previous ad content if any
    adContainer.innerHTML = "";
    setAdLoaded(false);
    setAdError(false);

    // Use the exact script configuration you provided
    const adConfig = {
      key: '6f9d1f3d2ad1eb4e3efaf82e5571ea37',
      height: 90,
      width: 728,
      scriptSrc: '//uncertainbill.com/6f9d1f3d2ad1eb4e3efaf82e5571ea37/invoke.js'
    };

    // 1. Set the inline ad options script
    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.innerHTML = `
      atOptions = {
        'key' : '${adConfig.key}',
        'format' : 'iframe',
        'height' : ${adConfig.height},
        'width' : ${adConfig.width},
        'params' : {}
      };
    `;

    // 2. Set the main ad script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = adConfig.scriptSrc;
    invokeScript.async = true;

    // Add load event listener
    invokeScript.onload = () => {
      console.log('Banner Ad: Script loaded successfully');
      setTimeout(() => {
        const iframe = adContainer.querySelector('iframe');
        if (iframe) {
          setAdLoaded(true);
          console.log('Banner Ad: iframe found and loaded');
        } else {
          console.warn('Banner Ad: No iframe found after script load');
        }
      }, 2000);
    };

    invokeScript.onerror = () => {
      console.error('Banner Ad: Failed to load script');
      setAdError(true);
    };

    adContainer.appendChild(optionsScript);
    adContainer.appendChild(invokeScript);

    console.log('Banner Ad: Loading with key:', adConfig.key, 'dimensions:', adConfig.width + 'x' + adConfig.height);

    return () => {
      // Clean up any injected ads when component unmounts
      adContainer.innerHTML = "";
      setAdLoaded(false);
      setAdError(false);
    };
  }, [isMobile]);

  // Don't render anything if ad failed to load
  if (adError) {
    return null;
  }

  const adConfig = {
    height: 90,
    width: 728
  };

  return (
    <div className="w-full bg-transparent flex items-center justify-center px-2 py-2 mb-4">
      <div className="flex items-center justify-center w-full max-w-full mx-auto relative bg-white rounded-lg" style={{ height: adConfig.height }}>
        {/* The ad will inject the iframe here */}
        <div
          ref={adRef}
          id="banner-ad"
          className="flex justify-center items-center w-full"
          style={{
            height: adConfig.height,
            width: "100%",
            overflow: "hidden",
            background: "white",
          }}
        />
        
        {/* Loading indicator */}
        {!adLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-600 text-xs rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Loading ad...
            </div>
          </div>
        )}
      </div>
      
      {/* Enhanced responsive CSS */}
      <style>{`
        #banner-ad {
          background: white !important;
          border-radius: 8px;
          overflow: hidden;
        }
        
        #banner-ad iframe {
          border-radius: 8px;
          border: none !important;
          background: white !important;
        }
        
        @media (max-width: 768px) {
          #banner-ad iframe {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100vw !important;
            height: ${adConfig.height}px !important;
          }
        }
        
        @media (min-width: 769px) {
          #banner-ad iframe {
            width: ${adConfig.width}px !important;
            height: ${adConfig.height}px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BannerAd;
