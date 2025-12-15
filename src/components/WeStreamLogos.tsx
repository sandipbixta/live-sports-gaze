import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface LeagueInfo {
  id: string;
  name: string;
  badge: string;
  route: string;
}

// Use local assets + CDN fallbacks for reliability
import premierLeague from '../assets/leagues/premier-league.webp';
import laLiga from '../assets/leagues/laliga.png';
import bundesliga from '../assets/leagues/bundesliga.png';
import serieA from '../assets/leagues/serie-a.png';
import ligue1 from '../assets/leagues/ligue-1.png';
import championsLeague from '../assets/leagues/champions-league.png';
import mls from '../assets/leagues/mls.png';

const POPULAR_LEAGUES: LeagueInfo[] = [
  { id: '4328', name: 'Premier League', badge: premierLeague, route: '/league/soccer_epl' },
  { id: '4335', name: 'La Liga', badge: laLiga, route: '/league/soccer_spain_la_liga' },
  { id: '4331', name: 'Bundesliga', badge: bundesliga, route: '/league/soccer_germany_bundesliga' },
  { id: '4332', name: 'Serie A', badge: serieA, route: '/league/soccer_italy_serie_a' },
  { id: '4334', name: 'Ligue 1', badge: ligue1, route: '/league/soccer_france_ligue_one' },
  { id: '4480', name: 'Champions League', badge: championsLeague, route: '/league/soccer_uefa_champs_league' },
  { id: '4387', name: 'NBA', badge: 'https://www.thesportsdb.com/images/media/league/badge/g6btoc1723153568.png', route: '/nba-streaming' },
  { id: '4391', name: 'NFL', badge: 'https://www.thesportsdb.com/images/media/league/badge/dqo6r91549878326.png', route: '/live' },
  { id: '4424', name: 'IPL', badge: 'https://www.thesportsdb.com/images/media/league/badge/5r1opy1462466689.png', route: '/live' },
  { id: '4370', name: 'Formula 1', badge: 'https://www.thesportsdb.com/images/media/league/badge/w28ts61708717496.png', route: '/totalsportek-formula1' },
  { id: '4443', name: 'UFC', badge: 'https://www.thesportsdb.com/images/media/league/badge/xxutry1421792574.png', route: '/ufc-streaming' },
  { id: '4380', name: 'NHL', badge: 'https://www.thesportsdb.com/images/media/league/badge/w2qyaq1723157441.png', route: '/live' },
  { id: '4346', name: 'MLS', badge: mls, route: '/league/soccer_usa_mls' },
];

const WeStreamLogos: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLeagueClick = (route: string) => {
    navigate(route);
  };

  // Auto-scroll animation
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

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
  }, []);

  // Duplicate leagues for seamless infinite scroll
  const duplicatedLeagues = [...POPULAR_LEAGUES, ...POPULAR_LEAGUES];

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
                src={league.badge}
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
