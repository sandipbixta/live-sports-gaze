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

      // Create a container for the ad
      let adContainer = document.getElementById('adult-ad-container');
      if (!adContainer) {
        adContainer = document.createElement('div');
        adContainer.id = 'adult-ad-container';
        adContainer.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 9999;
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          max-width: 90vw;
          max-height: 90vh;
          overflow: auto;
        `;
        document.body.appendChild(adContainer);
      }

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

      // Add error handling
      invokeScript.onerror = () => {
        console.error('18+ Ad: Failed to load ad script');
        if (adContainer) {
          adContainer.innerHTML = '<p style="color: red;">Ad failed to load. Please check your ad blocker settings.</p>';
        }
        setIsLoading(false);
      };

      invokeScript.onload = () => {
        console.log('18+ Ad: Script loaded successfully');
        // Try to find and move the ad to our container
        setTimeout(() => {
          const adElements = document.querySelectorAll('[id*="' + adConfig.adult.key + '"]');
          if (adElements.length > 0 && adContainer) {
            adElements.forEach(el => {
              if (el.parentNode !== adContainer) {
                adContainer.appendChild(el);
              }
            });
          } else {
            // Fallback: show a message that ad should be loading
            if (adContainer) {
              adContainer.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                  <p>🔞 Adult content ad is loading...</p>
                  <p style="font-size: 12px; color: #666;">If you don't see the ad, please disable your ad blocker.</p>
                  <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; border: 1px solid #ccc; background: #f0f0f0; cursor: pointer;">Close</button>
                </div>
              `;
            }
          }
        }, 1000);
      };

      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9998;
      `;
      backdrop.onclick = () => {
        backdrop.remove();
        if (adContainer) adContainer.remove();
      };
      document.body.appendChild(backdrop);

      // Add scripts to head
      document.head.appendChild(optionsScript);
      document.head.appendChild(invokeScript);

      console.log('18+ Ad: Scripts added to page');

      // Clean up after some time
      setTimeout(() => {
        if (optionsScript.parentNode) {
          optionsScript.parentNode.removeChild(optionsScript);
        }
        if (invokeScript.parentNode) {
          invokeScript.parentNode.removeChild(invokeScript);
        }
        setIsLoading(false);
      }, 30000); // 30 seconds

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