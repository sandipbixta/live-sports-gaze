
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { Match, Stream, Source } from '../types/sports';
import { fetchStream } from '../api/sportsApi';

export const useStreamPlayer = () => {
  const { toast } = useToast();
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<string | null>(null);

  // Memoized stream fetching function
  const fetchStreamData = useCallback(async (source: Source, streamNo?: number) => {
    setStreamLoading(true);
    const sourceKey = streamNo 
      ? `${source.source}/${source.id}/${streamNo}` 
      : `${source.source}/${source.id}`;
    setActiveSource(sourceKey);
    
    try {
      console.log(`Fetching stream data: source=${source.source}, id=${source.id}, streamNo=${streamNo}`);
      const streamData = await fetchStream(source.source, source.id, streamNo);
      console.log('Stream data received:', streamData);
      
      // Handle both single stream and array of streams
      if (Array.isArray(streamData)) {
        // If array, pick the requested streamNo or the first HD stream
        const selectedStream = streamNo 
          ? streamData.find(s => s.streamNo === streamNo)
          : streamData.find(s => s.hd) || streamData[0];
        
        setCurrentStream(selectedStream || null);
      } else {
        setCurrentStream(streamData);
      }
      
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

  // Function to handle match selection
  const handleMatchSelect = (match: Match) => {
    setFeaturedMatch(match);
    if (match.sources && match.sources.length > 0) {
      fetchStreamData(match.sources[0]);
    } else {
      setCurrentStream(null);
      toast({
        title: "No Stream",
        description: "This match has no available streams.",
        variant: "destructive",
      });
    }
  };

  // Function to handle source change for the current match
  const handleSourceChange = (source: string, id: string, streamNo?: number) => {
    if (featuredMatch) {
      fetchStreamData({ source, id }, streamNo);
    }
  };

  // Handle stream retry
  const handleStreamRetry = () => {
    if (featuredMatch?.sources && featuredMatch.sources.length > 0) {
      fetchStreamData(featuredMatch.sources[0]);
    }
  };

  return {
    featuredMatch,
    currentStream,
    streamLoading,
    activeSource,
    handleMatchSelect,
    handleSourceChange,
    handleStreamRetry,
    setFeaturedMatch,
    fetchStreamData
  };
};
