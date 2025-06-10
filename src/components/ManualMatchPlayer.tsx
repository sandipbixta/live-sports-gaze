
import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, Maximize } from 'lucide-react';

interface ManualMatchPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  streamUrl: string;
  title: string;
}

const ManualMatchPlayer: React.FC<ManualMatchPlayerProps> = ({
  isOpen,
  onClose,
  streamUrl,
  title
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen && videoRef.current && streamUrl) {
      const video = videoRef.current;
      
      // Check if the browser supports HLS natively
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        // For browsers that don't support HLS natively, you might want to use hls.js
        console.log('HLS not supported natively, consider using hls.js library');
        video.src = streamUrl;
      }
    }
  }, [isOpen, streamUrl]);

  const toggleFullscreen = async () => {
    if (!videoRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] bg-[#0A0F1C] border-[#343a4d]">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            controls
            autoPlay
            className="w-full h-full object-contain"
            onError={(e) => console.error('Video error:', e)}
          >
            Your browser does not support the video tag.
          </video>
          
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="bg-black/50 hover:bg-black/70 text-white"
            >
              <Maximize className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualMatchPlayer;
