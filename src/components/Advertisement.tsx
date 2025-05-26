
import React from 'react';
import { useIsMobile } from '../hooks/use-mobile';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video' | 'popunder';
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, className = '' }) => {
  const isMobile = useIsMobile();

  // Simple non-intrusive ad placeholder that won't cause popups
  const getAdDimensions = () => {
    switch (type) {
      case 'banner':
        return {
          width: isMobile ? '320px' : '728px',
          height: isMobile ? '50px' : '90px'
        };
      case 'sidebar':
        return {
          width: '300px',
          height: '250px'
        };
      case 'video':
        return {
          width: '300px',
          height: '250px'
        };
      default:
        return {
          width: '300px',
          height: '250px'
        };
    }
  };

  const dimensions = getAdDimensions();

  return (
    <div 
      className={`ad-container ${className} ${
        type === 'banner' ? 'flex justify-center overflow-hidden mb-6' : ''
      } ${
        type === 'sidebar' ? 'w-full my-4' : ''
      } ${
        type === 'banner' && isMobile ? 'scale-90 origin-center transform mx-auto' : ''
      }`}
      data-ad-type={type}
    >
      {/* Safe ad placeholder without external scripts */}
      <div 
        className="bg-[#242836] border border-[#343a4d] rounded-lg flex items-center justify-center text-gray-400"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: '100%'
        }}
      >
        <div className="text-center p-2">
          <div className="text-xs opacity-60 mb-1">Advertisement</div>
          <div className="text-[10px] opacity-40">Space Available</div>
        </div>
      </div>
    </div>
  );
};

export default Advertisement;
