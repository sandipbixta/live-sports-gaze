import { useEffect, useRef } from 'react';
import { trackAdEvent } from '@/utils/adTracking';

const INTERSTITIAL_COOLDOWN = 6 * 60 * 60 * 1000; // 6 hours - optimized for revenue
const INTERSTITIAL_SCRIPT_ID = 'adsterra-interstitial';

export const useInterstitialAd = (trigger: boolean) => {
  const hasShown = useRef(false);

  useEffect(() => {
    if (!trigger || hasShown.current) return;

    const lastShown = localStorage.getItem('last_interstitial_ad');
    const now = Date.now();

    // Check cooldown
    if (lastShown && now - parseInt(lastShown) < INTERSTITIAL_COOLDOWN) {
      console.log('⏰ Interstitial ad on cooldown');
      return;
    }

    // Load interstitial ad script
    const loadInterstitialAd = () => {
      if (document.getElementById(INTERSTITIAL_SCRIPT_ID)) return;

      console.log('🎯 Loading interstitial ad');
      
      const script = document.createElement('script');
      script.id = INTERSTITIAL_SCRIPT_ID;
      script.src = '//pl25129163.profitablecpmrate.com/41/65/93/4165939f1e85d6f8b8c0f2c7c2e8a0f6.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ Interstitial ad loaded');
        trackAdEvent('impression', 'interstitial', 'page-navigation');
        localStorage.setItem('last_interstitial_ad', now.toString());
        hasShown.current = true;
      };

      document.body.appendChild(script);
    };

    // Delay to avoid disrupting UX
    const timer = setTimeout(loadInterstitialAd, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [trigger]);
};
