
import React from 'react';
import { Match } from '../types/sports';
import MatchCard from './MatchCard';
import { useIsMobile } from '../hooks/use-mobile';
import { format } from 'date-fns';

interface MatchesListProps {
  matches: Match[];
  sportId: string;
  isLoading: boolean;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, sportId, isLoading }) => {
  // Filter out advertisement matches (Sky Sports News in this case)
  const filteredMatches = matches.filter(match => 
    !match.title.toLowerCase().includes('sky sports news') && 
    !match.id.includes('sky-sports-news')
  );

  const isMobile = useIsMobile();
  
  // Helper function to determine if a match is likely live
  const isMatchLive = (match: Match): boolean => {
    // A match is considered live if it has sources AND the match time is within 2 hours of now
    const matchTime = new Date(match.date).getTime();
    const now = new Date().getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    
    return (
      match.sources && 
      match.sources.length > 0 && 
      Math.abs(matchTime - now) < twoHoursInMs
    );
  };

  // Function to extract league name from match title
  const getLeagueName = (title: string): string => {
    // Common league names and their variations
    const leagueKeywords = {
      'premier league': 'Premier League',
      'epl': 'Premier League',
      'la liga': 'La Liga',
      'laliga': 'La Liga',
      'serie a': 'Serie A',
      'bundesliga': 'Bundesliga',
      'ligue 1': 'Ligue 1',
      'champions league': 'Champions League',
      'ucl': 'Champions League',
      'europa league': 'Europa League',
      'conference league': 'Conference League',
      'copa libertadores': 'Copa Libertadores',
      'copa america': 'Copa America',
      'fa cup': 'FA Cup',
      'carabao cup': 'Carabao Cup',
      'efl cup': 'Carabao Cup',
      'community shield': 'Community Shield',
      'super cup': 'Super Cup'
    };

    const lowercaseTitle = title.toLowerCase();
    
    // Check for league keywords in the title
    for (const [keyword, leagueName] of Object.entries(leagueKeywords)) {
      if (lowercaseTitle.includes(keyword)) {
        return leagueName;
      }
    }

    // If no specific league is identified, try to extract from the title
    // Many titles follow the format "Team vs Team - League Name"
    const parts = title.split('-');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }

    // Default case if no league can be determined
    return 'Other Competitions';
  };
  
  // Separate matches into live and upcoming
  const liveMatches = filteredMatches.filter(isMatchLive);
  const upcomingMatches = filteredMatches.filter(match => !isMatchLive(match));
  
  // Group football matches by league
  const groupMatchesByLeague = (matches: Match[]) => {
    // Only group if this is football/soccer
    if (sportId !== 'football') {
      return { 'All Matches': matches };
    }
    
    const groupedMatches: Record<string, Match[]> = {};
    
    matches.forEach(match => {
      const leagueName = getLeagueName(match.title);
      
      if (!groupedMatches[leagueName]) {
        groupedMatches[leagueName] = [];
      }
      
      groupedMatches[leagueName].push(match);
    });
    
    return groupedMatches;
  };

  // Group the matches
  const groupedLiveMatches = groupMatchesByLeague(liveMatches);
  const groupedUpcomingMatches = groupMatchesByLeague(upcomingMatches);

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
            <span className="inline-block h-3 w-3 bg-[#fa2d04] rounded-full animate-pulse"></span>
            Live Matches
          </h2>
          
          {Object.entries(groupedLiveMatches).map(([leagueName, leagueMatches]) => (
            <div key={`live-${leagueName}`} className="mb-6">
              {/* Only show league headings for football */}
              {sportId === 'football' && (
                <h3 className="text-xl font-semibold mb-3 text-gray-200 border-l-4 border-[#9b87f5] pl-2">
                  {leagueName}
                </h3>
              )}
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 live-matches-grid`}>
                {leagueMatches.map((match) => (
                  <MatchCard 
                    key={match.id}
                    match={match}
                    sportId={sportId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Upcoming Matches Section */}
      {upcomingMatches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
            Upcoming Matches
          </h2>
          
          {Object.entries(groupedUpcomingMatches).map(([leagueName, leagueMatches]) => (
            <div key={`upcoming-${leagueName}`} className="mb-6">
              {/* Only show league headings for football */}
              {sportId === 'football' && (
                <h3 className="text-xl font-semibold mb-3 text-gray-200 border-l-4 border-[#9b87f5] pl-2">
                  {leagueName}
                </h3>
              )}
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 upcoming-matches-grid`}>
                {leagueMatches.map((match) => (
                  <MatchCard 
                    key={match.id}
                    match={match}
                    sportId={sportId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* No live matches message */}
      {liveMatches.length === 0 && upcomingMatches.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
            <span className="inline-block h-3 w-3 bg-[#fa2d04] rounded-full"></span>
            Live Matches
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
