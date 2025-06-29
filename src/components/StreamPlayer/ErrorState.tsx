
import React from 'react';
import { AlertTriangle, RefreshCcw, ExternalLink, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { AspectRatio } from '../ui/aspect-ratio';
import { useIsMobile } from '../../hooks/use-mobile';
import PlayerContainer from './PlayerContainer';
import PlayerControls from './PlayerControls';

interface ErrorStateProps {
  hasError: boolean;
  isTimeout: boolean;
  onRetry: () => void;
  onOpenInNewTab: () => void;
  onGoBack: (e: React.MouseEvent | React.TouchEvent) => void;
  debugInfo?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  hasError,
  isTimeout,
  onRetry,
  onOpenInNewTab,
  onGoBack,
  debugInfo
}) => {
  const isMobile = useIsMobile();

  if (!hasError) return null;

  const isMobileBlocked = debugInfo?.includes('mobile devices') || debugInfo?.includes('Mobile Device: true');

  return (
    <PlayerContainer>
      <PlayerControls
        onGoBack={onGoBack}
        onTogglePictureInPicture={() => {}}
        onOpenInNewTab={onOpenInNewTab}
        isPictureInPicture={false}
      />
      <AspectRatio ratio={16 / 9}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center max-w-md mx-auto p-4">
            <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-400 mx-auto mb-3" />
            
            <p className="text-lg sm:text-xl mb-2">
              {isMobileBlocked ? 'Stream blocked on mobile' : 'Stream blocked or unavailable'}
            </p>
            
            <p className="text-xs sm:text-sm text-gray-400 mb-4">
              {isMobileBlocked 
                ? "This stream doesn't work on mobile devices. Many streaming sources block mobile browsers for licensing reasons."
                : isTimeout 
                ? "The stream may be blocked by CORS policy or X-Frame-Options headers"
                : "Stream failed to load - likely blocked by the source website"
              }
            </p>

            {/* Mobile-specific help message */}
            {isMobile && (
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Mobile Tip</span>
                </div>
                <p className="text-xs text-blue-200">
                  Try opening in a new tab or requesting the desktop version of the site in your browser settings.
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="border-[#343a4d] bg-transparent hover:bg-[#343a4d]"
              >
                <RefreshCcw className="h-4 w-4 mr-2" /> Try Again
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onOpenInNewTab}
                className="border-[#ff5a36] bg-transparent hover:bg-[#ff5a36] text-[#ff5a36] hover:text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" /> 
                {isMobile ? 'Open in New Tab (Recommended)' : 'Open in New Tab'}
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && debugInfo && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-gray-500">Debug Info</summary>
                <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                  {debugInfo}
                </pre>
              </details>
            )}
          </div>
        </div>
      </AspectRatio>
    </PlayerContainer>
  );
};

export default ErrorState;
