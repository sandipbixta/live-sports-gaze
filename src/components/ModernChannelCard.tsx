
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
  colorScheme?: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'pink';
}

const colorSchemes = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-600 to-blue-800',
    border: 'border-blue-500',
    text: 'text-blue-100',
    accent: 'bg-blue-500'
  },
  red: {
    bg: 'bg-gradient-to-br from-red-600 to-red-800',
    border: 'border-red-500',
    text: 'text-red-100',
    accent: 'bg-red-500'
  },
  green: {
    bg: 'bg-gradient-to-br from-green-600 to-green-800',
    border: 'border-green-500',
    text: 'text-green-100',
    accent: 'bg-green-500'
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-600 to-purple-800',
    border: 'border-purple-500',
    text: 'text-purple-100',
    accent: 'bg-purple-500'
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-600 to-orange-800',
    border: 'border-orange-500',
    text: 'text-orange-100',
    accent: 'bg-orange-500'
  },
  pink: {
    bg: 'bg-gradient-to-br from-pink-600 to-pink-800',
    border: 'border-pink-500',
    text: 'text-pink-100',
    accent: 'bg-pink-500'
  }
};

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
  isActive = false,
  colorScheme = 'blue'
}) => {
  const colors = colorSchemes[colorScheme];
  
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
          ? `${colors.bg} ${colors.border} border-2 shadow-lg` 
          : `${colors.bg} border-transparent hover:${colors.border} hover:border-2`
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
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
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
          <Badge className={`${colors.accent} text-white text-xs mb-3`}>
            {category}
          </Badge>
          
          {/* Current Show */}
          {currentShow && (
            <div className="mb-2">
              <p className="text-sm text-white/90 font-medium">{currentShow}</p>
            </div>
          )}
          
          {/* Time Slot */}
          {timeSlot && (
            <div className="flex items-center justify-center gap-1 text-xs text-white/80 mb-2">
              <Clock className="w-3 h-3" />
              <span>{timeSlot}</span>
            </div>
          )}
          
          {/* Network Info */}
          {network && (
            <div className="flex items-center justify-center gap-1 text-xs text-white/70">
              <Users className="w-3 h-3" />
              <span>{network}</span>
            </div>
          )}
        </div>
        
        {/* Watch Button */}
        <div className="mt-4">
          <button 
            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
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
