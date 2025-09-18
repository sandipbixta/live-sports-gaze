import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { Match, Stream, Source } from '../types/sports';
import { fetchSimpleStream, fetchAllMatchStreams } from '../api/sportsApi';

export const useStreamPlayer = () => {
  const { toast } = useToast();
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [allStreams, setAllStreams] = useState<Record<string, Stream[]>>({});

  // Simple function to fetch ALL streams from ALL sources (like HTML example)
  const fetchAllStreamsForMatch = useCallback(async (match: Match) => {
    setStreamLoading(true);
    
    try {
      console.log(`🎯 Fetching ALL streams for match: ${match.title}`);
      
      // Use the simple stream fetching approach but maintain compatibility
      const streams = await fetchAllMatchStreams(match);
      
      // Convert simple array back to Record format for compatibility
      const streamsData: Record<string, Stream[]> = {};
      
      // Group streams by source
      streams.forEach(stream => {
        const sourceKey = `${stream.source}/${match.sources.find(s => s.source === stream.source)?.id}`;
        if (!streamsData[sourceKey]) {
          streamsData[sourceKey] = [];
        }
        streamsData[sourceKey].push(stream);
      });
      
      setAllStreams(streamsData);
      
      // Auto-select first available stream (like HTML example)
      const sourceKeys = Object.keys(streamsData);
      if (sourceKeys.length > 0 && streamsData[sourceKeys[0]].length > 0) {
        const firstStream = streamsData[sourceKeys[0]][0];
        setCurrentStream({
          ...firstStream,
          timestamp: Date.now()
        });
        setActiveSource(sourceKeys[0]);
        console.log(`✅ Auto-selected first stream from ${firstStream.source}`);
      }
      
      console.log(`🎬 Total streams loaded: ${streams.length} from ${sourceKeys.length} sources`);
      
    } catch (error) {
      console.error('❌ Error fetching all streams:', error);
      setAllStreams({});
      setCurrentStream(null);
    } finally {
      setStreamLoading(false);
    }
  }, []);

  // Simplified stream fetching (like HTML example)
  const fetchStreamData = useCallback(async (source: Source, streamNo?: number) => {
    setStreamLoading(true);
    const sourceKey = `${source.source}/${source.id}`;
    setActiveSource(sourceKey);
    
    try {
      console.log(`🎯 Fetching stream: ${source.source}/${source.id}`);
      
      // Simple direct API call like HTML example
      const streams = await fetchSimpleStream(source.source, source.id);
      
      if (streams.length > 0) {
        const selectedStream = streamNo 
          ? streams.find(s => s.streamNo === streamNo)
          : streams[0]; // Just pick first one like HTML example
        
        if (selectedStream) {
          const freshStream: Stream = {
            ...selectedStream,
            timestamp: Date.now()
          };
          setCurrentStream(freshStream);
          console.log(`✅ Stream loaded successfully`);
        }
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
    } finally {
      setStreamLoading(false);
    }
  }, []);

  // Match selection with comprehensive stream loading
  const handleMatchSelect = useCallback(async (match: Match) => {
    console.log(`🎯 Selected match: ${match.title}`);
    setFeaturedMatch(match);
    
    // Fetch all streams for this match from all sources
    await fetchAllStreamsForMatch(match);
    
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
  }, [fetchAllStreamsForMatch]);

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
        fetchStreamData(featuredMatch.sources[0]);
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
    fetchAllMatchStreams: fetchAllStreamsForMatch
  };
};