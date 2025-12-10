import { useRef, useCallback } from 'react';
import { 
  adConfig, 
  shouldShowAds, 
  isAdCooldownPassed, 
  markAdTriggered,
  wasAdShownThisSession,
  markAdShownThisSession
} from '@/utils/adConfig';
import { adTracking } from '@/utils/adTracking';

/**
 * Hook that returns a function to trigger popunder ad on play button click
 * Respects 4-hour cooldown and session limits
 */
export const usePopunderAd = () => {
  const hasTriggeredRef = useRef(false);

  const triggerPopunder = useCallback(() => {
    // Prevent multiple triggers in the same component lifecycle
    if (hasTriggeredRef.current) {
      console.log('⏳ Popunder already triggered this session');
      return;
    }

    if (!shouldShowAds()) {
      return;
    }

    // Check session-level flag first (prevents SPA navigation re-triggers)
    if (wasAdShownThisSession(adConfig.popunder.sessionKey)) {
      console.log('⏳ Popunder already shown this session');
      return;
    }

    // Check if cooldown period has passed (4 hours)
    if (!isAdCooldownPassed(adConfig.popunder.sessionKey, adConfig.popunder.cooldownMinutes)) {
      return;
    }

    // Mark as triggered IMMEDIATELY to prevent race conditions
    hasTriggeredRef.current = true;
    markAdTriggered(adConfig.popunder.sessionKey);
    markAdShownThisSession(adConfig.popunder.sessionKey);
    console.log('🎯 Popunder ad triggered on play click!');

    try {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = adConfig.popunder.scriptSrc;
      script.async = true;
      
      script.onerror = () => {
        console.warn('Popunder ad script failed to load');
        adTracking.trackPopunderError('Script failed to load');
      };
      
      script.onload = () => {
        adTracking.trackPopunderLoad();
        console.log('✅ Popunder script loaded successfully');
      };
      
      document.head.appendChild(script);
      
      // Clean up script after 10 seconds
      setTimeout(() => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }, 10000);
      
    } catch (error) {
      console.warn('Error loading popunder ad:', error);
    }
  }, []);

  return { triggerPopunder };
};
