import { useEffect } from 'react';
import { adConfig, shouldShowAds, isAdCooldownPassed, markAdTriggered } from '@/utils/adConfig';
import { adTracking } from '@/utils/adTracking';

export const usePopunderAd = () => {
  useEffect(() => {
    if (!shouldShowAds()) {
      return;
    }

    // Check if cooldown period has passed
    if (!isAdCooldownPassed(adConfig.popunder.sessionKey, adConfig.popunder.cooldownMinutes)) {
      return;
    }

    // Delay the popunder execution
    const timer = setTimeout(() => {
      try {
        // Create script element
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = adConfig.popunder.scriptSrc;
        script.async = true;
        
        // Add error handling
        script.onerror = () => {
          console.warn('Popunder ad script failed to load');
          adTracking.trackPopunderError('Script failed to load');
        };
        
        script.onload = () => {
          // Mark as triggered after successful load
          markAdTriggered(adConfig.popunder.sessionKey);
          adTracking.trackPopunderLoad();
          console.log('[Popunder] Ad loaded successfully');
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
    }, adConfig.popunder.delaySeconds * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);
};