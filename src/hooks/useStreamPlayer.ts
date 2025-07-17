
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
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [maxRetries] = useState(2); // Limit retries to prevent infinite loops

  // Enhanced stream fetching with better error handling and retry limits
  const fetchStreamData = useCallback(async (source: Source, streamNo?: number) => {
    if (retryAttempts >= maxRetries) {
      console.log('🛑 Max retries reached, stopping automatic retries');
      setStreamLoading(false);
      return;
    }

    setStreamLoading(true);
    const sourceKey = streamNo 
      ? `${source.source}/${source.id}/${streamNo}` 
      : `${source.source}/${source.id}`;
    setActiveSource(sourceKey);
    
    try {
      console.log(`🎯 Fetching stream: ${source.source}/${source.id}${streamNo ? `/${streamNo}` : ''} (attempt ${retryAttempts + 1}/${maxRetries + 1})`);
      
      // Always fetch fresh data, no cache for streams
      const streamData = await Promise.race([
        fetchStream(source.source, source.id, streamNo),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stream timeout')), 10000) // 10 seconds timeout
        )
      ]) as Stream | Stream[];
      
      console.log('✅ Stream data received successfully');
      
      // Handle response
      if (Array.isArray(streamData)) {
        const selectedStream = streamNo 
          ? streamData.find(s => s.streamNo === streamNo)
          : streamData.find(s => s.hd) || streamData[0];
        
        if (selectedStream) {
          const freshStream = {
            ...selectedStream,
            embedUrl: selectedStream.embedUrl,
            timestamp: Date.now()
          };
          setCurrentStream(freshStream);
          setRetryAttempts(0); // Reset retry count on success
        } else {
          throw new Error('No valid stream found in response');
        }
      } else if (streamData) {
        const freshStream = {
          ...streamData,
          timestamp: Date.now()
        };
        setCurrentStream(freshStream);
        setRetryAttempts(0); // Reset retry count on success
      } else {
        throw new Error('Invalid stream data received');
      }
      
      // Smooth scroll to player
      setTimeout(() => {
        const playerElement = document.getElementById('stream-player');
        if (playerElement) {
          playerElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 200);
    } catch (error) {
      console.error('❌ Stream load error:', error);
      setRetryAttempts(prev => prev + 1);
      
      // Only show toast on first error, not on retries
      if (retryAttempts === 0) {
        toast({
          title: "Stream Loading Issue",
          description: "Trying alternative methods to load the stream...",
          variant: "default",
        });
      }
      
      // Don't auto-retry - let user manually retry
      setCurrentStream(null);
    } finally {
      setStreamLoading(false);
    }
  }, [toast, retryAttempts, maxRetries]);

  const handleMatchSelect = (match: Match) => {
    console.log('🎬 Match selected:', match.title);
    setFeaturedMatch(match);
    setCurrentStream(null);
    setRetryAttempts(0); // Reset retry attempts for new match
    
    if (match.sources && match.sources.length > 0) {
      setTimeout(() => {
        fetchStreamData(match.sources[0]);
      }, 100);
    }
  };

  const handleSourceChange = async (source: string, id: string, streamNo?: number) => {
    console.log(`🔄 Source change requested: ${source}/${id}/${streamNo || 'default'}`);
    setCurrentStream(null);
    setRetryAttempts(0); // Reset retry attempts for new source
    
    if (featuredMatch) {
      setTimeout(() => {
        fetchStreamData({ source, id }, streamNo);
      }, 100);
    }
  };

  const handleStreamRetry = () => {
    console.log('🔄 Manual retry requested...');
    setCurrentStream(null);
    setRetryAttempts(0); // Reset retry attempts on manual retry
    
    if (featuredMatch?.sources && featuredMatch.sources.length > 0) {
      setTimeout(() => {
        fetchStreamData(featuredMatch.sources[0]);
      }, 100);
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
