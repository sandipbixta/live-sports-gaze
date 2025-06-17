import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';

interface MatchesListProps {
  matches: Match[];
  sportId: string;
  isLoading: boolean;
  onMatchesDisplayed?: (matchIds: string[]) => void; // Add callback to report displayed match IDs
}

const MatchesList: React.FC<MatchesListProps> = ({ 
  matches, 
  sportId, 
  isLoading,
  onMatchesDisplayed
}) => {
  // Enhanced duplicate removal function
  const removeDuplicates = (matches: Match[]): Match[] => {
    const seen = new Map<string, Match>();
    
    matches.forEach(match => {
      // Create multiple unique keys to catch different types of duplicates
      const homeTeam = match.teams?.home?.name?.toLowerCase().trim() || '';
      const awayTeam = match.teams?.away?.name?.toLowerCase().trim() || '';
      const matchTitle = match.title?.toLowerCase().trim() || '';
      const matchDate = new Date(match.date).toISOString().split('T')[0];
      
      // Primary key: teams and date
      const teamKey = homeTeam && awayTeam 
        ? `${homeTeam}-vs-${awayTeam}-${matchDate}`
        : null;
      
      // Secondary key: title and date
      const titleKey = matchTitle 
        ? `${matchTitle}-${matchDate}`
        : null;
      
      // Use the most specific key available
      const uniqueKey = teamKey || titleKey || match.id;
      
      // Keep the match with more sources or the first one encountered
      if (!seen.has(uniqueKey)) {
        seen.set(uniqueKey, match);
      } else {
        const existingMatch = seen.get(uniqueKey)!;
        if ((match.sources?.length || 0) > (existingMatch.sources?.length || 0)) {
          seen.set(uniqueKey, match);
        }
      }
    });
    
    return Array.from(seen.values());
  };

  // Filter out advertisement and invalid matches, then remove duplicates
  const cleanMatches = matches.filter(match => {
    const title = match.title?.toLowerCase() || '';
    const id = match.id?.toLowerCase() || '';
    
    return !title.includes('sky sports news') && 
           !id.includes('sky-sports-news') &&
           !title.includes('advertisement') &&
           !title.includes('ad break') &&
           !title.includes('promo') &&
           match.title && // Must have a title
           match.date; // Must have a date
  });

  const filteredMatches = removeDuplicates(cleanMatches);
  const isMobile = useIsMobile();
  
  // Report displayed match IDs to parent component
  React.useEffect(() => {
    if (onMatchesDisplayed && filteredMatches.length > 0) {
      const displayedIds = filteredMatches.map(match => match.id);
      onMatchesDisplayed(displayedIds);
    }
  }, [filteredMatches, onMatchesDisplayed]);
  
  // Helper function to determine if a match is likely live
  const isMatchLive = (match: Match): boolean => {
    const matchTime = new Date(match.date).getTime();
    const now = new Date().getTime();
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    const oneHourInMs = 60 * 60 * 1000;
    
    return match.sources && 
           match.sources.length > 0 && 
           matchTime - now < oneHourInMs && 
           now - matchTime < threeHoursInMs;
  };

  // Separate matches into live and upcoming
  const liveMatches = filteredMatches.filter(match => isMatchLive(match));
  const upcomingMatches = filteredMatches.filter(match => !isMatchLive(match));

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-3 text-white">Live & Upcoming Matches</h2>
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="h-36 bg-[#242836] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (filteredMatches.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-3 text-white">Live & Upcoming Matches</h2>
        <div className="bg-[#242836] border-[#343a4d] rounded-xl p-4 text-center">
          <p className="text-gray-300 text-sm">No matches available for this sport right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="inline-block h-3 w-3 bg-[#ff5a36] rounded-full animate-pulse"></span>
            Live Matches 
            <span className="text-sm bg-[#242836] border border-[#343a4d] rounded-lg px-2 py-1 text-white">
              {liveMatches.length} {liveMatches.length === 1 ? 'match' : 'matches'}
            </span>
          </h2>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 live-matches-grid`}>
            {liveMatches.map((match, index) => (
              <MatchCard 
                key={`live-${match.id}-${index}`}
                match={match}
                sportId={sportId}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Upcoming Matches Section */}
      {upcomingMatches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
            Upcoming Matches 
            <span className="text-sm bg-[#242836] border border-[#343a4d] rounded-lg px-2 py-1 text-white">
              {upcomingMatches.length} {upcomingMatches.length === 1 ? 'match' : 'matches'}
            </span>
          </h2>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 upcoming-matches-grid`}>
            {upcomingMatches.map((match, index) => (
              <MatchCard 
                key={`upcoming-${match.id}-${index}`}
                match={match}
                sportId={sportId}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* No live matches message */}
      {liveMatches.length === 0 && upcomingMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="inline-block h-3 w-3 bg-[#ff5a36] rounded-full"></span>
            Live Matches
            <span className="text-sm bg-[#242836] border border-[#343a4d] rounded-lg px-2 py-1 text-white">
              0 matches
            </span>
          </h2>
          <div className="bg-[#242836] border-[#343a4d] rounded-xl p-4 text-center mb-8">
            <p className="text-gray-300 text-sm">No live matches available right now.</p>
          </div>
        </div>
      )}
      
      {/* No upcoming matches message */}
      {upcomingMatches.length === 0 && liveMatches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
            Upcoming Matches
            <span className="text-sm bg-[#242836] border border-[#343a4d] rounded-lg px-2 py-1 text-white">
              0 matches
            </span>
          </h2>
          <div className="bg-[#242836] border-[#343a4d] rounded-xl p-4 text-center">
            <p className="text-gray-300 text-sm">No upcoming matches scheduled at this time.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesList;
