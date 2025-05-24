
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, Wifi } from 'lucide-react';

interface ChannelQualityBadgeProps {
  quality?: 'HD' | '4K' | 'SD';
  isLive?: boolean;
  viewerCount?: number;
}

const ChannelQualityBadge: React.FC<ChannelQualityBadgeProps> = ({ 
  quality = 'HD', 
  isLive = true, 
  viewerCount 
}) => {
  const getQualityColor = () => {
    switch (quality) {
      case '4K': return 'bg-purple-600 text-white';
      case 'HD': return 'bg-blue-600 text-white';
      case 'SD': return 'bg-gray-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {isLive && (
        <Badge className="bg-red-600 text-white text-xs px-1 py-0 animate-pulse">
          <Wifi className="h-2 w-2 mr-1" />
          LIVE
        </Badge>
      )}
      
      <Badge className={`${getQualityColor()} text-xs px-1 py-0`}>
        {quality}
      </Badge>
      
      {viewerCount && (
        <Badge variant="secondary" className="text-xs px-1 py-0 bg-[#343a4d] text-gray-300">
          <Eye className="h-2 w-2 mr-1" />
          {viewerCount > 1000 ? `${Math.floor(viewerCount / 1000)}k` : viewerCount}
        </Badge>
      )}
    </div>
  );
};

export default ChannelQualityBadge;
