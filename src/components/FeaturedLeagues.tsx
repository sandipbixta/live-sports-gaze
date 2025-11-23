import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';

interface League {
  id: string;
  name: string;
  logo: string | null;
  sportKey: string;
}

const FEATURED_LEAGUES = [
  { name: 'UEFA Champions League', searchName: 'UEFA Champions League', sportKey: 'soccer_uefa_champs_league' },
  { name: 'English Premier League', searchName: 'English Premier League', sportKey: 'soccer_epl' },
  { name: 'Spanish La Liga', searchName: 'Spanish La Liga', sportKey: 'soccer_spain_la_liga' },
  { name: 'Italian Serie A', searchName: 'Italian Serie A', sportKey: 'soccer_italy_serie_a' },
  { name: 'German Bundesliga', searchName: 'German Bundesliga', sportKey: 'soccer_germany_bundesliga' },
  { name: 'French Ligue 1', searchName: 'French Ligue 1', sportKey: 'soccer_france_ligue_one' },
  { name: 'Major League Soccer', searchName: 'Major League Soccer', sportKey: 'soccer_usa_mls' },
];

const FeaturedLeagues: React.FC = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const fetchedLeagues = await Promise.all(
          FEATURED_LEAGUES.map(async (league) => {
            try {
              const response = await fetch(
                `https://www.thesportsdb.com/api/v1/json/3/searchleagues.php?l=${encodeURIComponent(league.searchName)}`
              );
              const data = await response.json();
              
              const leagueData = data.leagues?.[0];
              return {
                id: league.sportKey,
                name: league.name,
                logo: leagueData?.strBadge || leagueData?.strLogo || null,
                sportKey: league.sportKey,
              };
            } catch (error) {
              console.error(`Error fetching ${league.name}:`, error);
              return {
                id: league.sportKey,
                name: league.name,
                logo: null,
                sportKey: league.sportKey,
              };
            }
          })
        );
        
        setLeagues(fetchedLeagues);
      } catch (error) {
        console.error('Error loading leagues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeagues();
  }, []);

  const handleLeagueClick = (sportKey: string) => {
    navigate(`/leagues/${sportKey}`);
  };

  if (loading) {
    return (
      <div className="w-full overflow-hidden mb-8">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-32 h-32 bg-card rounded-xl border border-border animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (leagues.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-hidden mb-8">
      <h2 className="text-2xl font-bold mb-4 text-foreground">Featured Leagues</h2>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {leagues.map((league) => (
          <button
            key={league.id}
            onClick={() => handleLeagueClick(league.sportKey)}
            className="flex-shrink-0 w-32 h-32 bg-card rounded-xl border border-border hover:border-primary transition-all duration-200 hover:shadow-lg hover:scale-105 flex flex-col items-center justify-center p-3 gap-2 group"
            aria-label={`View ${league.name}`}
          >
            <div className="w-16 h-16 flex items-center justify-center">
              {league.logo ? (
                <img
                  src={league.logo}
                  alt={`${league.name} logo`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Trophy className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
            <p className="text-xs font-semibold text-center text-foreground line-clamp-2">
              {league.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeaturedLeagues;
