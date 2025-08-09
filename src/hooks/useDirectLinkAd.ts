import { useEffect } from 'react';

const AD_URL = "https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37";
const SESSION_KEY = "directLinkAdOpened";

export const useDirectLinkAd = () => {
  useEffect(() => {
    const handleGlobalClick = () => {
      // Check if ad was already opened in this session
      if (sessionStorage.getItem(SESSION_KEY)) {
        return;
      }

      // Mark as opened and open the ad
      sessionStorage.setItem(SESSION_KEY, "true");
      window.open(AD_URL, "_blank", "noopener noreferrer");
    };

    // Add click listener to document
    document.addEventListener('click', handleGlobalClick, { once: true });

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);
};