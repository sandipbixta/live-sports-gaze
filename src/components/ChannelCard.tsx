
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tv } from 'lucide-react';

interface ChannelCardProps {
  title: string;
  embedUrl: string;
  logo?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ 
  title, 
  embedUrl, 
  logo,
  onClick,
  isActive = false
}) => {
  // Generate a logo from the title
  const generateInitials = () => {
    return title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };
  
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
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center ${
            isActive ? 'ring-2 ring-[#ff5a36]' : ''
          } ${logo ? 'bg-white p-0.5' : (isActive ? 'bg-[#ff5a36]' : 'bg-[#343a4d]')}`}>
            {logo ? (
              <img 
                src={logo} 
                alt={title}
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.classList.remove('hidden');
                    fallback.parentElement!.classList.remove('bg-white', 'p-0.5');
                    fallback.parentElement!.classList.add(isActive ? 'bg-[#ff5a36]' : 'bg-[#343a4d]');
                  }
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center ${logo ? 'hidden' : ''}`}>
              {isActive ? (
                <Tv className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              ) : (
                <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex items-center justify-center text-xs font-bold text-gray-300">
                  {generateInitials()}
                </div>
              )}
            </div>
          </div>
          <div className="font-medium text-xs sm:text-sm text-white truncate">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChannelCard;
