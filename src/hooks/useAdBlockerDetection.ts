import { useState, useEffect } from 'react';

export const useAdBlockerDetection = () => {
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const detectAdBlocker = async () => {
      try {
        // Method 1: Try to fetch a known ad URL
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox ad-placement carbon-ads';
        testAd.style.cssText = 'height: 1px; width: 1px; position: absolute; left: -9999px;';
        document.body.appendChild(testAd);

        // Wait a bit for ad blockers to process
        await new Promise(resolve => setTimeout(resolve, 100));

        // Check if the element was blocked or hidden
        const isBlocked = 
          testAd.offsetHeight === 0 || 
          testAd.offsetWidth === 0 || 
          window.getComputedStyle(testAd).display === 'none' ||
          window.getComputedStyle(testAd).visibility === 'hidden';

        document.body.removeChild(testAd);

        // Method 2: Check for common ad-blocker artifacts
        const hasAdBlockerArtifacts = 
          // Check if fetch to ad domains fails
          await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store'
          }).then(() => false).catch(() => true);

        setIsAdBlockerDetected(isBlocked || hasAdBlockerArtifacts);
      } catch (error) {
        // If any error occurs, assume ad blocker might be present
        console.log('Ad blocker detection error:', error);
        setIsAdBlockerDetected(true);
      } finally {
        setIsChecking(false);
      }
    };

    detectAdBlocker();
  }, []);

  return { isAdBlockerDetected, isChecking };
};
