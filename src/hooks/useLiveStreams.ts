
import { useState } from 'react';
import { Match } from '../types/sports';
import { useMatchesData } from './useMatchesData';
import { useStreamData } from './useStreamData';

export const useLiveStreams = () => {
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use the extracted hooks
  const {
    allMatches,
    liveMatches,
    upcomingMatches,
    sports,
    loading,
    featuredMatch,
    setFeaturedMatch,
    apiError
  } = useMatchesData(retryCount);
  
  const {
    currentStream,
    setCurrentStream,
    streamLoading,
    activeSource,
    setActiveSource,
    fetchStreamData
  } = useStreamData();
  
  // Effect to update filtered matches whenever all matches change
  if (filteredMatches.length === 0 && allMatches.length > 0) {
    setFilteredMatches(allMatches);
  }

  // Function to handle match selection
  const handleMatchSelect = (match: Match) => {
    setFeaturedMatch(match);
    if (match.sources && match.sources.length > 0) {
      fetchStreamData(match.sources[0]);
    } else {
      setCurrentStream(null);
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
