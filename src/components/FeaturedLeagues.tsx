import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaguesService } from '@/services/leaguesService';
import { Trophy } from 'lucide-react';

interface League {
  id: string;
  league_id: string;
  league_name: string;
  sport: string;
  logo_url: string | null;
  country: string | null;
}

const FeaturedLeagues: React.FC = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        const data = await leaguesService.getLeagues();
        // Get top leagues (you can adjust the filter logic as needed)
        const featured = data.slice(0, 12);
        setLeagues(featured);
      } catch (error) {
        console.error('Error loading leagues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeagues();
  }, []);

  const handleLeagueClick = (leagueId: string) => {
    navigate(`/leagues/${leagueId}`);
  };

  if (loading) {
    return (
      <div className="w-full overflow-hidden mb-8">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 h-40 bg-card rounded-2xl border border-border animate-pulse"
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
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {leagues.map((league) => (
          <button
            key={league.id}
            onClick={() => handleLeagueClick(league.league_id)}
            className="flex-shrink-0 w-40 h-40 bg-card rounded-2xl border border-border hover:border-primary transition-all duration-200 hover:shadow-lg hover:scale-105 flex flex-col items-center justify-center p-4 gap-3 group"
            aria-label={`View ${league.league_name}`}
          >
            <div className="w-20 h-20 flex items-center justify-center">
              {league.logo_url ? (
                <img
                  src={league.logo_url}
                  alt={`${league.league_name} logo`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Trophy className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
            <p className="text-sm font-semibold text-center text-foreground line-clamp-2">
              {league.league_name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeaturedLeagues;
