import React, { useEffect } from "react";
import { adConfig, shouldShowAds, isAdCooldownPassed, markAdTriggered } from "@/utils/adConfig";

const SocialBarAd: React.FC = () => {
  useEffect(() => {
    if (!shouldShowAds()) return;

    // Check cooldown (5 minutes for social bar)
    if (!isAdCooldownPassed('socialBarAdTriggered', 5)) {
      return;
    }

    try {
      // Create script element
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = adConfig.socialBar.scriptSrc;
      script.async = true;
      
      script.onload = () => {
        markAdTriggered('socialBarAdTriggered');
      };
      
      script.onerror = () => {
        console.warn('Social bar ad script failed to load');
      };
      
      // Append to head
      document.head.appendChild(script);
      
      // Clean up script after some time
      setTimeout(() => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }, 15000);
      
    } catch (error) {
      console.warn('Error loading social bar ad:', error);
    }
  }, []);

  // This component doesn't render anything visible
  // The social bar script handles its own rendering
  return null;
};

export default SocialBarAd;