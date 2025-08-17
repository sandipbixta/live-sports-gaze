import { useCallback, useRef } from 'react';

const POPUNDER_URL = 'https://finisheddisdainsmug.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37';
const SESSION_KEY = 'popunder_shown';

export const usePopunderAd = () => {
  const hasShownRef = useRef(sessionStorage.getItem(SESSION_KEY) === 'true');

  const triggerPopunder = useCallback(() => {
    // Only show once per session
    if (hasShownRef.current) {
      return;
    }

    try {
      // Mark as shown
      hasShownRef.current = true;
      sessionStorage.setItem(SESSION_KEY, 'true');

      // Create popunder effect
      const popunder = window.open(POPUNDER_URL, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      
      // Focus back to main window after a short delay (popunder effect)
      setTimeout(() => {
        window.focus();
        if (popunder) {
          popunder.blur();
        }
      }, 100);
    } catch (error) {
      console.error('Failed to trigger popunder ad:', error);
    }
  }, []);

  return { triggerPopunder };
};