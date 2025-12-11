import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFeaturedMatches } from '../hooks/useFeaturedMatches';
import { getSportIcon } from '../services/sportsLogoService';
import coverPhoto from '@/assets/damitv-cover.jpeg';
import { format } from 'date-fns';

export const HeroCarousel = () => {
  const { matches, loading } = useFeaturedMatches(8);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const total = matches.length + 1; // +1 for cover
    if (total <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [matches.length]);

  const goToPrevious = () => {
    const total = matches.length + 1;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const goToNext = () => {
    const total = matches.length + 1;
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  if (loading) {
    return (
      <div className="w-full h-[280px] md:h-[400px] bg-muted animate-pulse rounded-xl" />
    );
  }

  // Cover slide + match slides
  const allSlides = [
    { id: 'cover', isCover: true },
    ...matches
  ];

  const currentSlide = allSlides[currentIndex] || allSlides[0];
  const isCover = (currentSlide as any).isCover;

  // Get background image - use banner, or gradient with team badges
  const getBackgroundStyle = () => {
    if (isCover) {
      return { backgroundImage: `url(${coverPhoto})` };
    }
    if (currentSlide.banner) {
      return { backgroundImage: `url(${currentSlide.banner})` };
    }
    // Gradient fallback based on sport
    const sport = currentSlide.category || 'football';
    const gradients: Record<string, string> = {
      football: 'linear-gradient(135deg, #1a472a 0%, #2d5016 50%, #1a472a 100%)',
      basketball: 'linear-gradient(135deg, #c9082a 0%, #17408b 50%, #c9082a 100%)',
      hockey: 'linear-gradient(135deg, #041e42 0%, #a2aaad 50%, #041e42 100%)',
      baseball: 'linear-gradient(135deg, #bf0d3e 0%, #002d72 50%, #bf0d3e 100%)',
      golf: 'linear-gradient(135deg, #006747 0%, #ffc72c 50%, #006747 100%)',
    };
    return { background: gradients[sport] || gradients.football };
  };

  return (
    <div className="relative w-full h-[280px] md:h-[400px] rounded-xl overflow-hidden group">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={getBackgroundStyle()}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
      
      {/* Team badges for matches without banner */}
      {!isCover && !currentSlide.banner && (currentSlide.homeBadge || currentSlide.awayBadge) && (
        <div className="absolute inset-0 flex items-center justify-center gap-8 opacity-20">
          {currentSlide.homeBadge && (
            <img src={currentSlide.homeBadge} alt="" className="w-32 h-32 md:w-48 md:h-48 object-contain" />
          )}
          {currentSlide.awayBadge && (
            <img src={currentSlide.awayBadge} alt="" className="w-32 h-32 md:w-48 md:h-48 object-contain" />
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-8">
        {isCover ? (
          // Cover slide content
          <>
            <h2 className="text-white text-xl md:text-3xl font-bold mb-2">
              Watch Live Sports Streaming Free
            </h2>
            <p className="text-white/70 text-sm md:text-base">
              Champions League, Premier League, NBA, NFL, UFC & More
            </p>
          </>
        ) : (
          // Match slide content
          <>
            {/* Sport & Category */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl md:text-2xl">{getSportIcon(currentSlide.category || 'sports')}</span>
              <span className="text-gray-300 text-xs md:text-sm font-medium uppercase tracking-wide">
                {currentSlide.title?.split(':')[0] || currentSlide.category}
              </span>
            </div>
            
            {/* Teams */}
            <div className="mb-3">
              <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                {/* Home Team */}
                <div className="flex items-center gap-2 md:gap-3">
                  {currentSlide.homeBadge && (
                    <img 
                      src={currentSlide.homeBadge} 
                      alt="" 
                      className="w-8 h-8 md:w-12 md:h-12 object-contain"
                    />
                  )}
                  <span className="text-white text-lg md:text-2xl font-bold">
                    {currentSlide.homeTeam || currentSlide.teams?.home?.name}
                  </span>
                </div>
                
                <span className="text-gray-400 text-base md:text-xl font-light">vs</span>
                
                {/* Away Team */}
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-white text-lg md:text-2xl font-bold">
                    {currentSlide.awayTeam || currentSlide.teams?.away?.name}
                  </span>
                  {currentSlide.awayBadge && (
                    <img 
                      src={currentSlide.awayBadge} 
                      alt="" 
                      className="w-8 h-8 md:w-12 md:h-12 object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Match Time */}
            {currentSlide.date && (
              <p className="text-gray-400 text-sm mb-3">
                {format(new Date(currentSlide.date), 'MMM d, yyyy • h:mm a')}
              </p>
            )}
            
            {/* Watch Button */}
            <Link
              to={`/match/${currentSlide.category || 'football'}/${currentSlide.id}`}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors w-fit"
            >
              <Play className="w-4 h-4 fill-current" />
              Watch Now
            </Link>
          </>
        )}
        
        {/* Dots Navigation */}
        <div className="flex gap-1.5 mt-4">
          {allSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 rounded-full transition-all ${
                idx === currentIndex 
                  ? 'bg-red-600 w-6' 
                  : 'bg-gray-500 hover:bg-gray-400 w-4'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );
};

export default HeroCarousel;
