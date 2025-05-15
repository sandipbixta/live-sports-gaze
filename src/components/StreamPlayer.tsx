
import React, { useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Stream } from '../types/sports';
import { Loader, Maximize, Minimize, Video } from 'lucide-react';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ stream, isLoading }) => {
  const videoRef = useRef<HTMLIFrameElement>(null);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  
  const togglePictureInPicture = async () => {
    try {
      // For modern browsers with PiP API
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPictureInPicture(false);
      } else if (videoRef.current) {
        // Try to enter PiP mode - this is tricky with iframes but we'll try
        // We need to access the video element inside the iframe
        const iframeDocument = videoRef.current.contentDocument || videoRef.current.contentWindow?.document;
        const videoElement = iframeDocument?.querySelector('video');
        
        if (videoElement && videoElement.requestPictureInPicture) {
          await videoElement.requestPictureInPicture();
          setIsPictureInPicture(true);
        } else {
          console.error('Picture-in-picture not supported or video element not found in iframe');
        }
      }
    } catch (error) {
      console.error('Failed to toggle picture-in-picture mode:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-[#9b87f5]" />
            <p className="text-xl">Loading stream...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-xl">No live stream available</p>
            <p className="text-sm text-gray-400 mt-2">Check back closer to match time</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have a valid stream URL
  const validEmbedUrl = stream.embedUrl && stream.embedUrl.startsWith('http');
  
  if (!validEmbedUrl) {
    return (
      <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <p className="text-xl">Stream unavailable</p>
            <p className="text-sm text-gray-400 mt-2">Please try another source</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#151922] rounded-lg overflow-hidden shadow-xl group">
      <iframe 
        ref={videoRef}
        src={stream.embedUrl}
        className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px]"
        allowFullScreen
        title="Live Sports Stream"
      ></iframe>
      
      {/* Controls overlay */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={togglePictureInPicture}
          className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          title={isPictureInPicture ? "Exit picture-in-picture" : "Enter picture-in-picture"}
        >
          {isPictureInPicture ? 
            <Minimize className="h-5 w-5" /> : 
            <Maximize className="h-5 w-5" />
          }
        </button>
      </div>
    </div>
  );
};

export default StreamPlayer;
