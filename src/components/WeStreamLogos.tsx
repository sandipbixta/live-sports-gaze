import React, { useEffect, useRef } from 'react';

interface LeagueInfo {
  id: string;
  name: string;
  badge: string;
}

// Use reliable CDN logos that don't have CORS issues
const POPULAR_LEAGUES: LeagueInfo[] = [
  { id: '4328', name: 'Premier League', badge: 'https://www.thesportsdb.com/images/media/league/badge/i6o0kh1549879062.png' },
  { id: '4335', name: 'La Liga', badge: 'https://www.thesportsdb.com/images/media/league/badge/7onmyv1534768460.png' },
  { id: '4331', name: 'Bundesliga', badge: 'https://www.thesportsdb.com/images/media/league/badge/0j55yv1534764799.png' },
  { id: '4332', name: 'Serie A', badge: 'https://www.thesportsdb.com/images/media/league/badge/ocy2fe1566216901.png' },
  { id: '4334', name: 'Ligue 1', badge: 'https://www.thesportsdb.com/images/media/league/badge/8f5jmf1516458074.png' },
  { id: '4480', name: 'Champions League', badge: 'https://www.thesportsdb.com/images/media/league/badge/2hwqmm1720696754.png' },
  { id: '4387', name: 'NBA', badge: 'https://www.thesportsdb.com/images/media/league/badge/g6btoc1723153568.png' },
  { id: '4391', name: 'NFL', badge: 'https://www.thesportsdb.com/images/media/league/badge/dqo6r91549878326.png' },
  { id: '4424', name: 'IPL', badge: 'https://www.thesportsdb.com/images/media/league/badge/5r1opy1462466689.png' },
  { id: '4488', name: 'BBL', badge: 'https://www.thesportsdb.com/images/media/league/badge/48q4te1529416122.png' },
  { id: '4370', name: 'Formula 1', badge: 'https://www.thesportsdb.com/images/media/league/badge/w28ts61708717496.png' },
  { id: '4443', name: 'UFC', badge: 'https://www.thesportsdb.com/images/media/league/badge/xxutry1421792574.png' },
  { id: '4380', name: 'NHL', badge: 'https://www.thesportsdb.com/images/media/league/badge/w2qyaq1723157441.png' },
  { id: '4346', name: 'MLS', badge: 'https://www.thesportsdb.com/images/media/league/badge/dqo85z1549879260.png' },
  { id: '4344', name: 'Eredivisie', badge: 'https://www.thesportsdb.com/images/media/league/badge/5j6p9b1637840460.png' },
  { id: '4358', name: 'Liga Portugal', badge: 'https://www.thesportsdb.com/images/media/league/badge/k8pert1692469958.png' },
];

const WeStreamLogos: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

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
          <div
            key={`${league.id}-${index}`}
            className="flex-shrink-0 group cursor-pointer"
          >
            <div className="w-20 h-20 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <img
                src={league.badge}
                alt={league.name}
                className="w-full h-full object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeStreamLogos;
