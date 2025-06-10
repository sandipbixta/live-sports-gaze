import React, { useState, useEffect, useRef } from 'react';
import { Stream } from '@/types/sports';
import { AspectRatio } from '../components/ui/aspect-ratio';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { ReloadIcon, AlertCircle } from 'lucide-react';
import { useIsMobile } from '../hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry: () => void;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ stream, isLoading, onRetry }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [retryCount, setRetryCount] = useState(0);
  const [streamError, setStreamError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Handle channel redirect streams
  useEffect(() => {
    if (stream && stream.source === 'manual-channel' && stream.embedUrl.startsWith('/channel/redirect/')) {
      const channelId = stream.embedUrl.replace('/channel/redirect/', '');
      console.log('Redirecting to channel player for:', channelId);
      
      toast({
        title: "Opening TV Channel",
        description: `Redirecting to ${channelId.replace(/-/g, ' ')} channel...`,
      });
      
      // Navigate to the channel player page with the channel ID
      const countryCode = 'UK'; // Default to UK, you can make this dynamic
      navigate(`/channel/${countryCode}/${channelId}`);
      return;
    }
  }, [stream, navigate, toast]);

  // Reset error state on stream change
  useEffect(() => {
    setStreamError(false);
    setRetryCount(0);
    setIsReady(false);
  }, [stream]);

  // Function to handle iframe load
  const handleIframeLoad = () => {
    setIsReady(true);
  };

  // Function to handle iframe error
  const handleIframeError = () => {
    setStreamError(true);
    setIsReady(false);
  };

  // Retry logic
  useEffect(() => {
    if (streamError && retryCount < 3) {
      const timer = setTimeout(() => {
        onRetry();
        setRetryCount(retryCount + 1);
        setStreamError(false); // Reset error state for the next try
      }, 3000); // Retry after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [streamError, retryCount, onRetry]);

  return (
    <Card className="bg-sports-card border-sports">
      <AspectRatio ratio={16 / 9}>
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : stream && stream.embedUrl ? (
          <>
            <iframe
              ref={iframeRef}
              src={stream.embedUrl}
              title="Live Stream"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0"
              style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
            {!isReady && (
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/50">
                {streamError ? (
                  <div className="text-center">
                    <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-white text-sm mb-2">Stream failed to load.</p>
                    {retryCount < 3 ? (
                      <p className="text-gray-400 text-xs">Retrying in a few seconds...</p>
                    ) : (
                      <Button variant="outline" size="sm" onClick={onRetry}>
                        <ReloadIcon className="mr-2 h-4 w-4" />
                        Retry Stream
                      </Button>
                    )}
                  </div>
                ) : (
                  <Skeleton className="h-full w-full absolute" />
                )}
              </div>
            )}
          </>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-black/80">
            <p className="text-white text-center">No stream available.</p>
          </div>
        )}
      </AspectRatio>
    </Card>
  );
};

export default StreamPlayer;
