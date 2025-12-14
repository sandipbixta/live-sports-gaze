import { Skeleton } from '@/components/ui/skeleton';

const MatchCardSkeleton = () => {
  return (
    <div className="group h-full">
      <div className="relative overflow-hidden rounded-xl bg-card h-full flex flex-col border border-border/50">
        {/* Banner Image Section - 16:9 aspect ratio */}
        <div className="relative aspect-video overflow-hidden rounded-t-xl flex-shrink-0 bg-muted">
          <Skeleton className="w-full h-full" />
          
          {/* Badge placeholder - Top left */}
          <div className="absolute top-2 left-2 z-10">
            <Skeleton className="h-5 w-12 rounded" />
          </div>
          
          {/* Countdown placeholder - Bottom left */}
          <div className="absolute bottom-2 left-2 z-10">
            <Skeleton className="h-6 w-28 rounded" />
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 flex flex-col gap-2 flex-1 bg-card">
          {/* Sport • Tournament */}
          <Skeleton className="h-3 w-32" />
          
          {/* Home Team */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          
          {/* Away Team */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCardSkeleton;