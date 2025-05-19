
import React from 'react';
import { Loader } from 'lucide-react';
import { AspectRatio } from '../ui/aspect-ratio';

interface LoadingStateProps {
  source?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ source }) => {
  return (
    <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <Loader className="h-10 w-10 sm:h-12 sm:w-12 animate-spin mx-auto mb-3 sm:mb-4 text-[#9b87f5]" />
            <p className="text-lg sm:text-xl">Loading stream...</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">
              {source ? `Loading from: ${source}` : 'This may take a moment'}
            </p>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
};

export default LoadingState;
