
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tv } from 'lucide-react';
import ChannelQualityBadge from './ChannelQualityBadge';
import { generateViewerCount, getChannelQuality, isChannelLive } from '@/utils/channelUtils';

interface ChannelCardProps {
  title: string;
  embedUrl: string;
  onClick?: () => void;
  isActive?: boolean;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ 
  title, 
  embedUrl, 
  onClick,
  isActive = false
}) => {
  const generateInitials = () => {
    return title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const quality = getChannelQuality(title);
  const live = isChannelLive(title);
  const viewerCount = generateViewerCount(title);
  
  return (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-[#242836] border-[#ff5a36]' 
          : 'bg-[#1A1F2C] border-[#343a4d] hover:bg-[#242836]'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-2">
        <div className="flex items-center gap-2 mb-2">
          <div className={`rounded-full p-1.5 flex items-center justify-center ${
            isActive ? 'bg-[#ff5a36]' : 'bg-[#343a4d]'
          }`}>
            {isActive ? (
              <Tv className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            ) : (
              <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center text-xs font-bold text-gray-300">
                {generateInitials()}
              </div>
            )}
          </div>
          <div className="font-medium text-xs sm:text-sm text-white truncate flex-1">{title}</div>
        </div>
        
        <ChannelQualityBadge 
          quality={quality}
          isLive={live}
          viewerCount={viewerCount}
        />
      </CardContent>
    </Card>
  );
};

export default ChannelCard;
