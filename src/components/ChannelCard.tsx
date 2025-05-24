
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
          <div className={`relative rounded-full p-2 flex items-center justify-center transition-all duration-500 transform hover:scale-110 ${
            isActive 
              ? 'bg-gradient-to-r from-[#ff6b35] via-[#ff5a36] to-[#f7931e] shadow-2xl shadow-[#ff5a36]/50 animate-pulse' 
              : 'bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#f093fb] hover:to-[#f5576c] shadow-lg hover:shadow-xl shadow-purple-500/30'
          }`}>
            {/* Rotating border effect */}
            <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
              isActive 
                ? 'bg-gradient-to-r from-[#ff5a36] via-[#f7931e] to-[#ff5a36] animate-spin opacity-20' 
                : 'bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#667eea] hover:animate-spin opacity-0 hover:opacity-30'
            }`} style={{ animationDuration: '3s' }}></div>
            
            {/* Inner glow effect */}
            <div className={`absolute inset-1 rounded-full transition-all duration-300 ${
              isActive 
                ? 'bg-gradient-to-r from-[#ff5a36]/80 to-[#f7931e]/80 blur-sm' 
                : 'bg-gradient-to-r from-[#667eea]/60 to-[#764ba2]/60 blur-sm hover:blur-md'
            }`}></div>
            
            {isActive ? (
              <Tv className="h-4 w-4 sm:h-5 sm:w-5 text-white relative z-10 drop-shadow-lg" />
            ) : (
              <div className="relative z-10 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-white/30 to-white/10 rounded-full border-2 border-white/40 backdrop-blur-sm">
                {generateInitials()}
              </div>
            )}
            
            {/* Outer ring effect */}
            <div className={`absolute -inset-1 rounded-full transition-all duration-500 ${
              isActive 
                ? 'bg-gradient-to-r from-[#ff5a36] to-[#f7931e] opacity-30 blur-md animate-pulse' 
                : 'bg-gradient-to-r from-[#667eea] to-[#764ba2] opacity-0 hover:opacity-20 blur-lg'
            }`}></div>
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
