
import React, { RefObject } from 'react';
import { Maximize, Minimize } from 'lucide-react';

interface PictureInPictureControlsProps {
  isPictureInPicture: boolean;
  videoRef: RefObject<HTMLIFrameElement>;
  togglePictureInPicture: () => void;
  isMobile: boolean;
}

const PictureInPictureControls: React.FC<PictureInPictureControlsProps> = ({
  isPictureInPicture,
  videoRef,
  togglePictureInPicture,
  isMobile
}) => {
  return (
    <button 
      onClick={togglePictureInPicture}
      className="bg-black/60 hover:bg-black/80 text-white p-2 sm:p-3 rounded-full transition-colors"
      title={isPictureInPicture ? "Exit picture-in-picture" : "Enter picture-in-picture"}
      aria-label={isPictureInPicture ? "Exit picture-in-picture" : "Enter picture-in-picture"}
    >
      {isPictureInPicture ? 
        <Minimize className="h-5 w-5 sm:h-6 sm:w-6" /> : 
        <Maximize className="h-5 w-5 sm:h-6 sm:w-6" />
      }
    </button>
  );
};

export default PictureInPictureControls;
