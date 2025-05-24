
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tv, Globe, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EnhancedChannelCardProps {
  title: string;
  embedUrl: string;
  logo?: string;
  website?: string;
  network?: string;
  categories?: string[];
  onClick?: () => void;
  isActive?: boolean;
}

const EnhancedChannelCard: React.FC<EnhancedChannelCardProps> = ({ 
  title, 
  embedUrl, 
  logo,
  website,
  network,
  categories = [],
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
      className={`overflow-hidden cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'bg-[#242836] border-[#ff5a36]' 
          : 'bg-[#1A1F2C] border-[#343a4d] hover:bg-[#242836]'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Channel Logo/Icon */}
          <div className={`rounded-lg overflow-hidden flex-shrink-0 ${
            isActive ? 'ring-2 ring-[#ff5a36]' : ''
          }`}>
            {logo ? (
              <img 
                src={logo} 
                alt={title}
                className="w-12 h-12 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-12 h-12 bg-[#343a4d] flex items-center justify-center ${logo ? 'hidden' : ''}`}>
              {isActive ? (
                <Tv className="h-6 w-6 text-white" />
              ) : (
                <div className="text-sm font-bold text-gray-300">
                  {generateInitials()}
                </div>
              )}
            </div>
          </div>
          
          {/* Channel Info */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-white truncate mb-1">{title}</div>
            
            {/* Network info */}
            {network && (
              <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                <Users className="h-3 w-3" />
                <span className="truncate">{network}</span>
              </div>
            )}
            
            {/* Categories */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {categories.slice(0, 2).map((category) => (
                  <Badge 
                    key={category} 
                    variant="secondary" 
                    className="text-xs px-1 py-0 bg-[#343a4d] text-gray-300"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Website link */}
            {website && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Globe className="h-3 w-3" />
                <span className="truncate">{new URL(website).hostname}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedChannelCard;
