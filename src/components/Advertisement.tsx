
import React from 'react';

interface AdvertisementProps {
  type: 'banner' | 'sidebar' | 'video' | 'popunder';
  className?: string;
}

const Advertisement: React.FC<AdvertisementProps> = ({ type, className = '' }) => {
  // Component now renders nothing - all ads removed
  return null;
};

export default Advertisement;
