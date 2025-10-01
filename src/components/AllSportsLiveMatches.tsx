import React, { useEffect, useState } from 'react';
import { Sport, Match } from '../types/sports';
import { fetchLiveMatches, fetchSports, fetchAllMatches } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, isMatchLive, filterActiveMatches } from '../utils/matchUtils';
import { isTrendingMatch } from '../utils/popularLeagues';
import MatchCard from './MatchCard';
import { useToast } from '../hooks/use-toast';

interface AllSportsLiveMatchesProps {
  searchTerm?: string;
}

const AllSportsLiveMatches: React.FC<AllSportsLiveMatchesProps> = ({ searchTerm = '' }) => {
  const { toast } = useToast();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLiveMatches = async () => {
      try {
        setLoading(true);
        
        // Fetch sports, live matches, and all matches in parallel
        const [sportsData, liveMatchesData, allMatchesData] = await Promise.all([
          fetchSports(),
          fetchLiveMatches(),
          fetchAllMatches()
        ]);
        
        setSports(sportsData);
        
        // Filter and consolidate live matches (remove ended matches)
        const cleanLiveMatches = filterActiveMatches(filterCleanMatches(liveMatchesData));
        const consolidatedLiveMatches = consolidateMatches(cleanLiveMatches);
        setLiveMatches(consolidatedLiveMatches);
        
        // Filter and consolidate all matches (for top league section, remove ended matches)
        const cleanAllMatches = filterActiveMatches(filterCleanMatches(allMatchesData));
        const consolidatedAllMatches = consolidateMatches(cleanAllMatches);
        setAllMatches(consolidatedAllMatches);
        
        console.log(`✅ Loaded ${consolidatedLiveMatches.length} live matches and ${consolidatedAllMatches.length} total matches from all sports`);
        console.log('Live matches by sport:', consolidatedLiveMatches.reduce((acc, match) => {
          const sport = match.sportId || match.category || 'unknown';
          acc[sport] = (acc[sport] || 0) + 1;
          return acc;
        }, {} as Record<string, number>));
        
      } catch (error) {
        console.error('Error loading matches:', error);
        toast({
          title: "Error",
          description: "Failed to load matches.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadLiveMatches();
  }, [toast]);

  // Filter matches by search term (ended matches already filtered out in data loading)
  const filteredMatches = React.useMemo(() => {
    let matches = liveMatches;
    
    // Apply search filter if provided
    if (searchTerm.trim()) {
      const lowercaseSearch = searchTerm.toLowerCase();
      matches = matches.filter(match => {
        return match.title.toLowerCase().includes(lowercaseSearch) || 
          match.teams?.home?.name?.toLowerCase().includes(lowercaseSearch) ||
          match.teams?.away?.name?.toLowerCase().includes(lowercaseSearch);
      });
    }
    
    return matches;
  }, [liveMatches, searchTerm]);

  // Group matches by sport
  const matchesBySport = React.useMemo(() => {
    const grouped: { [sportId: string]: Match[] } = {};
    
    filteredMatches.forEach(match => {
      const sportId = match.sportId || match.category || 'unknown';
      if (!grouped[sportId]) {
        grouped[sportId] = [];
      }
      grouped[sportId].push(match);
    });
    
    return grouped;
  }, [filteredMatches]);

  const getSportName = (sportId: string) => {
    const sport = sports.find(s => s.id === sportId);
    return sport?.name || sportId.charAt(0).toUpperCase() + sportId.slice(1);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="h-32 bg-[#242836] rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (filteredMatches.length === 0) {
    return (
      <div className="bg-[#242836] border-[#343a4d] rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">📺</div>
        <h3 className="text-xl font-bold text-white mb-2">No Live Matches</h3>
        <p className="text-gray-400">There are currently no live matches available.</p>
      </div>
    );
  }

  // Define preferred sport order with tennis at the end (excluded: golf, hockey, billiards)
  const getSportPriority = (sportId: string): number => {
    const sportOrder: { [key: string]: number } = {
      'football': 1,
      'basketball': 2, 
      'american-football': 3,
      'baseball': 4,
      'motor-sports': 5,
      'fight': 6,
      'rugby': 7,
      'cricket': 8,
      'afl': 9,
      'other': 10,
      'tennis': 12  // Tennis moved to last position
    };
    
    const normalizedSportId = sportId.toLowerCase();
    
    // Check for exact match first
    if (sportOrder[normalizedSportId] !== undefined) {
      return sportOrder[normalizedSportId];
    }
    
    // Check for partial matches
    for (const [sport, priority] of Object.entries(sportOrder)) {
      if (normalizedSportId.includes(sport) || sport.includes(normalizedSportId)) {
        return priority;
      }
    }
    
    // Unknown sports get high priority (but before tennis)
    return 14.5;
  };

  // Sort sports by priority with tennis at the end
  const sortedSports = Object.entries(matchesBySport).sort(([sportIdA], [sportIdB]) => {
    const priorityA = getSportPriority(sportIdA);
    const priorityB = getSportPriority(sportIdB);
    return priorityA - priorityB;
  });

  return (
    <div className="space-y-8">
      {/* Top League Football Matches - Live and Scheduled */}
      {(() => {
        // Get both live and scheduled football matches from allMatches
        const allFootballMatches = allMatches.filter(match => 
          (match.sportId || match.category || '').toLowerCase() === 'football'
        );
        
        // European competitions - HIGHEST PRIORITY
        const europeanCompetitions = [
          'champions league', 'uefa champions', 'ucl', 'europa league', 'uefa europa', 
          'uel', 'conference league', 'uecl', 'europa conference'
        ];
        
        // Top clubs from major leagues
        const topClubs = [
          // Premier League
          'manchester united', 'man united', 'liverpool', 'manchester city', 'man city', 
          'chelsea', 'arsenal', 'tottenham', 'spurs', 'newcastle', 'aston villa',
          // La Liga
          'barcelona', 'real madrid', 'atletico madrid', 'atletico', 'sevilla', 'villarreal',
          'real sociedad', 'athletic bilbao', 'valencia', 'real betis',
          // Serie A
          'juventus', 'inter milan', 'inter', 'ac milan', 'milan', 'napoli', 'roma', 
          'lazio', 'atalanta', 'fiorentina',
          // Bundesliga
          'bayern munich', 'bayern', 'borussia dortmund', 'dortmund', 'rb leipzig', 
          'bayer leverkusen', 'leverkusen', 'eintracht frankfurt',
          // Ligue 1
          'psg', 'paris saint-germain', 'marseille', 'lyon', 'monaco', 'lille',
          // Other top clubs
          'ajax', 'psv', 'feyenoord', 'benfica', 'porto', 'sporting', 'celtic', 'rangers'
        ];
        
        // Exclude non-top matches
        const excludeKeywords = [
          'barcelona sc', 'guayaquil', 'u23', 'u21', 'u19', 'u18', 'u20', 'u17',
          'youth', 'reserve', 'academy', 'segunda', 'segunda b', 'tercera', 
          'league two', 'league one', 'non-league', 'women', 'female',
          'womens', "women's", 'ladies', 'feminino', 'femenino', 'damen', 'feminine',
          'friendly', 'amistoso', 'preseason', 'pre-season', 'national league',
          'vanarama', 'isthmian', 'southern league', 'northern premier'
        ];
        
        console.log('🔍 Total football matches before filtering:', allFootballMatches.length);
        allFootballMatches.forEach(match => {
          if (match.title.toLowerCase().includes('barcelona') || match.title.toLowerCase().includes('champions')) {
            console.log('📋 Barcelona/Champions match found:', match.title);
          }
        });
        
        const topLeagueFootballMatches = allFootballMatches
          .filter(match => {
            const title = match.title.toLowerCase();
            
            // First check exclusions
            const shouldExclude = excludeKeywords.some(keyword => title.includes(keyword));
            if (shouldExclude) {
              return false;
            }
            
            // PRIORITY 1: European competitions (Champions League, Europa League, etc.)
            const isEuropeanCompetition = europeanCompetitions.some(keyword => title.includes(keyword));
            if (isEuropeanCompetition) {
              console.log('⭐ European Competition match:', title);
              return true;
            }
            
            // PRIORITY 2: Top clubs playing each other
            const matchingClubs = topClubs.filter(club => title.includes(club));
            if (matchingClubs.length >= 2) {
              console.log('🔥 Top club match:', title, 'Clubs:', matchingClubs);
              return true;
            }
            
            // PRIORITY 3: Popular/trending matches with top clubs
            if (match.popular && matchingClubs.length >= 1) {
              console.log('📈 Popular top club match:', title);
              return true;
            }
            
            return false;
          })
          .sort((a, b) => {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            
            // European competitions first
            const isEuroA = europeanCompetitions.some(k => titleA.includes(k));
            const isEuroB = europeanCompetitions.some(k => titleB.includes(k));
            if (isEuroA && !isEuroB) return -1;
            if (!isEuroA && isEuroB) return 1;
            
            // Then by trending score
            const scoreA = isTrendingMatch(a.title).score;
            const scoreB = isTrendingMatch(b.title).score;
            if (scoreB !== scoreA) return scoreB - scoreA;
            
            // Then by date (upcoming first)
            return (a.date || 0) - (b.date || 0);
          })
          .slice(0, 16);
        
        if (topLeagueFootballMatches.length > 0) {
          return (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-xl">⚽</div>
                <h3 className="text-xl font-bold text-white">Top League Football</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {topLeagueFootballMatches.map((match) => (
                  <MatchCard
                    key={`top-football-${match.id}`}
                    match={match}
                    sportId={match.sportId || match.category}
                  />
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}

      
      {/* Sports Sections */}
      {sortedSports.map(([sportId, matches]) => (
        <div key={sportId} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">
              {getSportName(sportId)}
            </h3>
            <span className="text-sm text-gray-400">
              {matches.length} live match{matches.length !== 1 ? 'es' : ''}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {matches.map((match) => (
              <MatchCard
                key={`${match.sportId || sportId}-${match.id}`}
                match={match}
                sportId={match.sportId || sportId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllSportsLiveMatches;