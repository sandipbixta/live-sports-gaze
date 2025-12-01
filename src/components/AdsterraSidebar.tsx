import React, { useEffect, useRef } from 'react';

/**
 * Adsterra 160x600 Wide Skyscraper Banner
 * - Desktop: Fixed sticky sidebar (160x600px - zero CLS)
 * - Mobile: Hidden (not suitable for mobile viewports)
 * - Sticky positioning maximizes viewability and CPM
 */
const AdsterraSidebar: React.FC = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load on desktop (lg breakpoint and above)
    const isDesktop = window.innerWidth >= 1024;
    
    if (!isDesktop || !adContainerRef.current) {
      return;
    }

    // Set atOptions globally for Adsterra
    (window as any).atOptions = {
      'key': 'f6b9ed5242d1d0b7ebdc00c5ebba1752',
      'format': 'iframe',
      'height': 600,
      'width': 160,
      'params': {}
    };

    // Load Adsterra script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//foreseehawancestor.com/f6b9ed5242d1d0b7ebdc00c5ebba1752/invoke.js';
    script.async = true;
    
    adContainerRef.current.appendChild(script);

    // Cleanup
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
      delete (window as any).atOptions;
    };
  }, []);

  return (
    <>
      {/* Desktop Sticky Sidebar Ad - 160x600 */}
      <div 
        className="hidden lg:block lg:w-[160px] lg:min-w-[160px] lg:flex-shrink-0"
      >
        <div 
          ref={adContainerRef}
          className="bg-sports-card/50 border border-border rounded-lg overflow-hidden sticky top-4"
          style={{ 
            width: '160px',
            height: '600px'
          }}
        />
      </div>
    </>
  );
};

export default AdsterraSidebar;
