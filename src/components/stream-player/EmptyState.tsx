
import React from 'react';
import { Video } from 'lucide-react';
import { AspectRatio } from '../ui/aspect-ratio';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, subtitle }) => {
  return (
    <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <Video className="h-10 w-10 sm:h-12 sm:w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-lg sm:text-xl">{title}</p>
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">{subtitle}</p>
            )}
          </div>
        </div>
      </AspectRatio>
    </div>
  );
};

export default EmptyState;
