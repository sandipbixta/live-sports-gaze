
import React, { useEffect } from 'react';

const PopunderAd: React.FC = () => {
  useEffect(() => {
    // Only trigger popunder once per session and after user interaction
    const handleUserInteraction = () => {
      if (!sessionStorage.getItem('popunder_loaded')) {
        // Small delay to ensure it's triggered after user action
        setTimeout(() => {
          window.open('https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37', '_blank');
          sessionStorage.setItem('popunder_loaded', 'true');
        }, 1000);
      }
      // Remove listener after first trigger
      document.removeEventListener('click', handleUserInteraction);
    };

    // Add click listener for user interaction
    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  return null; // This component doesn't render anything visible
};

export default PopunderAd;
