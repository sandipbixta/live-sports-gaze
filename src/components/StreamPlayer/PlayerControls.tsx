
import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft, Maximize, Minimize, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useIsMobile } from '../../hooks/use-mobile';

interface PlayerControlsProps {
  onGoBack: (e: React.MouseEvent | React.TouchEvent) => void;
  onTogglePictureInPicture: () => void;
  onOpenInNewTab: () => void;
  isPictureInPicture: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  onGoBack,
  onTogglePictureInPicture,
  onOpenInNewTab,
  isPictureInPicture
}) => {
  const isMobile = useIsMobile();

  const handleFullscreen = async () => {
    try {
      const playerContainer = document.querySelector('[data-player-container]') as HTMLElement;
      
      if (!playerContainer) {
        console.log('Player container not found');
        return;
      }

      if (document.fullscreenElement) {
        // Exit fullscreen
        await document.exitFullscreen();
      } else {
        // Enter fullscreen
        if (playerContainer.requestFullscreen) {
          await playerContainer.requestFullscreen();
        } else if ((playerContainer as any).webkitRequestFullscreen) {
          await (playerContainer as any).webkitRequestFullscreen();
        } else if ((playerContainer as any).mozRequestFullScreen) {
          await (playerContainer as any).mozRequestFullScreen();
        } else if ((playerContainer as any).msRequestFullscreen) {
          await (playerContainer as any).msRequestFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const isFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );

  return (
    <>
      {/* Back button */}
      <div className="absolute top-2 left-2 z-30">
        <Button
          variant="ghost"
          size="sm"
          className="bg-black/50 hover:bg-black/70 rounded-full h-10 w-10 p-0 touch-manipulation"
          onClick={onGoBack}
          onTouchEnd={onGoBack}
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Button>
      </div>
      
      {/* Controls overlay */}
      <div className={cn(
        "absolute top-2 right-2 sm:top-4 sm:right-4 transition-opacity flex gap-2",
        isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )}>
        <button 
          onClick={handleFullscreen}
          className="bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors touch-manipulation"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? 
            <Minimize className="h-4 w-4 sm:h-5 sm:w-5" /> : 
            <Maximize className="h-4 w-4 sm:h-5 sm:w-5" />
          }
        </button>
        
        <button 
          onClick={onOpenInNewTab}
          className="bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors touch-manipulation"
          title="Open stream in new tab"
          aria-label="Open stream in new tab"
        >
          <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </>
  );
};

export default PlayerControls;
