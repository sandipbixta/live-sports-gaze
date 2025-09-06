import React, { useState } from "react";
import { shouldShowAds, adConfig, isAdCooldownPassed, markAdTriggered } from "@/utils/adConfig";

const AdultAd: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAdultAdClick = () => {
    if (!shouldShowAds() || isLoading) return;

    // Check cooldown period
    if (!isAdCooldownPassed(adConfig.adult.sessionKey, adConfig.adult.cooldownMinutes)) {
      console.log('18+ Ad: Still in cooldown period');
      return;
    }

    setIsLoading(true);
    console.log('18+ Ad: Button clicked, loading adult ad...');

    try {
      // Mark ad as triggered
      markAdTriggered(adConfig.adult.sessionKey);

      // Create the ad options script
      const optionsScript = document.createElement("script");
      optionsScript.type = "text/javascript";
      optionsScript.innerHTML = `
        atOptions = {
          'key' : '${adConfig.adult.key}',
          'format' : '${adConfig.adult.format}',
          'height' : ${adConfig.adult.height},
          'width' : ${adConfig.adult.width},
          'params' : {}
        };
      `;
      
      console.log('18+ Ad: Loading adult ad script with new config...');

      // Create the main ad script
      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src = adConfig.adult.scriptSrc;
      invokeScript.async = true;

      // Add scripts to head
      document.head.appendChild(optionsScript);
      document.head.appendChild(invokeScript);

      console.log('18+ Ad: Scripts loaded successfully');

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