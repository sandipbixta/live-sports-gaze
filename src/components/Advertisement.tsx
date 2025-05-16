
import React, { useEffect, useRef, useState } from 'react';
import { useAccessibility } from '../providers/AccessibilityProvider';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video';
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, className = '' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState<boolean>(false);
  const [adFailed, setAdFailed] = useState<boolean>(false);
  const { connectionQuality, isUsingAlternateServer } = useAccessibility();

  // Limit ads for poor connections or when using alternate servers
  const shouldShowAds = () => {
    // Don't show ads on poor connections to improve page load
    if (connectionQuality === 'poor') return false;
    
    // Show fewer ads when using alternate server
    if (isUsingAlternateServer && type !== 'banner') return false;
    
    // Set a global limit on the number of ads per page
    const adsOnPage = document.querySelectorAll('.ad-container[data-ad-loaded="true"]');
    if (adsOnPage.length >= 2) return false;
    
    return true;
  };
  
  useEffect(() => {
    if (!adContainerRef.current) return;
    
    // Skip loading ads in certain conditions
    if (!shouldShowAds()) {
      setAdFailed(true);
      return;
    }
    
    // Clear any previous content
    adContainerRef.current.innerHTML = '';
    
    // Set a timeout to mark ad as failed if it doesn't load
    const timeoutId = setTimeout(() => {
      if (!adLoaded) setAdFailed(true);
    }, 3000);
    
    try {
      // Create script element
      const script = document.createElement('script');
      script.type = 'text/javascript';
      
      // Add event listener to track when ad loads
      script.onload = () => {
        setAdLoaded(true);
        if (adContainerRef.current) {
          adContainerRef.current.setAttribute('data-ad-loaded', 'true');
        }
        clearTimeout(timeoutId);
      };
      
      script.onerror = () => {
        setAdFailed(true);
        clearTimeout(timeoutId);
      };
      
      switch (type) {
        case 'banner':
          // Set script for banner ad
          script.innerHTML = `
            atOptions = {
              'key' : '7c589340b2a1155dcea92f44cc468438',
              'format' : 'iframe',
              'height' : 250,
              'width' : 300,
              'params' : {}
            };
          `;
          adContainerRef.current.appendChild(script);
          
          // Create the invoke script
          const invokeScript = document.createElement('script');
          invokeScript.type = 'text/javascript';
          invokeScript.src = '//monkeyhundredsarmed.com/7c589340b2a1155dcea92f44cc468438/invoke.js';
          adContainerRef.current.appendChild(invokeScript);
          break;
          
        case 'sidebar':
          // Set script for sidebar ad
          script.src = '//monkeyhundredsarmed.com/2d/10/9c/2d109cea62316aeb5d20389246c3d8a9.js';
          adContainerRef.current.appendChild(script);
          break;
          
        case 'video':
          // Set script for video ad
          script.src = '//monkeyhundredsarmed.com/ae/f7/eb/aef7eba12c46ca91518228f813db6ce5.js';
          adContainerRef.current.appendChild(script);
          break;
      }
    } catch (error) {
      console.error('Ad loading error:', error);
      setAdFailed(true);
      clearTimeout(timeoutId);
    }

    // Clean up function
    return () => {
      clearTimeout(timeoutId);
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [type, connectionQuality, isUsingAlternateServer]);

  if (adFailed) {
    return null; // Don't render anything if ad failed to load
  }

  return (
    <div 
      ref={adContainerRef} 
      className={`ad-container ${className} ${adLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      data-ad-type={type}
      data-ad-loaded={adLoaded ? 'true' : 'false'}
    />
  );
};

export default Advertisement;
