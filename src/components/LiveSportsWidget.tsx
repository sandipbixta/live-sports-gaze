
import React, { useEffect, useState } from 'react';
import { fetchSports, fetchMatches } from '../api/sportsApi';
import { Sport, Match } from '../types/sports';
import { Play, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isMatchLive } from '../utils/matchUtils';
import { getStreamedImageUrl } from '../streamedApi';

const LiveSportsWidget = () => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLiveMatches = async () => {
      try {
        setLoading(true);
        const sportsData = await fetchSports();
        setSports(sportsData);
        
        // Fetch matches from top sports (limit to 3-4 sports for performance)
        const topSports = sportsData.slice(0, 4);
        const allMatches: Match[] = [];
        
        for (const sport of topSports) {
          try {
            const matches = await fetchMatches(sport.id);
            const liveMatches = matches.filter(match => isMatchLive(match));
            // Ensure each match has the correct sportId
            const matchesWithSportId = liveMatches.map(match => ({
              ...match,
              sportId: sport.id,
              category: sport.id
            }));
            allMatches.push(...matchesWithSportId);
          } catch (error) {
            console.error(`Error fetching matches for ${sport.name}:`, error);
          }
        }
        
        // Sort by priority (live > upcoming) and limit to 12 matches
        const sortedMatches = allMatches
          .sort((a, b) => {
            const aLive = isMatchLive(a);
            const bLive = isMatchLive(b);
            if (aLive && !bLive) return -1;
            if (!aLive && bLive) return 1;
            return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
          })
          .slice(0, 12);
        
        setLiveMatches(sortedMatches);
      } catch (error) {
        console.error('Error loading live matches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLiveMatches();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-[#242836] border border-[#343a4d] rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-[#343a4d] rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-[#343a4d] rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (liveMatches.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No live matches available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {liveMatches.map((match) => {
        const isLive = isMatchLive(match);
        const sportName = sports.find(s => s.id === match.sportId)?.name || 'Sports';
        const homeBadge = match.teams?.home?.logo || 
          (match.teams?.home?.badge ? getStreamedImageUrl(`api/images/badge/${match.teams.home.badge}.webp`) : '');
        const awayBadge = match.teams?.away?.logo || 
          (match.teams?.away?.badge ? getStreamedImageUrl(`api/images/badge/${match.teams.away.badge}.webp`) : '');
        
        return (
          <Link
            key={match.id}
            to={`/match/${match.sportId || match.category}/${match.id}`}
            className="bg-[#242836] border border-[#343a4d] rounded-lg p-4 hover:bg-[#2a2f3e] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#ff5a36] uppercase tracking-wide">
                {sportName}
              </span>
              {isLive && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  LIVE
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {match.teams?.home && match.teams?.away ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {homeBadge && (
                      <img
                        src={homeBadge}
                        alt={match.teams.home.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    )}
                    <span className="text-white text-sm font-medium truncate">
                      {match.teams.home.name}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs mx-2">vs</span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-white text-sm font-medium truncate">
                      {match.teams.away.name}
                    </span>
                    {awayBadge && (
                      <img
                        src={awayBadge}
                        alt={match.teams.away.name}
                        className="w-6 h-6 object-contain"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-white font-medium text-sm">
                  {match.title}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  <span>{match.sources?.length || 0} streams</span>
                </div>
                {match.date && (
                  <span>
                    {new Date(match.date).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default LiveSportsWidget;
