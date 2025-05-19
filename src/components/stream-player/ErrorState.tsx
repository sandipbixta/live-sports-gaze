
import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { AspectRatio } from '../ui/aspect-ratio';
import { Button } from '../ui/button';

interface ErrorStateProps {
  message: string;
  subMessage?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, subMessage, onRetry }) => {
  return (
    <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 mx-auto mb-3" />
            <p className="text-lg sm:text-xl">{message}</p>
            {subMessage && (
              <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">{subMessage}</p>
            )}
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="mt-4 border-[#343a4d] bg-transparent hover:bg-[#343a4d]"
              >
                <RefreshCcw className="h-4 w-4 mr-2" /> Try Another Source
              </Button>
            )}
          </div>
        </div>
      </AspectRatio>
    </div>
  );
};

export default ErrorState;
