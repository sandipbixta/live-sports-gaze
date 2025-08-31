import React from 'react';
import { Users, Eye } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { formatViewerCount } from '@/utils/fakeViewers';

interface ViewerCounterProps {
  viewerCount: number;
  isLive?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
}

const ViewerCounter: React.FC<ViewerCounterProps> = ({
  viewerCount,
  isLive = false,
  variant = 'default',
  className
}) => {
  if (!isLive || viewerCount <= 0) {
    return null;
  }

  const formattedCount = formatViewerCount(viewerCount);

  if (variant === 'compact') {
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "text-xs bg-red-600/20 text-red-400 border-red-600/30 flex items-center gap-1",
          className
        )}
      >
        <Eye className="w-3 h-3" />
        {formattedCount}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "bg-red-600/20 text-red-400 border-red-600/30 flex items-center gap-1.5",
        className
      )}
    >
      <Users className="w-4 h-4" />
      <span className="font-medium">{formattedCount} watching</span>
    </Badge>
  );
};

export default ViewerCounter;