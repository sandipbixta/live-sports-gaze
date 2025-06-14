
import React, { useEffect, useRef, useState } from "react";

const BANNER_AD_KEY = "6f9d1f3d2ad1eb4e3efaf82e5571ea37";
const BANNER_SCRIPT_SRC = "//monkeyhundredsarmed.com/6f9d1f3d2ad1eb4e3efaf82e5571ea37/invoke.js";

const BannerAd: React.FC = () => {
  const [closed, setClosed] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (closed) return;
    const adContainer = adRef.current;
    if (!adContainer) return;

    // Clean previous ad content if any
    adContainer.innerHTML = "";

    // 1. Set the inline ad options script
    const optionsScript = document.createElement("script");
    optionsScript.type = "text/javascript";
    optionsScript.innerHTML = `
      atOptions = {
        'key' : '${BANNER_AD_KEY}',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;

    // 2. Set the main ad script
    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = BANNER_SCRIPT_SRC;
    invokeScript.async = true;

    adContainer.appendChild(optionsScript);
    adContainer.appendChild(invokeScript);

    return () => {
      // Clean up any injected ads when component unmounts or closes
      adContainer.innerHTML = "";
    };
  }, [closed]);

  return (
    <div className="w-full bg-white dark:bg-black shadow-md flex items-center justify-center px-2 py-2 z-30 relative">
      <div className="flex items-center justify-center w-full max-w-full mx-auto relative min-h-[90px]">
        {/* The ad will inject the iframe here */}
        <div
          ref={adRef}
          id="banner-ad"
          className="flex justify-center items-center w-full max-w-3xl min-h-[90px]"
          style={{
            minHeight: 60,
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
            height: 60px !important;
            min-height: 60px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BannerAd;
