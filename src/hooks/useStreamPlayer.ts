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

  // Remove the complex fetchAllMatchStreams since we're simplifying
  // Remove allStreams state since we're just using one stream like HTML

  // Simplified stream fetching like HTML code
  const fetchStreamData = useCallback(async (source: Source, streamNo?: number) => {
    setStreamLoading(true);
    setActiveSource(`${source.source}/${source.id}`);
    
    try {
      console.log(`🎯 Fetching stream: ${source.source}/${source.id}`);
      
      const streams = await fetchStream(source.source, source.id);
      
      if (streams && streams.length > 0) {
        // Like HTML: just take the first stream
        const firstStream = streams[0];
        setCurrentStream({
          ...firstStream,
          timestamp: Date.now()
        });
        console.log(`✅ Using first stream with embedUrl: ${firstStream.embedUrl}`);
      } else {
        setCurrentStream(null);
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

  // Simplified match selection like HTML code
  const handleMatchSelect = useCallback(async (match: Match) => {
    console.log(`🎯 Selected match: ${match.title}`);
    setFeaturedMatch(match);
    
    // Just use the first source like HTML code does
    if (match.sources && match.sources.length > 0) {
      const firstSource = match.sources[0];
      await fetchStreamData(firstSource);
    }
    
    // Smooth scroll to player
    setTimeout(() => {
      const playerElement = document.getElementById('stream-player');
      if (playerElement) {
        playerElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }, [fetchStreamData]);

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

  // Export hook values and functions
  return {
    featuredMatch,
    currentStream,
    streamLoading,
    activeSource,
    allStreams: {} as Record<string, Stream[]>, // Simplified - no longer used
    handleMatchSelect,
    handleSourceChange,
    handleStreamRetry,
    setFeaturedMatch,
    fetchStreamData,
    // Remove fetchAllMatchStreams since we simplified
  };
};