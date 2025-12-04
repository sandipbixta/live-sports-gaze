import { useEffect, useCallback } from 'react';

/**
 * Hook to protect iframes from opening popups and ads
 */
export const useIframeProtection = (iframeRef: React.RefObject<HTMLIFrameElement>) => {
  
  const setupIframeProtection = useCallback((iframe: HTMLIFrameElement) => {
    if (!iframe) return;
    
    try {
      // Block iframe from opening new windows/popups
      const contentWindow = iframe.contentWindow;
      if (contentWindow) {
        contentWindow.open = function() { 
          console.log('🛡️ Blocked popup from iframe');
          return null; 
        };
        
        // Block alerts and confirms from iframe
        contentWindow.alert = function() {};
        contentWindow.confirm = function() { return false; };
        contentWindow.prompt = function() { return null; };
      }
    } catch (e) {
      // Cross-origin restrictions may prevent direct access
      console.log('🛡️ Cross-origin iframe, using sandbox protection');
    }
  }, []);

  // Setup postMessage blocking for ad-related messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const messageStr = JSON.stringify(event.data).toLowerCase();
        
        // Block common ad-related messages
        const blockedKeywords = [
          'ad', 'ads', 'advertisement', 'popup', 'popunder',
          'redirect', 'click', 'window.open', '_blank', 'newtab', 'newwindow'
        ];
        
        for (const keyword of blockedKeywords) {
          if (messageStr.includes(keyword)) {
            console.log('🛡️ Blocked ad message:', event.data);
            event.stopPropagation();
            return;
          }
        }
      } catch (e) {
        // Ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage, true);
    return () => window.removeEventListener('message', handleMessage, true);
  }, []);

  // Setup protection when iframe loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      setupIframeProtection(iframe);
    };

    iframe.addEventListener('load', handleLoad);
    
    // Also setup after a delay (in case onload doesn't fire)
    const timer = setTimeout(() => {
      setupIframeProtection(iframe);
    }, 2000);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      clearTimeout(timer);
    };
  }, [iframeRef, setupIframeProtection]);

  return { setupIframeProtection };
};

/**
 * Setup global popup blocker - call once on app init
 */
export const setupGlobalPopupBlocker = () => {
  // Store original for trusted sources
  const originalWindowOpen = window.open;
  
  window.open = function(url?: string | URL, target?: string, features?: string) {
    // Allow our own smartlink ads
    if (url && typeof url === 'string' && url.includes('foreseehawancestor.com')) {
      return originalWindowOpen.call(window, url, target, features);
    }
    
    // Allow same-origin
    if (url && typeof url === 'string' && url.includes(window.location.hostname)) {
      return originalWindowOpen.call(window, url, target, features);
    }
    
    console.log('🛡️ Blocked popup attempt:', url);
    return null;
  };

  // Block target="_blank" links from iframes
  document.addEventListener('click', function(e) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      const anchor = target as HTMLAnchorElement;
      // Check if it's inside an iframe context or has suspicious attributes
      if (anchor.target === '_blank' && !anchor.href.includes(window.location.hostname)) {
        // Allow our trusted domains
        if (!anchor.href.includes('foreseehawancestor.com') && 
            !anchor.href.includes('t.me') && 
            !anchor.href.includes('damitv')) {
          e.preventDefault();
          e.stopPropagation();
          console.log('🛡️ Blocked _blank link:', anchor.href);
          return false;
        }
      }
    }
  }, true);
};
