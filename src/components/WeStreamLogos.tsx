import React, { useEffect, useState, useRef } from 'react';

interface LeagueInfo {
  id: string;
  name: string;
  badge: string;
}

const POPULAR_LEAGUES = [
  { id: '4328', name: 'Premier League' },
  { id: '4335', name: 'La Liga' },
  { id: '4331', name: 'Bundesliga' },
  { id: '4332', name: 'Serie A' },
  { id: '4334', name: 'Ligue 1' },
  { id: '4480', name: 'Champions League' },
  { id: '4387', name: 'NBA' },
  { id: '4391', name: 'NFL' },
  { id: '4424', name: 'IPL' },
  { id: '4488', name: 'BBL' },
  { id: '4370', name: 'Formula 1' },
  { id: '4443', name: 'UFC' },
  { id: '4380', name: 'NHL' },
  { id: '4346', name: 'MLS' },
  { id: '4344', name: 'Eredivisie' },
  { id: '4358', name: 'Liga Portugal' },
];

const SPORTS_DB_API_KEY = '751945';

const WeStreamLogos: React.FC = () => {
  const [leagues, setLeagues] = useState<LeagueInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLeagueLogos = async () => {
      const fetchedLeagues: LeagueInfo[] = [];

      for (const league of POPULAR_LEAGUES) {
        try {
          const response = await fetch(
            `https://www.thesportsdb.com/api/v1/json/${SPORTS_DB_API_KEY}/lookupleague.php?id=${league.id}`
          );
          const data = await response.json();
          if (data.leagues && data.leagues[0]) {
            const leagueData = data.leagues[0];
            fetchedLeagues.push({
              id: league.id,
              name: leagueData.strLeague || league.name,
              badge: leagueData.strBadge || leagueData.strLogo || '',
            });
          }
        } catch (err) {
          console.error(`Error fetching logo for ${league.name}:`, err);
        }
      }

      setLeagues(fetchedLeagues);
      setLoading(false);
    };

    fetchLeagueLogos();
  }, []);

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

  if (loading) {
    return (
      <div className="bg-card/50 rounded-xl p-6 border border-border">
        <div className="h-6 w-32 bg-muted rounded animate-pulse mb-4" />
        <div className="flex gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-16 h-16 rounded-lg bg-muted animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  // Duplicate leagues for seamless infinite scroll
  const duplicatedLeagues = [...leagues, ...leagues];

  return (
    <div className="bg-gradient-to-r from-card via-card/80 to-card rounded-xl p-6 border border-border overflow-hidden">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-primary rounded-full" />
        We Stream
      </h3>
      
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-hidden"
        style={{ scrollBehavior: 'auto' }}
      >
        {duplicatedLeagues.map((league, index) => (
          <div
            key={`${league.id}-${index}`}
            className="flex-shrink-0 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-lg bg-background/50 flex items-center justify-center p-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-background">
              {league.badge ? (
                <img
                  src={league.badge}
                  alt={league.name}
                  className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  loading="lazy"
                />
              ) : (
                <span className="text-xs text-muted-foreground text-center">
                  {league.name}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Live streams from 50+ leagues worldwide
      </p>
    </div>
  );
};

export default WeStreamLogos;
