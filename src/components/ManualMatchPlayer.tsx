import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, Maximize } from 'lucide-react';

interface ManualMatchPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  streamUrl: string; // This will now be the embed URL
  title: string;
}

const ManualMatchPlayer: React.FC<ManualMatchPlayerProps> = ({
  isOpen,
  onClose,
  streamUrl,
  title
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    const iframe = document.getElementById('manual-iframe');
    if (!iframe) return;

    try {
      if (!document.fullscreenElement) {
        await iframe.requestFullscreen();
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

        <div className="relative flex-1 rounded-lg overflow-hidden bg-black aspect-video">
          <iframe
            id="manual-iframe"
            title={title}
            src={streamUrl}
            className="w-full h-full rounded"
            allowFullScreen
            allow="encrypted-media; picture-in-picture"
            frameBorder="0"
          />

          <div className="absolute top-2 right-2 flex gap-2 z-10">
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
