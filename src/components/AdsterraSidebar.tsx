import React, { useEffect, useRef, useState } from 'react';

/**
 * Adsterra Sidebar Ad Component
 * - Desktop: Fixed sidebar next to content (300x600px reserved space)
 * - Mobile: Bottom placement (250px min-height reserved space)
 * - Maintains CLS = 0 by reserving container space before ad loads
 */
const AdsterraSidebar: React.FC = () => {
  const desktopAdRef = useRef<HTMLDivElement>(null);
  const mobileAdRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = React.useState(false);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const initTimeout = setTimeout(() => {
      const isMobile = window.innerWidth < 1024;

      const loadAdScript = (container: HTMLDivElement) => {
        // Clear any existing content first
        container.innerHTML = '';
        
        // Create fresh container div
        const adContainer = document.createElement('div');
        adContainer.id = isMobile 
          ? 'container-a873bc1d3d203f2f13c32a99592441b8-mobile'
          : 'container-a873bc1d3d203f2f13c32a99592441b8';
        container.appendChild(adContainer);
        
        // Load the ad script
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = '//foreseehawancestor.com/a873bc1d3d203f2f13c32a99592441b8/invoke.js';
        
        script.onload = () => {
          console.log('✅ Adsterra sidebar ad script loaded');
          setScriptLoaded(true);
        };
        
        script.onerror = () => {
          console.error('❌ Failed to load Adsterra sidebar ad');
        };
        
        container.appendChild(script);
      };

      // Load script based on device type
      if (!isMobile && desktopAdRef.current) {
        loadAdScript(desktopAdRef.current);
      }

      if (isMobile && mobileAdRef.current) {
        loadAdScript(mobileAdRef.current);
      }
    }, 300); // 300ms delay to ensure component is fully mounted

    // Cleanup
    return () => {
      clearTimeout(initTimeout);
      if (desktopAdRef.current) {
        desktopAdRef.current.innerHTML = '';
      }
      if (mobileAdRef.current) {
        mobileAdRef.current.innerHTML = '';
      }
    };
  }, []); // Re-run when location changes

  return (
    <>
      {/* Desktop Sidebar Ad */}
      <div 
        className="hidden lg:block lg:w-[300px] lg:min-w-[300px] lg:flex-shrink-0"
      >
        <div 
          ref={desktopAdRef}
          className="w-full bg-sports-card/50 border border-border rounded-lg overflow-visible sticky top-4"
          style={{ 
            width: '300px',
            minHeight: '600px'
          }}
        />
      </div>

      {/* Mobile Bottom Ad */}
      <div 
        className="lg:hidden w-full mt-8"
        style={{
          minHeight: '250px',
        }}
      >
        <div 
          ref={mobileAdRef}
          className="w-full bg-sports-card/50 border border-border rounded-lg overflow-hidden p-2"
          style={{
            minHeight: '250px',
          }}
        />
      </div>
    </>
  );
};

export default AdsterraSidebar;
