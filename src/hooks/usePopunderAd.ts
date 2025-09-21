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

    // Set up anti-adblock globals before loading the script
    if (typeof window !== 'undefined') {
      // Common anti-adblock global variables
      (window as any).adBlockEnabled = false;
      (window as any).canRunAds = true;
      (window as any).adsBlocked = false;
      
      // Add console intercept to catch and log anti-adblock errors
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (args[0]?.includes?.('anti') || args[0]?.includes?.('block') || args[0]?.includes?.('command not found')) {
          console.warn('Anti-adblock related error captured:', args);
        }
        originalConsoleError.apply(console, args);
      };
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
        script.onerror = (error) => {
          console.warn('Popunder ad script failed to load:', error);
        };
        
        script.onload = () => {
          // Mark as triggered after successful load
          markAdTriggered(adConfig.popunder.sessionKey);
          console.log('Popunder ad script loaded successfully');
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