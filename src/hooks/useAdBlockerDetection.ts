import { useState, useEffect } from 'react';

// Whitelist of allowed browsers
const ALLOWED_BROWSERS = ['Chrome', 'Safari', 'Edge', 'Firefox'];

// Detect browser type
const detectBrowser = (): string => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edg')) return 'Edge';
  if (userAgent.includes('Firefox')) return 'Firefox';
  
  return 'Unknown';
};

export const useAdBlockerDetection = () => {
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);
  const [isUnsupportedBrowser, setIsUnsupportedBrowser] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const detectAdBlocker = async () => {
      try {
        // Step 1: Check browser whitelist
        const browserName = detectBrowser();
        const isBrowserAllowed = ALLOWED_BROWSERS.includes(browserName);
        
        if (!isBrowserAllowed) {
          setIsUnsupportedBrowser(true);
          setIsChecking(false);
          return;
        }

        // Step 2: Multiple AdBlock Detection Methods
        
        // Method 1: CSS Class Bait Element (ad-banner, ad-container)
        const baitElement = document.createElement('div');
        baitElement.className = 'ad-banner ad-container ad-placement adsbox';
        baitElement.style.cssText = 'height: 1px; width: 1px; position: absolute; left: -9999px; top: -9999px;';
        document.body.appendChild(baitElement);

        // Method 2: Fake Ad Script Loading Test
        const scriptBait = document.createElement('script');
        scriptBait.src = '/ads.js';
        scriptBait.type = 'text/javascript';
        let scriptBlocked = false;
        
        scriptBait.onerror = () => {
          scriptBlocked = true;
        };
        
        document.head.appendChild(scriptBait);

        // Wait for ad blockers to process
        await new Promise(resolve => setTimeout(resolve, 150));

        // Check Method 1: CSS element visibility
        const isBaitHidden = 
          baitElement.offsetHeight === 0 || 
          baitElement.offsetWidth === 0 || 
          window.getComputedStyle(baitElement).display === 'none' ||
          window.getComputedStyle(baitElement).visibility === 'hidden';

        // Clean up bait elements
        document.body.removeChild(baitElement);
        document.head.removeChild(scriptBait);

        // Method 3: Google AdSense fetch test (disabled to reduce false positives)
        // Network errors can occur for many reasons, not just ad blockers
        
        // Method 4: Check for common adblocker window properties
        const hasAdBlockerProperties = 
          (window as any).canRunAds === false;

        // Require MULTIPLE methods to detect adblock to reduce false positives
        // Only block if bait is hidden AND either script was blocked OR adblocker properties detected
        const detectionCount = [isBaitHidden, scriptBlocked, hasAdBlockerProperties].filter(Boolean).length;
        const adBlockDetected = detectionCount >= 2;
        
        setIsAdBlockerDetected(adBlockDetected);
        
        console.log('🛡️ AdBlock Detection Results:', {
          browser: browserName,
          baitHidden: isBaitHidden,
          scriptBlocked,
          hasAdBlockerProperties,
          detectionCount,
          finalResult: adBlockDetected
        });

      } catch (error) {
        console.log('Ad blocker detection error:', error);
        // Don't block on detection errors - assume no ad blocker
        setIsAdBlockerDetected(false);
      } finally {
        setIsChecking(false);
      }
    };

    detectAdBlocker();
  }, []);

  return { isAdBlockerDetected, isUnsupportedBrowser, isChecking };
};
