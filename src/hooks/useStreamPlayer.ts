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
      
      // Auto-select admin stream first, then HD stream, then fallback to first available
      const isAdminSource = (sourceKey: string) => sourceKey?.toLowerCase().includes('admin');
      const sourceKeys = Object.keys(streamsData);
      
      // Prioritize admin sources first
      const adminSource = sourceKeys.find(isAdminSource);
      const preferredSource = adminSource || sourceKeys[0];
      
      console.log(`🔍 Available sources: ${sourceKeys.join(', ')}`);
      console.log(`🎯 Admin source found: ${adminSource || 'NONE'}`);
      console.log(`🎯 Selected preferred source: ${preferredSource}`);
      
      if (preferredSource && streamsData[preferredSource].length > 0) {
        const streams = streamsData[preferredSource].filter(s => !s.isPlaceholder); // Skip placeholders for auto-selection
        if (streams.length > 0) {
          const hdStream = streams.find(s => s.hd) || streams[0];
          
          if (hdStream) {
            setCurrentStream({
              ...hdStream,
              timestamp: Date.now()
            });
            setActiveSource(preferredSource);
            console.log(`✅ Auto-selected ${hdStream.hd ? 'HD' : 'SD'} stream from ${preferredSource} ${isAdminSource(preferredSource) ? '(ADMIN - Main Stream)' : ''}`);
          }
        } else if (isAdminSource(preferredSource)) {
          // If admin source only has placeholders, try next available source
          const nextSource = sourceKeys.find(key => key !== preferredSource && streamsData[key].some(s => !s.isPlaceholder));
          if (nextSource) {
            const nextStreams = streamsData[nextSource].filter(s => !s.isPlaceholder);
            const hdStream = nextStreams.find(s => s.hd) || nextStreams[0];
            
            if (hdStream) {
              setCurrentStream({
                ...hdStream,
                timestamp: Date.now()
              });
              setActiveSource(nextSource);
              console.log(`✅ Auto-selected ${hdStream.hd ? 'HD' : 'SD'} stream from ${nextSource} (admin not live yet)`);
            }
          }
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
    
    const sourceKey = `${source}/${id}`;
    const existingStreams = allStreams[sourceKey] || [];
    
    // Check if this is a placeholder stream that needs fetching
    const targetStream = existingStreams.find(s => (s.streamNo || 0) === (streamNo || 0));
    
    if (targetStream?.isPlaceholder) {
      console.log(`🔄 Detected placeholder stream, fetching fresh data for: ${source}/${id}`);
      
      // Set loading state and active source
      setStreamLoading(true);
      setActiveSource(`${source}/${id}/${streamNo || 0}`);
      
      try {
        // Fetch fresh stream data
        const freshStreamData = await fetchStream(source, id);
        let freshStreams: Stream[] = [];
        
        if (Array.isArray(freshStreamData)) {
          freshStreams = freshStreamData;
        } else if (freshStreamData) {
          freshStreams = [freshStreamData];
        }
        
        if (freshStreams.length > 0) {
          // Update allStreams with fresh data
          setAllStreams(prev => ({
            ...prev,
            [sourceKey]: freshStreams
          }));
          
          // Select the requested stream or first available
          const selectedStream = freshStreams.find(s => (s.streamNo || 0) === (streamNo || 0)) || freshStreams[0];
          setCurrentStream({
            ...selectedStream,
            timestamp: Date.now()
          });
          
          console.log(`✅ Successfully fetched live stream from ${source}`);
          toast({
            title: "Stream loaded",
            description: "Live stream is now available",
          });
        } else {
          throw new Error('No streams available yet');
        }
      } catch (error) {
        console.error('❌ Failed to fetch live stream:', error);
        toast({
          title: "Stream not ready",
          description: "This stream is not available yet. Please try again when the match is live.",
          variant: "destructive",
        });
      } finally {
        setStreamLoading(false);
      }
      return;
    }
    
    // Handle regular stream selection
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
      // Force fresh load with delay - prioritize admin sources for retry too
      setTimeout(() => {
        const adminSource = featuredMatch.sources.find(s => s.source?.toLowerCase().includes('admin'));
        fetchStreamData(adminSource || featuredMatch.sources[0]);
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