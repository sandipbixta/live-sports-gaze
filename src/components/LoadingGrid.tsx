import React from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import { MatchCardSkeleton } from '@/components/skeletons';

interface LoadingGridProps {
  title?: string;
  count?: number;
}

const LoadingGrid: React.FC<LoadingGridProps> = ({ 
  title = "Live & Upcoming Matches",
  count = 6
}) => {
  const isMobile = useIsMobile();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <span className="text-xs text-muted-foreground ml-2">Loading...</span>
      </div>
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
        {Array.from({ length: count }).map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default LoadingGrid;
