
import React, { useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video' | 'popunder';
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, className = '' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // This component now renders only a placeholder div
  // All intrusive ad scripts have been removed
  return (
    <div 
      ref={adContainerRef} 
      className={`ad-container ${className} ${
        type === 'banner' ? 'flex justify-center overflow-hidden' : ''
      } ${
        type === 'banner' && isMobile ? 'max-w-full scale-90 origin-center transform mx-auto' : ''
      }`}
      data-ad-type={type}
    >
      <div className="bg-[#242836] p-4 text-center rounded-lg text-gray-400 w-full">
        <p>Ad space - Social Bar ads only</p>
      </div>
    </div>
  );
};

export default Advertisement;
