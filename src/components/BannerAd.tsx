
import React, { useEffect, useRef } from "react";

const BannerAd: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adContainer = adRef.current;
    if (!adContainer) return;

    // Clean previous ad content if any
    adContainer.innerHTML = "";

    // Use the working rectangle ad config
    const adConfig = {
      key: '7c589340b2a1155dcea92f44cc468438',
      scriptSrc: '//uncertainbill.com/7c589340b2a1155dcea92f44cc468438/invoke.js',
      width: 300,
      height: 250
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

    adContainer.appendChild(optionsScript);
    adContainer.appendChild(invokeScript);

    console.log('Banner Ad: Loading with key:', adConfig.key);

    return () => {
      // Clean up any injected ads when component unmounts
      adContainer.innerHTML = "";
    };
  }, []);

  return (
    <div className="w-full bg-card border-b border-border shadow-sm flex items-center justify-center px-2 py-4 mb-4">
      <div className="flex items-center justify-center w-full max-w-full mx-auto relative" style={{ minHeight: 250 }}>
        {/* The ad will inject the iframe here */}
        <div
          ref={adRef}
          id="banner-ad"
          className="flex justify-center items-center w-full max-w-lg"
          style={{
            minHeight: 250,
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
            height: 250px !important;
            min-height: 250px !important;
          }
        }
        
        @media (min-width: 769px) {
          #banner-ad iframe {
            width: 300px !important;
            height: 250px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BannerAd;
