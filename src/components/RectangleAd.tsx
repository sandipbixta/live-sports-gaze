import React, { useEffect, useRef } from "react";
import { adConfig, shouldShowAds } from "@/utils/adConfig";

const RectangleAd: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shouldShowAds()) return;
    
    const adContainer = adRef.current;
    if (!adContainer) return;

    // Clean previous ad content if any
    adContainer.innerHTML = "";

    // 1. Set the inline ad options script
    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.innerHTML = `
      atOptions = {
        'key' : '${adConfig.rectangle.key}',
        'format' : 'iframe',
        'height' : ${adConfig.rectangle.height},
        'width' : ${adConfig.rectangle.width},
        'params' : {}
      };
    `;

    // 2. Set the main ad script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = adConfig.rectangle.scriptSrc;
    invokeScript.async = true;

    adContainer.appendChild(optionsScript);
    adContainer.appendChild(invokeScript);

    return () => {
      // Clean up any injected ads when component unmounts
      if (adContainer) {
        adContainer.innerHTML = "";
      }
    };
  }, []);

  if (!shouldShowAds()) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-center py-4">
      <div
        ref={adRef}
        className="w-full max-w-sm mx-auto"
        style={{
          minHeight: adConfig.rectangle.height,
          width: adConfig.rectangle.width,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      />
    </div>
  );
};

export default RectangleAd;