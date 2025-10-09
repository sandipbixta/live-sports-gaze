import React, { useEffect, useRef } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { ManualMatch } from '@/types/manualMatch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Hls from 'hls.js';

interface ManualMatchPlayerProps {
  match: ManualMatch | null;
  isOpen: boolean;
  onClose: () => void;
}

const ManualMatchPlayer = ({ match, isOpen, onClose }: ManualMatchPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Use the first link as default
  const defaultLink = match?.links?.[0];
  const streamUrl = defaultLink?.url || '';
  
  // Check if it's a direct video stream
  const isDirectStream = streamUrl.match(/\.(m3u8|mp4|webm)(\?|$)/i);

  useEffect(() => {
    if (!isDirectStream || !videoRef.current || !streamUrl || !isOpen) return;

    const video = videoRef.current;

    // Handle HLS streams
    if (streamUrl.includes('.m3u8')) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          debug: false,
          xhrSetup: (xhr: any) => {
            xhr.withCredentials = false; // Disable credentials for CORS
          }
        });
        
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest loaded, attempting to play...');
          video.play().catch(err => {
            console.error('Error playing video:', err);
          });
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal error, destroying HLS instance');
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;

        return () => {
          if (hls) {
            hls.destroy();
          }
        };
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        console.log('Using native HLS support');
        video.src = streamUrl;
        video.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
    } else {
      // Direct MP4 or other formats
      video.src = streamUrl;
      video.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [streamUrl, isDirectStream, isOpen]);

  const handleFullscreen = () => {
    const element = isDirectStream 
      ? videoRef.current 
      : document.querySelector('#manual-stream-iframe') as HTMLIFrameElement;
      
    if (element?.requestFullscreen) {
      element.requestFullscreen();
    }
  };

  if (!match) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-6xl w-full h-[85vh] bg-[#0A0F1C] border-[#343a4d] p-0">
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
        
        <div className="flex-1 p-2">
          <div className="w-full h-full bg-black rounded-lg overflow-hidden">
            {isDirectStream ? (
              <video
                ref={videoRef}
                className="w-full h-full"
                controls
                playsInline
                autoPlay
                style={{ 
                  background: 'black',
                  objectFit: 'contain'
                }}
              />
            ) : defaultLink ? (
              <iframe
                id="manual-stream-iframe"
                src={defaultLink.url}
                width="100%"
                height="100%"
                allowFullScreen
                title={`${match.teams.home} vs ${match.teams.away} Stream`}
                style={{ 
                  border: 'none',
                  background: 'black'
                }}
              />
            ) : null}
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
