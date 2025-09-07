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
      
      const streamsData = await fetchAllStreams(match);
      setAllStreams(streamsData);
      
      // Auto-select the first available HD stream or fallback to first stream
      const firstSource = Object.keys(streamsData)[0];
      if (firstSource && streamsData[firstSource].length > 0) {
        const streams = streamsData[firstSource];
        const hdStream = streams.find(s => s.hd) || streams[0];
        
        if (hdStream) {
          setCurrentStream({
            ...hdStream,
            timestamp: Date.now()
          });
          setActiveSource(firstSource);
          console.log(`✅ Auto-selected ${hdStream.hd ? 'HD' : 'SD'} stream from ${firstSource}`);
        }
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

  // Enhanced stream fetching with isolated error handling
  const fetchStreamData = useCallback(async (source: Source, streamNo?: number) => {
    setStreamLoading(true);
    const sourceKey = streamNo 
      ? `${source.source}/${source.id}/${streamNo}` 
      : `${source.source}/${source.id}`;
    setActiveSource(sourceKey);
    
    try {
      console.log(`🎯 Fetching fresh stream: ${source.source}/${source.id}${streamNo ? `/${streamNo}` : ''}`);
      
      // Create isolated request with unique timeout
      const streamData = await Promise.race([
        fetchStream(source.source, source.id, streamNo),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Stream timeout')), 10000)
        )
      ]) as Stream | Stream[];
      
      console.log('✅ Fresh stream data received successfully');
      
      // Handle response
      if (Array.isArray(streamData)) {
        const selectedStream = streamNo 
          ? streamData.find(s => s.streamNo === streamNo)
          : streamData.find(s => s.hd) || streamData[0];
        
        if (selectedStream) {
          const freshStream: Stream = {
            ...selectedStream,
            embedUrl: selectedStream.embedUrl,
            timestamp: Date.now()
          };
          setCurrentStream(freshStream);
        } else {
          throw new Error('No valid stream found in response');
        }
      } else if (streamData) {
        const freshStream: Stream = {
          ...streamData,
          timestamp: Date.now()
        };
        setCurrentStream(freshStream);
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
      console.error(`❌ Stream load error for ${sourceKey}:`, error);
      setCurrentStream(null);
      
      // Show error message without auto-retry to prevent cascading failures
      toast({
        title: "Stream Unavailable",
        description: `Failed to load stream from ${source.source}. Try another source.`,
        variant: "destructive",
      });
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
    
    // Clear current stream and reset state
    setCurrentStream(null);
    setStreamLoading(true);
    
    if (featuredMatch) {
      // Immediate fresh load without delay to prevent interference
      await fetchStreamData({ source, id }, streamNo);
    }
  };

  const handleStreamRetry = async () => {
    console.log('🔄 Retrying current stream...');
    
    // Clear current stream and reset state
    setCurrentStream(null);
    setStreamLoading(true);
    
    if (activeSource && featuredMatch?.sources) {
      // Parse the active source to retry the same stream
      const [source, id, streamNo] = activeSource.split('/');
      const sourceObj = featuredMatch.sources.find(s => s.source === source && s.id === id);
      
      if (sourceObj) {
        await fetchStreamData(sourceObj, streamNo ? parseInt(streamNo) : undefined);
      } else {
        // Fallback to first available source
        const firstNonAdmin = featuredMatch.sources.find(s => !s.source?.toLowerCase().includes('admin'));
        await fetchStreamData(firstNonAdmin || featuredMatch.sources[0]);
      }
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