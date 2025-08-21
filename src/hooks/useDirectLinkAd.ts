import { useEffect } from 'react';
import { adConfig, shouldShowAds } from '@/utils/adConfig';

export const useDirectLinkAd = () => {
  useEffect(() => {
    if (!shouldShowAds()) {
      return;
    }

    const handleGlobalClick = () => {
      // Open the ad on every click
      window.open(adConfig.directLink.url, "_blank", "noopener noreferrer");
    };

    // Add click listener to document
    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);
};