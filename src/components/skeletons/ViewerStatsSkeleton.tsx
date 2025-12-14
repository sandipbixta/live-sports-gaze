import { Skeleton } from '@/components/ui/skeleton';

const ViewerStatsSkeleton = () => {
  return (
    <div className="bg-card rounded-lg p-4 border border-border/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  );
};

export default ViewerStatsSkeleton;