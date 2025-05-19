
import React, { RefObject } from 'react';
import { Fullscreen } from 'lucide-react';

interface FullscreenControlsProps {
  isFullscreen: boolean;
  playerContainerRef: RefObject<HTMLDivElement>;
  toggleFullscreen: () => void;
  isMobile: boolean;
}

const FullscreenControls: React.FC<FullscreenControlsProps> = ({
  isFullscreen,
  playerContainerRef,
  toggleFullscreen,
  isMobile
}) => {
  return (
    <button 
      onClick={toggleFullscreen}
      className="bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-colors"
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      <Fullscreen className="h-5 w-5 sm:h-6 sm:w-6" />
    </button>
  );
};

export default FullscreenControls;
