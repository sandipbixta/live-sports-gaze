
import React, { useEffect, useRef, useState } from "react";
import { getBannerAdConfig } from "@/utils/adConfig";
import { useIsMobile } from "@/hooks/use-mobile";

const BannerAd: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const adContainer = adRef.current;
    if (!adContainer) return;

    // Clean previous ad content if any
    adContainer.innerHTML = "";
    setAdLoaded(false);

    // Get the proper banner ad config (same as home page)
    const adConfig = getBannerAdConfig(isMobile);

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
    };

    adContainer.appendChild(optionsScript);
    adContainer.appendChild(invokeScript);

    console.log('Banner Ad: Loading with key:', adConfig.key, 'dimensions:', adConfig.width + 'x' + adConfig.height);

    return () => {
      // Clean up any injected ads when component unmounts
      adContainer.innerHTML = "";
      setAdLoaded(false);
    };
  }, [isMobile]);

  const adConfig = getBannerAdConfig(isMobile);

  return (
    <div className="w-full bg-transparent flex items-center justify-center px-2 py-2 mb-4">
      <div className="flex items-center justify-center w-full max-w-full mx-auto relative bg-white rounded-lg" style={{ minHeight: adConfig.height }}>
        {/* The ad will inject the iframe here */}
        <div
          ref={adRef}
          id="banner-ad"
          className="flex justify-center items-center w-full"
          style={{
            minHeight: adConfig.height,
            width: "100%",
            overflow: "hidden",
            background: "white",
          }}
        />
        
        {/* Loading indicator */}
        {!adLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-600 text-sm rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Loading advertisement...
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
            min-height: ${adConfig.height}px !important;
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
