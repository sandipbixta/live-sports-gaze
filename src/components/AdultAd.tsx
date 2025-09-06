import React, { useState } from "react";
import { shouldShowAds } from "@/utils/adConfig";

const AdultAd: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAdultAdClick = () => {
    if (!shouldShowAds() || isLoading) return;

    setIsLoading(true);

    try {
      // Create the ad options script
      const optionsScript = document.createElement("script");
      optionsScript.type = "text/javascript";
      optionsScript.innerHTML = `
        atOptions = {
          'key' : 'aef1978a837e09b2a4db7546aaaf55e4',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;

      // Create the main ad script
      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = "//uncertainbill.com/aef1978a837e09b2a4db7546aaaf55e4/invoke.js";
      invokeScript.async = true;

      // Add scripts to head
      document.head.appendChild(optionsScript);
      document.head.appendChild(invokeScript);

      // Clean up after some time
      setTimeout(() => {
        if (optionsScript.parentNode) {
          optionsScript.parentNode.removeChild(optionsScript);
        }
        if (invokeScript.parentNode) {
          invokeScript.parentNode.removeChild(invokeScript);
        }
        setIsLoading(false);
      }, 5000);

    } catch (error) {
      console.warn('Error loading adult ad:', error);
      setIsLoading(false);
    }
  };

  if (!shouldShowAds()) {
    return null;
  }

  return (
    <div className="fixed bottom-32 right-4 z-50 md:bottom-20">
      <button
        onClick={handleAdultAdClick}
        disabled={isLoading}
        className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50"
        title="18+ Adult Content"
      >
        {isLoading ? "..." : "18+"}
      </button>
    </div>
  );
};

export default AdultAd;