import React, { useEffect, useRef } from 'react';

/**
 * Adsterra Sidebar Banner Ad Component
 * - Desktop: Fixed sidebar next to content (160x300px banner)
 * - Mobile: Bottom placement (160x300px banner)
 * - Maintains CLS = 0 by reserving container space before ad loads
 */
const AdsterraSidebar: React.FC = () => {
  const desktopAdRef = useRef<HTMLDivElement>(null);
  const mobileAdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Determine if we're on mobile or desktop
    const isMobile = window.innerWidth < 1024;

    // Load banner ad script for desktop
    if (!isMobile && desktopAdRef.current) {
      // Set atOptions for banner ad
      (window as any).atOptions = {
        'key' : 'a15877b546566779d012a746c76b88da',
        'format' : 'iframe',
        'height' : 300,
        'width' : 160,
        'params' : {}
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//foreseehawancestor.com/a15877b546566779d012a746c76b88da/invoke.js';
      desktopAdRef.current.appendChild(script);
    }

    // Load banner ad script for mobile
    if (isMobile && mobileAdRef.current) {
      // Set atOptions for banner ad
      (window as any).atOptions = {
        'key' : 'a15877b546566779d012a746c76b88da',
        'format' : 'iframe',
        'height' : 300,
        'width' : 160,
        'params' : {}
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//foreseehawancesator.com/a15877b546566779d012a746c76b88da/invoke.js';
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
      {/* Desktop Sidebar Banner Ad - 160x300 */}
      <div 
        className="hidden lg:block lg:w-[160px] lg:min-w-[160px] lg:flex-shrink-0"
      >
        <div 
          ref={desktopAdRef}
          className="w-full bg-card/50 border border-border rounded-lg overflow-visible sticky top-4 flex items-center justify-center"
          style={{ 
            width: '160px',
            height: '300px'
          }}
        />
      </div>

      {/* Mobile Bottom Banner Ad - 160x300 */}
      <div 
        className="lg:hidden w-full mt-8 flex justify-center"
      >
        <div 
          ref={mobileAdRef}
          className="bg-card/50 border border-border rounded-lg overflow-hidden flex items-center justify-center"
          style={{
            width: '160px',
            height: '300px'
          }}
        />
      </div>
    </>
  );
};

export default AdsterraSidebar;
