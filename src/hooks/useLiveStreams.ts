
import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { Match, Sport, Stream } from '../types/sports';
import { fetchMatches, fetchSports, fetchStream } from '../api/sportsApi';
import { isMatchLive } from '../utils/matchUtils';
import { 
  ALL_MATCHES_API, 
  LIVE_MATCHES_API, 
  TODAY_MATCHES_API 
} from '../api/constants';

export const useLiveStreams = () => {
  const { toast } = useToast();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [apiError, setApiError] = useState(false);

  // Memoized stream fetching function
  const fetchStreamData = useCallback(async (source: { source: string, id: string }) => {
    setStreamLoading(true);
    setActiveSource(`${source.source}/${source.id}`);
    try {
      console.log(`Fetching stream data: source=${source.source}, id=${source.id}`);
      const stream = await fetchStream(source.source, source.id);
      console.log('Stream data received:', stream);
      
      // Validate the stream
      if (stream.error || !stream.embedUrl) {
        console.error('Stream has error or missing embedUrl:', stream);
        toast({
          title: "Stream Issues",
          description: "This stream may not be available. Try another source.",
          variant: "destructive",
        });
      }
      
      setCurrentStream(stream);
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

  useEffect(() => {
    const fetchLiveContent = async () => {
      setLoading(true);
      setApiError(false);
      try {
        console.log('Fetching live matches...');
        // Get sports data to show proper sport names
        const sportsData = await fetchSports();
        setSports(sportsData);
        console.log('Sports data:', sportsData);
        
        // Try to use direct API endpoints first
        let allFetchedMatches: Match[] = [];
        
        try {
          // Try fetching from the live matches endpoint directly
          console.log('Fetching from live matches endpoint');
          const liveEndpointData = await fetch(LIVE_MATCHES_API, {
            headers: { 'Accept': 'application/json' }
          });
          
          if (liveEndpointData.ok) {
            const liveMatchesData = await liveEndpointData.json();
            console.log('Live matches from direct endpoint:', liveMatchesData.length);
            allFetchedMatches = [...allFetchedMatches, ...liveMatchesData];
          }
        } catch (liveError) {
          console.error('Error fetching live matches directly:', liveError);
        }
        
        // If we didn't get enough matches, try the all matches endpoint
        if (allFetchedMatches.length < 5) {
          try {
            console.log('Fetching from all matches endpoint');
            const allEndpointData = await fetch(ALL_MATCHES_API, {
              headers: { 'Accept': 'application/json' }
            });
            
            if (allEndpointData.ok) {
              const allMatchesData = await allEndpointData.json();
              console.log('All matches from direct endpoint:', allMatchesData.length);
              allFetchedMatches = [...allFetchedMatches, ...allMatchesData];
            }
          } catch (allError) {
            console.error('Error fetching all matches directly:', allError);
          }
        }
        
        // If we still don't have matches, fall back to the sport-by-sport approach
        if (allFetchedMatches.length === 0) {
          console.log('Falling back to sport-by-sport fetching');
          const sportIds = ['football', 'basketball', 'hockey', 'baseball', 'tennis', '1', '2', '3', '4'];
          
          for (const sportId of sportIds) {
            console.log(`Fetching matches for sport ID: ${sportId}`);
            try {
              const matches = await fetchMatches(sportId);
              console.log(`Matches for ${sportId}:`, matches ? matches.length : 0);
              
              // Add sport ID as a property to each match for reference
              const matchesWithSportId = matches.map(match => ({
                ...match,
                sportId
              }));
              allFetchedMatches = [...allFetchedMatches, ...matchesWithSportId];
            } catch (sportError) {
              console.error(`Error fetching matches for sport ${sportId}:`, sportError);
              // Continue with other sports even if one fails
            }
          }
        }
        
        // If we still have no matches, show error
        if (allFetchedMatches.length === 0) {
          setApiError(true);
          console.error('Failed to fetch any matches from any endpoint');
          throw new Error('No matches available');
        }
        
        console.log('All matches before filtering:', allFetchedMatches.length);
        
        // Filter out advertisement matches (like Sky Sports News)
        allFetchedMatches = allFetchedMatches.filter(match => 
          !match.title.toLowerCase().includes('sky sports news') && 
          !match.id.includes('sky-sports-news')
        );
        
        console.log('Matches after filtering ads:', allFetchedMatches.length);
        
        // Ensure match dates are in proper format
        allFetchedMatches = allFetchedMatches.map(match => ({
          ...match,
          date: match.date ? 
            (typeof match.date === 'number' ? 
              new Date(match.date).toISOString() : 
              new Date(match.date).toISOString()) : 
            new Date().toISOString()
        }));
        
        // Separate matches into live and upcoming
        const live = allFetchedMatches.filter(isMatchLive);
        const upcoming = allFetchedMatches.filter(match => !isMatchLive(match));
        
        console.log('Live matches:', live.length);
        console.log('Upcoming matches:', upcoming.length);
        
        setAllMatches(allFetchedMatches);
        setLiveMatches(live);
        setUpcomingMatches(upcoming);
        setFilteredMatches(allFetchedMatches);
        
        // Set featured match (first live one with sources if available, otherwise first match)
        const firstLiveMatch = live.length > 0 ? live[0] : null;
        const firstMatch = allFetchedMatches.length > 0 ? allFetchedMatches[0] : null;
        const matchToFeature = firstLiveMatch || firstMatch;
        
        if (matchToFeature) {
          setFeaturedMatch(matchToFeature);
          
          // Fetch the stream for the featured match if it has sources
          if (matchToFeature.sources && matchToFeature.sources.length > 0) {
            await fetchStreamData(matchToFeature.sources[0]);
          } else {
            setCurrentStream(null);
          }
        } else {
          setFeaturedMatch(null);
          setCurrentStream(null);
        }
      } catch (error) {
        console.error('Error fetching live content:', error);
        setApiError(true);
        toast({
          title: "Error",
          description: "Failed to load content. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLiveContent();
  }, [toast, retryCount, fetchStreamData]);

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

  // Function to retry loading content
  const handleRetryLoading = () => {
    setRetryCount(prev => prev + 1);
  };

  return {
    allMatches,
    filteredMatches,
    setFilteredMatches,
    liveMatches,
    upcomingMatches,
    sports,
    loading,
    featuredMatch,
    currentStream,
    streamLoading,
    activeSource,
    setActiveSource,
    handleMatchSelect,
    handleRetryLoading,
    fetchStreamData,
    setCurrentStream,
    apiError
  };
};
