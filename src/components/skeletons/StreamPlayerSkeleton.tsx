import { Skeleton } from '@/components/ui/skeleton';

const StreamPlayerSkeleton = () => {
  return (
    <div className="w-full">
      {/* Video Player Area */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        <Skeleton className="w-full h-full" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-background/20 flex items-center justify-center">
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
        
        {/* Bottom controls bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="flex-1 h-1 rounded-full" />
            <Skeleton className="w-16 h-4 rounded" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
        </div>
      </div>
      
      {/* Stream Sources */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
};

export default StreamPlayerSkeleton;