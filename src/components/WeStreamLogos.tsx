import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeagueInfo } from '../services/sportsLogoService';

interface LeagueConfig {
  id: string;
  name: string;
  route: string;
}

interface LeagueWithBadge extends LeagueConfig {
  badge: string | null;
}

// League IDs from TheSportsDB
const POPULAR_LEAGUES: LeagueConfig[] = [
  { id: '4328', name: 'Premier League', route: '/league/soccer_epl' },
  { id: '4335', name: 'La Liga', route: '/league/soccer_spain_la_liga' },
  { id: '4331', name: 'Bundesliga', route: '/league/soccer_germany_bundesliga' },
  { id: '4332', name: 'Serie A', route: '/league/soccer_italy_serie_a' },
  { id: '4334', name: 'Ligue 1', route: '/league/soccer_france_ligue_one' },
  { id: '4480', name: 'Champions League', route: '/league/soccer_uefa_champs_league' },
  { id: '4387', name: 'NBA', route: '/nba-streaming' },
  { id: '4391', name: 'NFL', route: '/live' },
  { id: '4424', name: 'IPL', route: '/live' },
  { id: '4370', name: 'Formula 1', route: '/totalsportek-formula1' },
  { id: '4443', name: 'UFC', route: '/ufc-streaming' },
  { id: '4380', name: 'NHL', route: '/live' },
  { id: '4346', name: 'MLS', route: '/league/soccer_usa_mls' },
];

const WeStreamLogos: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [leagues, setLeagues] = useState<LeagueWithBadge[]>([]);

  // Fetch logos from TheSportsDB API
  useEffect(() => {
    const fetchLogos = async () => {
      const leaguesWithBadges = await Promise.all(
        POPULAR_LEAGUES.map(async (league) => {
          try {
            const info = await getLeagueInfo(parseInt(league.id));
            return {
              ...league,
              badge: info?.badge || info?.logo || null,
            };
          } catch {
            return { ...league, badge: null };
          }
        })
      );
      setLeagues(leaguesWithBadges.filter((l) => l.badge));
    };

    fetchLogos();
  }, []);

  const handleLeagueClick = (route: string) => {
    navigate(route);
  };

  // Auto-scroll animation
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || leagues.length === 0) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.5;

    const animate = () => {
      scrollPosition += speed;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [leagues]);

  // Duplicate leagues for seamless infinite scroll
  const duplicatedLeagues = [...leagues, ...leagues];

  if (leagues.length === 0) {
    return (
      <div className="overflow-hidden py-4">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          We Stream
        </h3>
        <div className="flex gap-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-20 h-20 rounded-full bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden py-4">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-primary rounded-full" />
        We Stream
      </h3>
      
      <div
        ref={scrollRef}
        className="flex gap-10 overflow-hidden"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedLeagues.map((league, index) => (
          <button
            key={`${league.id}-${index}`}
            onClick={() => handleLeagueClick(league.route)}
            className="flex-shrink-0 group cursor-pointer bg-transparent border-none p-0"
            aria-label={`View ${league.name} matches`}
          >
            <div className="w-20 h-20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <img
                src={league.badge!}
                alt={league.name}
                className="w-full h-full object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                loading="lazy"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeStreamLogos;
