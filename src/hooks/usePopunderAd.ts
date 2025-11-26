import { useEffect } from 'react';
import { adConfig, shouldShowAds, isAdCooldownPassed, markAdTriggered } from '@/utils/adConfig';

export const usePopunderAd = () => {
  useEffect(() => {
    if (!shouldShowAds()) {
      return;
    }

    // Check if cooldown period has passed
    if (!isAdCooldownPassed(adConfig.popunder.sessionKey, adConfig.popunder.cooldownMinutes)) {
      return;
    }

    // Delay execution to free the main thread for INP optimization
    const timer = setTimeout(() => {
      // Further delay to ensure main content renders first
      setTimeout(() => {
        try {
          // Create script element
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = adConfig.popunder.scriptSrc;
          script.defer = true; // Use defer instead of async for better INP
          
          // Add error handling
          script.onerror = () => {
            console.warn('Popunder ad script failed to load');
          };
          
          script.onload = () => {
            // Mark as triggered after successful load
            markAdTriggered(adConfig.popunder.sessionKey);
          };
          
          // Append to head
          document.head.appendChild(script);
          
          // Clean up script after some time to avoid memory leaks
          setTimeout(() => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          }, 10000); // Remove after 10 seconds
          
        } catch (error) {
          console.warn('Error loading popunder ad:', error);
        }
      }, 0); // Zero-delay setTimeout to defer execution after main thread is free
    }, adConfig.popunder.delaySeconds * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);
};