
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

  // Optimized stream fetching with better reload handling
  const fetchStreamData = useCallback(async (source: Source, streamNo?: number) => {
    setStreamLoading(true);
    const sourceKey = streamNo 
      ? `${source.source}/${source.id}/${streamNo}` 
      : `${source.source}/${source.id}`;
    setActiveSource(sourceKey);
    
    try {
      console.log(`🎯 Fetching stream: ${source.source}/${source.id}${streamNo ? `/${streamNo}` : ''}`);
      
      // Use a timeout but longer for better reliability
      const streamData = await Promise.race([
        fetchStream(source.source, source.id, streamNo),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stream timeout')), 5000) // Increased to 5 seconds
        )
      ]) as Stream | Stream[];
      
      console.log('✅ Stream data received successfully');
      
      // Handle response
      if (Array.isArray(streamData)) {
        const selectedStream = streamNo 
          ? streamData.find(s => s.streamNo === streamNo)
          : streamData.find(s => s.hd) || streamData[0];
        
        setCurrentStream(selectedStream || null);
      } else {
        setCurrentStream(streamData);
      }
      
      // Smooth scroll to player
      setTimeout(() => {
        const playerElement = document.getElementById('stream-player');
        if (playerElement) {
          playerElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    } catch (error) {
      console.error('❌ Stream load error:', error);
      setCurrentStream(null);
      
      // Show more helpful error message
      if (error instanceof Error && error.message === 'Stream timeout') {
        toast({
          title: "Stream Loading",
          description: "Stream is taking longer to load. Please wait or try another source.",
          variant: "default",
        });
      } else {
        toast({
          title: "Stream Error",
          description: "Failed to load stream. Try another source or refresh the page.",
          variant: "destructive",
        });
      }
    } finally {
      setStreamLoading(false);
    }
  }, [toast]);

  const handleMatchSelect = (match: Match) => {
    console.log('🎬 Match selected:', match.title);
    setFeaturedMatch(match);
    if (match.sources && match.sources.length > 0) {
      fetchStreamData(match.sources[0]);
    } else {
      setCurrentStream(null);
    }
  };

  const handleSourceChange = async (source: string, id: string, streamNo?: number) => {
    console.log(`🔄 Source change requested: ${source}/${id}/${streamNo || 'default'}`);
    if (featuredMatch) {
      fetchStreamData({ source, id }, streamNo);
    }
  };

  const handleStreamRetry = () => {
    console.log('🔄 Retrying stream...');
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
