import React, { useEffect, useRef } from 'react';
import { trackAdEvent } from '@/utils/adTracking';

/**
 * Adsterra Banner Ad Component (Sidebar)
 * - Desktop: Fixed sidebar next to content (160x600px banner)
 * - Mobile: Bottom placement (adapted for mobile view)
 * - Maintains CLS = 0 by reserving container space before ad loads
 */
const AdsterraSidebar: React.FC = () => {
  const desktopAdRef = useRef<HTMLDivElement>(null);
  const mobileAdRef = useRef<HTMLDivElement>(null);
  const hasLoadedDesktop = useRef(false);
  const hasLoadedMobile = useRef(false);

  useEffect(() => {
    // Determine if we're on mobile or desktop
    const isMobile = window.innerWidth < 1024;

    // Load script for desktop container only on desktop
    if (!isMobile && desktopAdRef.current && !hasLoadedDesktop.current) {
      // Add atOptions before the script
      const atOptionsScript = document.createElement('script');
      atOptionsScript.type = 'text/javascript';
      atOptionsScript.innerHTML = `
        atOptions = {
          'key' : 'f6b9ed5242d1d0b7ebdc00c5ebba1752',
          'format' : 'iframe',
          'height' : 600,
          'width' : 160,
          'params' : {}
        };
      `;
      desktopAdRef.current.appendChild(atOptionsScript);

      // Load the ad script
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//foreseehawancesator.com/f6b9ed5242d1d0b7ebdc00c5ebba1752/invoke.js';
      script.onload = () => {
        console.log('✅ Banner sidebar ad loaded (desktop)');
        trackAdEvent('impression', 'native', 'sidebar-banner-desktop');
      };
      desktopAdRef.current.appendChild(script);
      hasLoadedDesktop.current = true;
    }

    // Load script for mobile container only on mobile
    if (isMobile && mobileAdRef.current && !hasLoadedMobile.current) {
      // Add atOptions before the script
      const atOptionsScript = document.createElement('script');
      atOptionsScript.type = 'text/javascript';
      atOptionsScript.innerHTML = `
        atOptions = {
          'key' : '6f9d1f3d2ad1eb4e3efaf82e5571ea37',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      mobileAdRef.current.appendChild(atOptionsScript);

      // Load the ad script
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//foreseehawancesator.com/6f9d1f3d2ad1eb4e3efaf82e5571ea37/invoke.js';
      script.onload = () => {
        console.log('✅ Native ad loaded (mobile)');
        trackAdEvent('impression', 'native', 'mobile-native-bottom');
      };
      mobileAdRef.current.appendChild(script);
      hasLoadedMobile.current = true;
    }

    // Cleanup
    return () => {
      if (desktopAdRef.current) {
        desktopAdRef.current.innerHTML = '';
      }
      if (mobileAdRef.current) {
        mobileAdRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <>
      {/* Desktop Sidebar Banner Ad - 160x600 */}
      <div 
        className="hidden lg:block lg:w-[160px] lg:min-w-[160px] lg:flex-shrink-0"
      >
        <div 
          ref={desktopAdRef}
          className="w-full bg-muted/30 border border-border rounded-lg overflow-visible sticky top-4"
          style={{ 
            width: '160px',
            minHeight: '600px'
          }}
        >
        </div>
      </div>

      {/* Mobile Bottom Native Ad - 728x90 */}
      <div 
        className="lg:hidden w-full mt-8"
        style={{
          minHeight: '90px',
        }}
      >
        <div 
          ref={mobileAdRef}
          className="w-full bg-muted/30 border border-border rounded-lg overflow-hidden flex items-center justify-center"
          style={{
            minHeight: '90px',
          }}
        >
        </div>
      </div>
    </>
  );
};

export default AdsterraSidebar;
