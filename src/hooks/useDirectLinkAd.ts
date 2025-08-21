import { useEffect, useRef } from 'react';
import { adConfig, shouldShowAds, isAdCooldownPassed, markAdTriggered } from '@/utils/adConfig';

export const useDirectLinkAd = () => {
  const clickCountRef = useRef(0);
  const requiredClicks = 3; // Require 3 clicks before triggering

  useEffect(() => {
    if (!shouldShowAds()) {
      return;
    }

    const handleGlobalClick = () => {
      // Check if short cooldown period has passed (to prevent spam)
      if (!isAdCooldownPassed(adConfig.directLink.sessionKey, 1)) { // 1 minute cooldown instead of 30
        return;
      }

      // Increment click count
      clickCountRef.current += 1;
      console.log(`Direct link ad: Click ${clickCountRef.current}/${requiredClicks}`);

      // Only trigger after required number of clicks
      if (clickCountRef.current >= requiredClicks) {
        // Mark as triggered and open the ad
        markAdTriggered(adConfig.directLink.sessionKey);
        window.open(adConfig.directLink.url, "_blank", "noopener noreferrer");
        console.log('Direct link ad triggered!');
        
        // Reset click count for next cycle
        clickCountRef.current = 0;
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);
};