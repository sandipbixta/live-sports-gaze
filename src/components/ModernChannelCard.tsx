
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users } from 'lucide-react';

interface ModernChannelCardProps {
  title: string;
  embedUrl: string;
  logo?: string;
  category?: string;
  network?: string;
  isLive?: boolean;
  currentShow?: string;
  nextShow?: string;
  timeSlot?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const ModernChannelCard: React.FC<ModernChannelCardProps> = ({ 
  title, 
  embedUrl, 
  logo,
  category = 'Sports',
  network,
  isLive = false,
  currentShow,
  nextShow,
  timeSlot,
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
  
  return (
    <Card 
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
        isActive 
          ? 'bg-[#242836] border-[#ff5a36] border-2 shadow-lg' 
          : 'bg-[#242836] border-[#343a4d] hover:border-[#ff5a36] hover:border-2'
      }`}
      onClick={onClick}
    >
      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs px-2 py-1">
            • LIVE
          </Badge>
        </div>
      )}
      
      <CardContent className="p-4 h-full flex flex-col">
        {/* Channel Logo/Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#343a4d] flex items-center justify-center overflow-hidden">
            {logo ? (
              <img 
                src={logo} 
                alt={title}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center text-lg font-bold text-white ${logo ? 'hidden' : ''}`}>
              {generateInitials()}
            </div>
          </div>
        </div>
        
        {/* Channel Info */}
        <div className="flex-1 text-center">
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          
          {/* Category Badge */}
          <Badge className="bg-[#ff5a36] text-white text-xs mb-3">
            {category}
          </Badge>
          
          {/* Current Show */}
          {currentShow && (
            <div className="mb-2">
              <p className="text-sm text-gray-300 font-medium">{currentShow}</p>
            </div>
          )}
          
          {/* Time Slot */}
          {timeSlot && (
            <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-2">
              <Clock className="w-3 h-3" />
              <span>{timeSlot}</span>
            </div>
          )}
          
          {/* Network Info */}
          {network && (
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{network}</span>
            </div>
          )}
        </div>
        
        {/* Watch Button */}
        <div className="mt-4">
          <button 
            className="w-full bg-[#ff5a36] hover:bg-[#e64d2e] text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Watch
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernChannelCard;
