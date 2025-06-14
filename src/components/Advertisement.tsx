
import React, { useEffect, useRef } from 'react';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video' | 'popunder' | 'direct-link';
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, className = '' }) => {
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!adRef.current || process.env.NODE_ENV === 'development') return;
    
    // Clean previous content
    adRef.current.innerHTML = '';
    
    if (type === 'banner') {
      // Create a centered container for the banner ad
      const adContainer = document.createElement('div');
      adContainer.style.display = 'flex';
      adContainer.style.justifyContent = 'center';
      adContainer.style.alignItems = 'center';
      adContainer.style.width = '100%';
      adContainer.style.overflow = 'hidden';
      adContainer.style.minHeight = '90px';
      
      // Banner ad configuration - responsive for mobile
      const script1 = document.createElement('script');
      script1.type = 'text/javascript';
      script1.innerHTML = `
        atOptions = {
          'key' : '6f9d1f3d2ad1eb4e3efaf82e5571ea37',
          'format' : 'iframe',
          'height' : 90,
          'width' : 728,
          'params' : {}
        };
      `;
      
      const script2 = document.createElement('script');
      script2.type = 'text/javascript';
      script2.src = '//monkeyhundredsarmed.com/6f9d1f3d2ad1eb4e3efaf82e5571ea37/invoke.js';
      script2.async = true;
      
      // Add error handling
      script2.onerror = () => {
        console.log('Banner ad script failed to load');
      };
      
      script2.onload = () => {
        console.log('Banner ad script loaded successfully');
      };
      
      adContainer.appendChild(script1);
      adContainer.appendChild(script2);
      adRef.current.appendChild(adContainer);
      
    } else if (type === 'direct-link') {
      // Direct link ad - mobile optimized
      const link = document.createElement('a');
      link.href = 'https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'block w-full h-16 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all text-sm sm:text-base';
      link.innerHTML = '🎯 Exclusive Offers - Click Here!';
      
      adRef.current.appendChild(link);
      
    } else if (type === 'popunder') {
      // Much less aggressive popunder ad functionality
      const handlePopunder = () => {
        // Check if already shown in the last 2 hours (increased from 30 minutes)
        const lastShown = localStorage.getItem('popunder_last_shown');
        const now = Date.now();
        const twoHours = 2 * 60 * 60 * 1000; // 2 hours instead of 30 minutes
        
        if (lastShown && (now - parseInt(lastShown)) < twoHours) {
          console.log('Popunder cooldown active - 2 hour limit');
          return;
        }
        
        // Check if user is on video player pages - be extra careful there
        const isVideoPlayerPage = window.location.pathname.includes('/match/') || 
                                 window.location.pathname.includes('/channel/') ||
                                 window.location.pathname.includes('/manual-match/');
        
        if (isVideoPlayerPage) {
          // On video pages, only trigger if user has been idle for a while
          const lastActivity = localStorage.getItem('last_user_activity');
          const fiveMinutes = 5 * 60 * 1000;
          
          if (!lastActivity || (now - parseInt(lastActivity)) < fiveMinutes) {
            console.log('User recently active on video page, skipping popunder');
            return;
          }
        }
        
        try {
          const popWindow = window.open(
            'https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37',
            '_blank',
            'width=1,height=1,left=0,top=0'
          );
          
          if (popWindow) {
            // Move the popup behind the main window
            setTimeout(() => {
              window.focus();
              popWindow.blur();
            }, 100);
            
            // Set longer cooldown
            localStorage.setItem('popunder_last_shown', now.toString());
            console.log('Popunder triggered, 2-hour cooldown set');
          }
        } catch (error) {
          console.log('Popunder blocked or error:', error);
        }
      };
      
      // Track user activity to avoid interrupting active users
      const trackActivity = () => {
        localStorage.setItem('last_user_activity', Date.now().toString());
      };
      
      // Add activity listeners
      document.addEventListener('click', trackActivity);
      document.addEventListener('scroll', trackActivity);
      document.addEventListener('keydown', trackActivity);
      
      // Much more controlled popunder triggering
      let hasTriggered = false;
      
      const triggerPopunder = () => {
        if (hasTriggered) return;
        
        // Only trigger on specific user interactions, not every click
        const target = event?.target as HTMLElement;
        const isNavigationClick = target?.closest('a') || 
                                 target?.closest('button') ||
                                 target?.closest('[role="button"]');
        
        if (isNavigationClick) {
          hasTriggered = true;
          // Add longer delay to make it less intrusive
          setTimeout(() => {
            handlePopunder();
          }, 3000); // 3 seconds delay
          
          // Remove listeners after first trigger
          document.removeEventListener('click', triggerPopunder);
        }
      };
      
      // Wait much longer before enabling popunder (30 seconds instead of 10)
      setTimeout(() => {
        // Only enable if user is still on the page
        if (document.visibilityState === 'visible') {
          document.addEventListener('click', triggerPopunder);
          console.log('Popunder listener enabled after 30 seconds');
        }
      }, 30000);
      
      // Cleanup function
      return () => {
        document.removeEventListener('click', triggerPopunder);
        document.removeEventListener('click', trackActivity);
        document.removeEventListener('scroll', trackActivity);
        document.removeEventListener('keydown', trackActivity);
      };
    }
    
    return () => {
      // Clean up when component unmounts
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    };
  }, [type]);
  
  // Don't show ads in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`bg-gray-200 dark:bg-gray-800 rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Advertisement Placeholder ({type}) - Banner: 728x90
        </p>
      </div>
    );
  }
  
  // Popunder type doesn't render visible content
  if (type === 'popunder') {
    return null;
  }
  
  return (
    <div 
      ref={adRef} 
      className={`ad-container flex justify-center items-center overflow-hidden min-h-[90px] w-full ${className}`} 
      data-ad-type={type}
      style={{ 
        minHeight: type === 'banner' ? '90px' : 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    />
  );
};

export default Advertisement;
