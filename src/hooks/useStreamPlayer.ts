import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { Match, Stream, Source } from '../types/sports';
import { fetchStream, fetchAllStreams } from '../api/sportsApi';

export const useStreamPlayer = () => {
  const { toast } = useToast();
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [allStreams, setAllStreams] = useState<Record<string, Stream[]>>({});

  // Enhanced function to fetch ALL streams from ALL sources
  const fetchAllMatchStreams = useCallback(async (match: Match) => {
    setStreamLoading(true);
    
    try {
      console.log(`🎯 Fetching ALL streams for match: ${match.title}`);
      console.log(`📋 Match sources available:`, match.sources);
      
      const streamsData = await fetchAllStreams(match);
      setAllStreams(streamsData);
      console.log(`📦 Raw streams data received:`, streamsData);
      
      // Auto-select the first available HD stream or fallback to first stream
      const firstSource = Object.keys(streamsData)[0];
      if (firstSource && streamsData[firstSource].length > 0) {
        const streams = streamsData[firstSource];
        const hdStream = streams.find(s => s.hd) || streams[0];
        
        if (hdStream) {
          console.log(`🎥 Selected stream details:`, {
            source: firstSource,
            embedUrl: hdStream.embedUrl,
            isHD: hdStream.hd,
            hasEmbedUrl: !!hdStream.embedUrl
          });
          
          setCurrentStream({
            ...hdStream,
            timestamp: Date.now()
          });
          setActiveSource(firstSource);
          console.log(`✅ Auto-selected ${hdStream.hd ? 'HD' : 'SD'} stream from ${firstSource}`);
        } else {
          console.warn('⚠️ No valid stream found in first source');
        }
      } else {
        console.warn('⚠️ No streams found or first source is empty');
      }
      
      console.log(`🎬 Total streams loaded: ${Object.values(streamsData).flat().length} from ${Object.keys(streamsData).length} sources`);
      
    } catch (error) {
      console.error('❌ Error fetching all streams:', error);
      toast({
        title: "Stream Loading Failed", 
        description: "Unable to load streams for this match. Please try again.",
        variant: "destructive"
      });
      setAllStreams({});
      setCurrentStream(null);
    } finally {
      setStreamLoading(false);
    }
  }, [toast]);

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
          const freshStream: Stream = {
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
        const freshStream: Stream = {
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

  // Match selection with comprehensive stream loading
  const handleMatchSelect = useCallback(async (match: Match) => {
    console.log(`🎯 Selected match: ${match.title}`);
    setFeaturedMatch(match);
    
    // Fetch all streams for this match from all sources
    await fetchAllMatchStreams(match);
    
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
  }, [fetchAllMatchStreams]);

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
    allStreams,
    handleMatchSelect,
    handleSourceChange,
    handleStreamRetry,
    setFeaturedMatch,
    fetchStreamData,
    fetchAllMatchStreams
  };
};