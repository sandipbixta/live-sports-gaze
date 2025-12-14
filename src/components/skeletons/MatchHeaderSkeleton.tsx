import { Skeleton } from '@/components/ui/skeleton';

const MatchHeaderSkeleton = () => {
  return (
    <div className="relative bg-gradient-to-b from-muted/50 to-background py-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        {/* Main header content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Teams */}
          <div className="flex items-center gap-4">
            {/* Home team */}
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            
            {/* VS / Score */}
            <div className="flex flex-col items-center gap-1">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            
            {/* Away team */}
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
        
        {/* Match info */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default MatchHeaderSkeleton;