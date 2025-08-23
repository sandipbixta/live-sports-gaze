import React from 'react';
import { Eye, Users } from 'lucide-react';
import { Badge } from './ui/badge';

interface ViewerCounterProps {
  viewerCount: number;
  isLive?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'large';
}

const ViewerCounter: React.FC<ViewerCounterProps> = ({ 
  viewerCount, 
  isLive = true, 
  className = '', 
  variant = 'default' 
}) => {
  const formatViewerCount = (count: number): string => {
    if (count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 text-sm ${className}`}>
        <Eye className="w-4 h-4 text-red-500" />
        <span className="font-medium">{formatViewerCount(viewerCount)}</span>
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          <div className={`relative ${isLive ? 'animate-pulse' : ''}`}>
            <Users className="w-6 h-6 text-red-500" />
            {isLive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">
              {formatViewerCount(viewerCount)}
            </span>
            <span className="text-xs text-muted-foreground">
              {viewerCount === 1 ? 'viewer' : 'viewers'} watching
            </span>
          </div>
        </div>
        {isLive && (
          <Badge variant="destructive" className="bg-red-600 hover:bg-red-700 animate-pulse">
            LIVE
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Badge 
      variant={isLive ? "destructive" : "secondary"} 
      className={`flex items-center gap-2 ${isLive ? 'bg-red-600 hover:bg-red-700 animate-pulse' : ''} ${className}`}
    >
      <div className="flex items-center gap-1">
        <Eye className="w-4 h-4" />
        <span className="font-medium">{formatViewerCount(viewerCount)}</span>
      </div>
      {isLive && <span className="text-xs">LIVE</span>}
    </Badge>
  );
};

export default ViewerCounter;