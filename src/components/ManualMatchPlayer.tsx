
import React from 'react';
import { X, Maximize2 } from 'lucide-react';
import { ManualMatch } from '@/data/manualMatches';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ManualMatchPlayerProps {
  match: ManualMatch | null;
  isOpen: boolean;
  onClose: () => void;
}

const ManualMatchPlayer = ({ match, isOpen, onClose }: ManualMatchPlayerProps) => {
  const handleFullscreen = () => {
    const iframe = document.querySelector('#manual-stream-iframe') as HTMLIFrameElement;
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    }
  };

  if (!match) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[80vh] bg-[#0A0F1C] border-[#343a4d] p-0">
        <DialogHeader className="p-4 pb-2 border-b border-[#343a4d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white font-bold">
              {match.teams.home} vs {match.teams.away}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFullscreen}
                className="text-gray-400 hover:text-white hover:bg-[#343a4d]"
                title="Fullscreen"
              >
                <Maximize2 size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-[#343a4d]"
              >
                <X size={18} />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-4">
          <div className="w-full h-full bg-black rounded-lg overflow-hidden">
            <iframe
              id="manual-stream-iframe"
              src={match.embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={`${match.teams.home} vs ${match.teams.away} Stream`}
            />
          </div>
        </div>
        
        <div className="p-4 pt-0 border-t border-[#343a4d] bg-[#242836]">
          <p className="text-gray-400 text-sm text-center">
            {match.title} • {new Date(match.date).toLocaleString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManualMatchPlayer;
