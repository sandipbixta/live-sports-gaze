import { MatchHeaderSkeleton, StreamPlayerSkeleton, ViewerStatsSkeleton } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-sports-dark text-sports-light">
      {/* Match Header Skeleton */}
      <MatchHeaderSkeleton />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Telegram Banner Skeleton */}
        <div className="mb-4">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        
        {/* Match Title Skeleton */}
        <div className="w-full flex justify-center mb-4">
          <div className="text-center max-w-4xl px-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="h-8 w-64" />
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
        
        {/* Video Player Section */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <StreamPlayerSkeleton />
            
            {/* Viewer Stats Skeleton */}
            <div className="mt-4">
              <ViewerStatsSkeleton />
            </div>
            
            <div className="mt-4">
              <ViewerStatsSkeleton />
            </div>
          </div>
        </div>

        {/* Match Analysis Skeleton */}
        <div className="mt-8">
          <div className="bg-card rounded-lg p-6 border border-border/50">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;