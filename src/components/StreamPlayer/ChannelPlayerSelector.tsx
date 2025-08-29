import React from 'react';
import { Stream } from '../../types/sports';
import SimpleVideoPlayer from './SimpleVideoPlayer';
import Html5VideoPlayer from './Html5VideoPlayer';
import IframeVideoPlayer from './IframeVideoPlayer';
import VideoPlayerSelector from './VideoPlayerSelector';
import CustomChannelPlayer from './CustomChannelPlayer';
import ExtractedVideoPlayer from './ExtractedVideoPlayer';
import HLSVideoPlayer from './HLSVideoPlayer';

export type PlayerType = 'simple' | 'html5' | 'iframe' | 'basic' | 'custom' | 'extracted' | 'hls';

interface ChannelPlayerSelectorProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry?: () => void;
  playerType?: PlayerType;
  isTheaterMode?: boolean;
  onTheaterModeToggle?: () => void;
  title?: string;
}

const ChannelPlayerSelector: React.FC<ChannelPlayerSelectorProps> = ({
  stream,
  isLoading,
  onRetry,
  playerType = 'simple',
  isTheaterMode = false,
  onTheaterModeToggle,
  title
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleLoad = () => {
    console.log('✅ Channel player loaded successfully');
  };

  const handleError = () => {
    console.error('❌ Channel player failed to load');
    if (onRetry) onRetry();
  };

  if (isLoading) {
    return (
      <div className={`w-full ${isTheaterMode ? 'max-w-none' : 'max-w-5xl'} mx-auto aspect-video bg-black rounded-lg flex items-center justify-center`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading channel...</p>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className={`w-full ${isTheaterMode ? 'max-w-none' : 'max-w-5xl'} mx-auto aspect-video bg-gray-900 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-white p-6">
          <h3 className="text-lg font-semibold mb-2">No Channel Available</h3>
          <p className="text-gray-400">Please select a channel to watch.</p>
        </div>
      </div>
    );
  }

  const embedUrl = stream.embedUrl?.startsWith('http://') 
    ? stream.embedUrl.replace(/^http:\/\//i, 'https://') 
    : stream.embedUrl || '';

  // Check if it's a direct stream (streamUrl exists)
  const isDirectStream = !!stream.streamUrl;
  const sourceUrl = isDirectStream ? stream.streamUrl : embedUrl;
  
  // Check if it's HLS stream (.ts or .m3u8)
  const isHLSStream = isDirectStream && (sourceUrl.includes('.ts') || sourceUrl.includes('.m3u8'));

  switch (playerType) {
    case 'hls':
      return (
        <div className={`${isTheaterMode ? 'w-full max-w-none' : 'w-full max-w-5xl mx-auto'}`}>
          <HLSVideoPlayer
            src={sourceUrl}
            title={title}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      );
    
    case 'extracted':
      return (
        <div className={`${isTheaterMode ? 'w-full max-w-none' : 'w-full max-w-5xl mx-auto'}`}>
          <ExtractedVideoPlayer
            embedUrl={isDirectStream ? sourceUrl : embedUrl}
            title={title}
            onError={handleError}
          />
        </div>
      );
    
    case 'custom':
      return (
        <div className={`${isTheaterMode ? 'w-full max-w-none' : 'w-full max-w-5xl mx-auto'}`}>
          <CustomChannelPlayer
            embedUrl={isDirectStream ? sourceUrl : embedUrl}
            title={title}
            onError={handleError}
          />
        </div>
      );
    
    case 'html5':
      return (
        <div className={`relative ${isTheaterMode ? 'w-full max-w-none' : 'w-full max-w-5xl mx-auto'} aspect-video`}>
          <Html5VideoPlayer
            src={sourceUrl}
            onLoad={handleLoad}
            onError={handleError}
            videoRef={videoRef}
          />
        </div>
      );
    
    case 'iframe':
      return (
        <div className={`relative ${isTheaterMode ? 'w-full max-w-none' : 'w-full max-w-5xl mx-auto'} aspect-video`}>
          <IframeVideoPlayer
            src={isDirectStream ? sourceUrl : embedUrl}
            onLoad={handleLoad}
            onError={handleError}
            title={title}
          />
        </div>
      );
    
    case 'basic':
      return (
        <VideoPlayerSelector
          src={sourceUrl}
          onLoad={handleLoad}
          onError={handleError}
          title={title}
          isDirectStream={isDirectStream}
        />
      );
    
    case 'simple':
    default:
      // For HLS streams, use HLS player by default
      if (isHLSStream) {
        return (
          <div className={`${isTheaterMode ? 'w-full max-w-none' : 'w-full max-w-5xl mx-auto'}`}>
            <HLSVideoPlayer
              src={sourceUrl}
              title={title}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        );
      }
      
      return (
        <SimpleVideoPlayer
          stream={stream}
          isLoading={isLoading}
          onRetry={onRetry}
          isTheaterMode={isTheaterMode}
          onTheaterModeToggle={onTheaterModeToggle}
        />
      );
  }
};

export default ChannelPlayerSelector;