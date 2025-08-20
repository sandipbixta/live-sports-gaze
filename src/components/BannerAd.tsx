
import React, { useEffect, useRef, useState } from "react";
import { getBannerAdConfig } from "@/utils/adConfig";
import { useIsMobile } from "@/hooks/use-mobile";

const BannerAd: React.FC = () => {
  const [closed, setClosed] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (closed) return;
    const adContainer = adRef.current;
    if (!adContainer) return;

    // Clean previous ad content if any
    adContainer.innerHTML = "";

    // Get appropriate ad config based on device
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

    return () => {
      // Clean up any injected ads when component unmounts or closes
      adContainer.innerHTML = "";
    };
  }, [closed, isMobile]);

  const adConfig = getBannerAdConfig(isMobile);

  return (
    <div className="w-full bg-background shadow-md flex items-center justify-center px-2 py-2 z-30 relative">
      <div className="flex items-center justify-center w-full max-w-full mx-auto relative" style={{ minHeight: adConfig.height }}>
        {/* The ad will inject the iframe here */}
        <div
          ref={adRef}
          id="banner-ad"
          className="flex justify-center items-center w-full max-w-3xl"
          style={{
            minHeight: adConfig.height,
            width: "100%",
            overflow: "hidden",
          }}
        />
      </div>
      {/* Responsive CSS for smaller screens */}
      <style>{`
        @media (max-width: 768px) {
          #banner-ad iframe {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100vw !important;
            height: ${adConfig.height}px !important;
            min-height: ${adConfig.height}px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BannerAd;
