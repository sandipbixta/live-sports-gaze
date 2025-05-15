
import React, { useState, useEffect } from 'react';
import { useToast } from '../../hooks/use-toast';
import { Match, Stream, Source } from '../../types/sports';
import { fetchMatches, fetchStream } from '../../api/sportsApi';

interface LiveMatchesContainerProps {
  children: (props: {
    liveMatches: Match[];
    upcomingMatches: Match[];
    loading: boolean;
    featuredMatch: Match | null;
    currentStream: Stream | null;
    streamLoading: boolean;
    loadStream: (source: Source) => void;
    handleSelectMatch: (match: Match) => void;
  }) => React.ReactNode;
}

const LiveMatchesContainer: React.FC<LiveMatchesContainerProps> = ({ children }) => {
  const { toast } = useToast();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);

  useEffect(() => {
    const fetchLiveContent = async () => {
      setLoading(true);
      try {
        // Fetch from multiple sports to find live matches
        const sportIds = ['1', '2', '3', '4']; // Common sport IDs
        let allLiveMatches: Match[] = [];
        let allUpcomingMatches: Match[] = [];
        
        for (const sportId of sportIds) {
          const matches = await fetchMatches(sportId);
          // Filter for matches with sources (live streams)
          const livesFromSport = matches.filter(match => 
            match.sources && match.sources.length > 0);
          
          // Filter upcoming matches (no sources or scheduled for later)
          const upcomingFromSport = matches.filter(match => 
            !match.sources || match.sources.length === 0);
            
          allLiveMatches = [...allLiveMatches, ...livesFromSport];
          allUpcomingMatches = [...allUpcomingMatches, ...upcomingFromSport];
        }
        
        setLiveMatches(allLiveMatches);
        setUpcomingMatches(allUpcomingMatches);
        
        // Set featured match (first one with sources)
        if (allLiveMatches.length > 0) {
          setFeaturedMatch(allLiveMatches[0]);
          
          // Fetch the stream for the featured match
          if (allLiveMatches[0].sources && allLiveMatches[0].sources.length > 0) {
            loadStream(allLiveMatches[0].sources[0]);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load live content.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLiveContent();
  }, [toast]);

  // Function to load stream from a source
  const loadStream = async (source: Source) => {
    setStreamLoading(true);
    try {
      const stream = await fetchStream(source.source, source.id);
      setCurrentStream(stream);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load stream.",
        variant: "destructive",
      });
      setCurrentStream(null);
    } finally {
      setStreamLoading(false);
    }
  };

  const handleSelectMatch = (match: Match) => {
    setFeaturedMatch(match);
    if (match.sources && match.sources.length > 0) {
      loadStream(match.sources[0]);
    }
  };

  return (
    <>
      {children({
        liveMatches,
        upcomingMatches,
        loading,
        featuredMatch,
        currentStream,
        streamLoading,
        loadStream,
        handleSelectMatch
      })}
    </>
  );
};

export default LiveMatchesContainer;
