
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { Stream } from '../types/sports';
import { fetchStream } from '../api/sportsApi';

export const useStreamData = () => {
  const { toast } = useToast();
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<string | null>(null);

  // Memoized stream fetching function
  const fetchStreamData = useCallback(async (source: { source: string, id: string }) => {
    setStreamLoading(true);
    setActiveSource(`${source.source}/${source.id}`);
    try {
      console.log(`Fetching stream data: source=${source.source}, id=${source.id}`);
      const stream = await fetchStream(source.source, source.id);
      console.log('Stream data received:', stream);
      
      // Validate the stream
      if (stream.error || !stream.embedUrl) {
        console.error('Stream has error or missing embedUrl:', stream);
        toast({
          title: "Stream Issues",
          description: "This stream may not be available. Try another source.",
          variant: "destructive",
        });
      }
      
      setCurrentStream(stream);
      // Scroll to player if not in view
      const playerElement = document.getElementById('stream-player');
      if (playerElement) {
        playerElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (error) {
      console.error('Error loading stream:', error);
      toast({
        title: "Error",
        description: "Failed to load stream.",
        variant: "destructive",
      });
      setCurrentStream(null);
    } finally {
      setStreamLoading(false);
    }
  }, [toast]);

  return {
    currentStream,
    setCurrentStream,
    streamLoading,
    activeSource,
    setActiveSource,
    fetchStreamData
  };
};
