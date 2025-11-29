import React, { useEffect, useRef } from 'react';

/**
 * Adsterra Sidebar Ad Component
 * - Desktop: Fixed sidebar next to content (300x600px reserved space)
 * - Mobile: Bottom placement (250px min-height reserved space)
 * - Maintains CLS = 0 by reserving container space before ad loads
 */
const AdsterraSidebar: React.FC = () => {
  const desktopAdRef = useRef<HTMLDivElement>(null);
  const mobileAdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determine if we're on mobile or desktop
    const isMobile = window.innerWidth < 1024;

    // Load script for desktop container only on desktop
    if (!isMobile && desktopAdRef.current) {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//foreseehawancestor.com/a873bc1d3d203f2f13c32a99592441b8/invoke.js';
      desktopAdRef.current.appendChild(script);
    }

    // Load script for mobile container only on mobile
    if (isMobile && mobileAdRef.current) {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//foreseehawancestor.com/a873bc1d3d203f2f13c32a99592441b8/invoke.js';
      mobileAdRef.current.appendChild(script);
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
      {/* Desktop Sidebar Ad */}
      <div 
        className="hidden lg:block lg:w-[300px] lg:min-w-[300px] lg:flex-shrink-0"
      >
        <div 
          ref={desktopAdRef}
          className="w-full bg-sports-card/50 border border-border rounded-lg overflow-visible sticky top-4"
          style={{ 
            width: '300px'
          }}
        >
          <div id="container-a873bc1d3d203f2f13c32a99592441b8"></div>
        </div>
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
        >
          <div 
            id="container-a873bc1d3d203f2f13c32a99592441b8-mobile"
            style={{
              width: '100%',
              minHeight: '250px'
            }}
          ></div>
        </div>
      </div>
    </>
  );
};

export default AdsterraSidebar;
