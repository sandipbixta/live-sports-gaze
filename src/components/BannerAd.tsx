
import React, { useEffect, useRef } from "react";
import { getBannerAdConfig } from "@/utils/adConfig";
import { useIsMobile } from "@/hooks/use-mobile";

const BannerAd: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const adContainer = adRef.current;
    if (!adContainer) return;

    // Clean previous ad content if any
    adContainer.innerHTML = "";

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

    adContainer.appendChild(optionsScript);
    adContainer.appendChild(invokeScript);

    console.log('Banner Ad: Loading with key:', adConfig.key, 'dimensions:', adConfig.width + 'x' + adConfig.height);

    return () => {
      // Clean up any injected ads when component unmounts
      adContainer.innerHTML = "";
    };
  }, [isMobile]);

  const adConfig = getBannerAdConfig(isMobile);

  return (
    <div className="w-full bg-card border-b border-border shadow-sm flex items-center justify-center px-2 py-2 mb-4">
      <div className="flex items-center justify-center w-full max-w-full mx-auto relative" style={{ minHeight: adConfig.height }}>
        {/* The ad will inject the iframe here */}
        <div
          ref={adRef}
          id="banner-ad"
          className="flex justify-center items-center w-full max-w-4xl"
          style={{
            minHeight: adConfig.height,
            width: "100%",
            overflow: "hidden",
          }}
        />
      </div>
      
      {/* Enhanced responsive CSS */}
      <style>{`
        #banner-ad {
          background: transparent;
          border-radius: 8px;
          overflow: hidden;
        }
        
        #banner-ad iframe {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
