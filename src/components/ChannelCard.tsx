
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Tv } from 'lucide-react';

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
  return (
    <Card 
      className={`overflow-hidden cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-[#242836] border-[#fa2d04]' 
          : 'bg-[#1A1F2C] border-[#343a4d] hover:bg-[#242836]'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#343a4d] rounded-full p-2">
            <Tv className="h-12 w-12 text-gray-300" />
          </div>
          <div className="font-medium text-white truncate">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChannelCard;
