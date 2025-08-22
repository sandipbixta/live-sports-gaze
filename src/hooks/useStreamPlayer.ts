
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { Match, Stream, Source } from '../types/sports';
import { fetchStream } from '../api/ppvApi';

export const useStreamPlayer = () => {
  const { toast } = useToast();
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<string | null>(null);

  // Enhanced stream fetching with better reload handling
  const fetchStreamData = useCallback(async (source: Source, streamNo?: number) => {
    setStreamLoading(true);
    const sourceKey = streamNo 
      ? `${source.source}/${source.id}/${streamNo}` 
      : `${source.source}/${source.id}`;
    setActiveSource(sourceKey);
    
    try {
      console.log(`🎯 Fetching fresh stream: ${source.source}/${source.id}${streamNo ? `/${streamNo}` : ''}`);
      
      // Always fetch fresh data, no cache for streams
      const streamData = await Promise.race([
        fetchStream(source.source, source.id, streamNo),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Stream timeout')), 8000) // 8 seconds timeout
        )
      ]) as Stream | Stream[];
      
      console.log('✅ Fresh stream data received successfully');
      
      // Handle response
      if (Array.isArray(streamData)) {
        const selectedStream = streamNo 
          ? streamData.find(s => s.streamNo === streamNo)
          : streamData.find(s => s.hd) || streamData[0];
        
        if (selectedStream) {
          // Add timestamp to ensure freshness
          const freshStream = {
            ...selectedStream,
            embedUrl: selectedStream.embedUrl,
            timestamp: Date.now()
          };
          setCurrentStream(freshStream);
        } else {
          setCurrentStream(null);
        }
      } else if (streamData) {
        // Add timestamp to ensure freshness
        const freshStream = {
          ...streamData,
          timestamp: Date.now()
        };
        setCurrentStream(freshStream);
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
      setCurrentStream(null);
      
      // Show more helpful error message
      toast({
        title: "Stream Loading Issue",
        description: "Stream failed to load. Trying to refresh automatically...",
        variant: "default",
      });
      
      // Auto-retry once after a short delay
      setTimeout(() => {
        console.log('🔄 Auto-retrying stream load...');
        fetchStreamData(source, streamNo);
      }, 2000);
    } finally {
      setStreamLoading(false);
    }
  }, [toast]);

  const handleMatchSelect = (match: Match) => {
    console.log('🎬 Match selected:', match.title);
    setFeaturedMatch(match);
    setCurrentStream(null); // Clear current stream first
    
    if (match.sources && match.sources.length > 0) {
      // Force fresh load
      setTimeout(() => {
        const firstNonAdmin = match.sources.find(s => !s.source?.toLowerCase().includes('admin'));
        fetchStreamData(firstNonAdmin || match.sources[0]);
      }, 100);
    }
  };

  const handleSourceChange = async (source: string, id: string, streamNo?: number) => {
    console.log(`🔄 Source change requested: ${source}/${id}/${streamNo || 'default'}`);
    setCurrentStream(null); // Clear current stream first
    
    if (featuredMatch) {
      // Force fresh load with delay
      setTimeout(() => {
        fetchStreamData({ source, id }, streamNo);
      }, 100);
    }
  };

  const handleStreamRetry = () => {
    console.log('🔄 Retrying stream...');
    setCurrentStream(null); // Clear current stream first
    
    if (featuredMatch?.sources && featuredMatch.sources.length > 0) {
      // Force fresh load with delay
      setTimeout(() => {
        const firstNonAdmin = featuredMatch.sources.find(s => !s.source?.toLowerCase().includes('admin'));
        fetchStreamData(firstNonAdmin || featuredMatch.sources[0]);
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
