
import React, { useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video' | 'popunder' | 'native';
  adId?: string;
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, adId, className = '' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!adContainerRef.current) return;

    // Clean up previous ad content
    adContainerRef.current.innerHTML = '';

    let script: HTMLScriptElement;
    let container: HTMLDivElement | null = null;

    // Configure ads based on type
    switch (type) {
      case 'banner':
        // Banner ad - top of page
        script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = '//monkeyhundredsarmed.com/a873bc1d3d203f2f13c32a99592441b8/invoke.js';
        
        container = document.createElement('div');
        container.id = 'container-a873bc1d3d203f2f13c32a99592441b8';
        
        adContainerRef.current.appendChild(script);
        adContainerRef.current.appendChild(container);
        break;

      case 'sidebar':
        // Sidebar ad - less intrusive
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//monkeyhundredsarmed.com/2d/10/9c/2d109cea62316aeb5d20389246c3d8a9.js';
        adContainerRef.current.appendChild(script);
        break;

      case 'native':
        // Native ad - blends with content
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//monkeyhundredsarmed.com/ae/f7/eb/aef7eba12c46ca91518228f813db6ce5.js';
        adContainerRef.current.appendChild(script);
        break;

      case 'popunder':
        // Popunder ad - less intrusive than popup
        const iframe = document.createElement('iframe');
        iframe.src = 'https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37';
        iframe.width = '1';
        iframe.height = '1';
        iframe.style.border = 'none';
        iframe.style.position = 'absolute';
        iframe.style.left = '-9999px';
        iframe.style.visibility = 'hidden';
        adContainerRef.current.appendChild(iframe);
        break;

      default:
        // Fallback to banner
        script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = '//monkeyhundredsarmed.com/a873bc1d3d203f2f13c32a99592441b8/invoke.js';
        adContainerRef.current.appendChild(script);
        break;
    }

    return () => {
      // Cleanup on unmount
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [type, isMobile]);

  // Different styling for different ad types
  const getAdStyles = () => {
    const baseStyles = "ad-container";
    
    switch (type) {
      case 'banner':
        return `${baseStyles} ${className} flex justify-center mb-6 ${
          isMobile ? 'px-2' : 'px-0'
        }`;
      
      case 'sidebar':
        return `${baseStyles} ${className} w-full my-4 ${
          isMobile ? 'px-2' : ''
        }`;
      
      case 'native':
        return `${baseStyles} ${className} w-full my-6 ${
          isMobile ? 'px-2' : ''
        }`;
      
      case 'popunder':
        return `${baseStyles} ${className} hidden`;
      
      default:
        return `${baseStyles} ${className}`;
    }
  };

  return (
    <div 
      ref={adContainerRef} 
      className={getAdStyles()}
      data-ad-type={type}
    >
      {/* Placeholder that will be replaced by the ad */}
      {type !== 'popunder' && (
        <div className="bg-[#242836] p-3 text-center rounded-lg text-gray-400 w-full max-w-full overflow-hidden">
          <p className="text-xs">Advertisement loading...</p>
        </div>
      )}
    </div>
  );
};

export default Advertisement;
