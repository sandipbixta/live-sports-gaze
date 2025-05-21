
import React, { useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video' | 'popunder';
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, className = '' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!adContainerRef.current) return;

    // Clean up previous ad content
    adContainerRef.current.innerHTML = '';

    // Create iframe for direct ad link
    const iframe = document.createElement('iframe');
    iframe.src = 'https://monkeyhundredsarmed.com/s1ifcs09n5?key=b58e42fd958110825c568cf8a198606e';
    iframe.width = type === 'banner' ? (isMobile ? '320' : '728') : '300';
    iframe.height = type === 'banner' ? (isMobile ? '50' : '90') : '250';
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.style.overflow = 'hidden';
    
    adContainerRef.current.appendChild(iframe);

    return () => {
      // Cleanup on unmount
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [type, isMobile]);

  return (
    <div 
      ref={adContainerRef} 
      className={`ad-container ${className} ${
        type === 'banner' ? 'flex justify-center overflow-hidden mb-6' : ''
      } ${
        type === 'sidebar' ? 'w-full my-4' : ''
      } ${
        type === 'banner' && isMobile ? 'scale-90 origin-center transform mx-auto' : ''
      }`}
      data-ad-type={type}
    >
      {/* Placeholder that will be replaced by the ad */}
      <div className="bg-[#242836] p-3 text-center rounded-lg text-gray-400 w-full">
        <p className="text-xs">Advertisement loading...</p>
      </div>
    </div>
  );
};

export default Advertisement;
