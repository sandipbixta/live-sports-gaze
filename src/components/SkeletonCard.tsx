import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-card rounded-xl overflow-hidden animate-pulse border border-border">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-5 w-12 bg-primary/20 rounded" />
      </div>
      
      {/* Teams skeleton */}
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-muted rounded-full" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      </div>
      
      {/* Button skeleton */}
      <div className="px-3 pb-3">
        <div className="h-8 bg-muted rounded-lg" />
      </div>
    </div>
  );
};

export default SkeletonCard;