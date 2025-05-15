
import React, { useEffect, useRef } from 'react';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video';
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, className = '' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Safety check to prevent script injection attacks
    if (!adContainerRef.current) return;
    
    // Clear any previous content
    adContainerRef.current.innerHTML = '';
    
    // Only in production or with proper validation should actual ad scripts be loaded
    const adPlaceholder = document.createElement('div');
    
    switch (type) {
      case 'banner':
        adPlaceholder.className = 'bg-[#242836] border border-[#343a4d] rounded-md p-2 text-center';
        adPlaceholder.innerHTML = '<p class="text-gray-400 text-xs">Advertisement</p>';
        adPlaceholder.style.width = '100%';
        adPlaceholder.style.height = '90px';
        break;
      case 'sidebar':
        adPlaceholder.className = 'bg-[#242836] border border-[#343a4d] rounded-md p-2 text-center';
        adPlaceholder.innerHTML = '<p class="text-gray-400 text-xs">Advertisement</p>';
        adPlaceholder.style.width = '300px';
        adPlaceholder.style.height = '250px';
        break;
      case 'video':
        adPlaceholder.className = 'bg-[#242836] border border-[#343a4d] rounded-md p-2 text-center';
        adPlaceholder.innerHTML = '<p class="text-gray-400 text-xs">Video Advertisement</p>';
        adPlaceholder.style.width = '100%';
        adPlaceholder.style.height = '250px';
        break;
    }
    
    adContainerRef.current.appendChild(adPlaceholder);
    
    // This is where you would safely initialize your ad scripts in a production environment
    // Do NOT paste third-party scripts directly as it poses security risks
    console.log(`Ad of type ${type} would be initialized here in production`);
    
    // Clean up function
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, [type]);

  return (
    <div 
      ref={adContainerRef} 
      className={`ad-container ${className}`}
      data-ad-type={type}
    />
  );
};

export default Advertisement;
