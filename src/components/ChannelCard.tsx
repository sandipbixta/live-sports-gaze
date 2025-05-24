
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
          <div className={`rounded-full overflow-hidden flex-shrink-0 ${
            isActive ? 'ring-2 ring-[#ff5a36]' : ''
          }`}>
            {logo ? (
              <img 
                src={logo} 
                alt={title}
                className="w-8 h-8 sm:w-10 sm:h-10 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center ${
              isActive ? 'bg-[#ff5a36]' : 'bg-[#343a4d]'
            } ${logo ? 'hidden' : ''}`}>
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
