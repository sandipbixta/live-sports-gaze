
import { useEffect, useState } from 'react';

interface PopunderAdProps {
  frequency?: number; // How often to show the ad (in seconds)
}

const PopunderAd: React.FC<PopunderAdProps> = ({ frequency = 1800 }) => { // Default: once every 30 minutes
  const [lastShown, setLastShown] = useState<number | null>(null);
  
  useEffect(() => {
    // Check if we've shown an ad in this session
    const lastAdTime = localStorage.getItem('lastPopunderAdTime');
    if (lastAdTime) {
      setLastShown(parseInt(lastAdTime));
    }
    
    // Load the ad script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//monkeyhundredsarmed.com/ae/f7/eb/aef7eba12c46ca91518228f813db6ce5.js';
    script.async = true;
    document.body.appendChild(script);
    
    // Setup listener for user interaction
    const handleInteraction = () => {
      const currentTime = Date.now();
      
      // Only show ad if enough time has passed since last shown
      if (!lastShown || currentTime - lastShown > frequency * 1000) {
        // 10% chance to show ad on any interaction after frequency timer
        if (Math.random() < 0.1) {
          window.open('https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37', '_blank');
          setLastShown(currentTime);
          localStorage.setItem('lastPopunderAdTime', currentTime.toString());
        }
      }
    };
    
    // Add listeners to potential interactions, but with a delay
    // This ensures it doesn't trigger immediately when page loads
    let hasAddedListeners = false;
    
    const addDelayedListeners = () => {
      if (!hasAddedListeners) {
        setTimeout(() => {
          document.addEventListener('click', handleInteraction, { once: true });
        }, 5000); // Wait 5 seconds after user scrolls/moves before adding click listener
        hasAddedListeners = true;
      }
    };
    
    window.addEventListener('scroll', addDelayedListeners);
    window.addEventListener('mousemove', addDelayedListeners);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', addDelayedListeners);
      window.removeEventListener('mousemove', addDelayedListeners);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [frequency, lastShown]);

  // This component doesn't render anything visible
  return null;
};

export default PopunderAd;
