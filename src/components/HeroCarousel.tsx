import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFeaturedMatches } from '../hooks/useFeaturedMatches';
import { getSportIcon } from '../services/sportsLogoService';
import coverPhoto from '@/assets/damitv-cover.jpeg';

export const HeroCarousel = () => {
  const { matches, loading } = useFeaturedMatches(8);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (matches.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (matches.length + 1)); // +1 for cover slide
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

  if (allSlides.length <= 1 && matches.length === 0) {
    // Show only cover if no matches
    return (
      <div className="relative w-full h-[280px] md:h-[400px] rounded-xl overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${coverPhoto})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-white text-xl md:text-2xl font-bold">
            Watch Live Sports Streaming Free
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Champions League, Premier League, NBA, NFL & More
          </p>
        </div>
      </div>
    );
  }

  const currentSlide = allSlides[currentIndex];
  const isCover = (currentSlide as any).isCover;

  return (
    <div className="relative w-full h-[280px] md:h-[400px] rounded-xl overflow-hidden group">
      {/* Background Banner Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ 
          backgroundImage: `url(${isCover ? coverPhoto : currentSlide.banner})`,
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
      
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
            {/* Live Badge */}
            {currentSlide.isLive && (
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </span>
                {currentSlide.strProgress && (
                  <span className="text-white/80 text-sm">{currentSlide.strProgress}</span>
                )}
              </div>
            )}
            
            {/* Sport & League */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl md:text-2xl">{getSportIcon(currentSlide.sport || currentSlide.category || 'sports')}</span>
              <span className="text-gray-300 text-xs md:text-sm font-medium uppercase tracking-wide">
                {currentSlide.strLeague || currentSlide.league || currentSlide.title?.split(':')[0] || currentSlide.category}
              </span>
            </div>
            
            {/* Teams */}
            <div className="mb-4">
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
                    {currentSlide.homeTeam || currentSlide.strHomeTeam || currentSlide.teams?.home?.name}
                  </span>
                  {currentSlide.isLive && currentSlide.intHomeScore !== undefined && (
                    <span className="text-white text-xl md:text-3xl font-bold ml-1">
                      {currentSlide.intHomeScore}
                    </span>
                  )}
                </div>
                
                <span className="text-gray-400 text-base md:text-xl font-light">vs</span>
                
                {/* Away Team */}
                <div className="flex items-center gap-2 md:gap-3">
                  {currentSlide.isLive && currentSlide.intAwayScore !== undefined && (
                    <span className="text-white text-xl md:text-3xl font-bold mr-1">
                      {currentSlide.intAwayScore}
                    </span>
                  )}
                  <span className="text-white text-lg md:text-2xl font-bold">
                    {currentSlide.awayTeam || currentSlide.strAwayTeam || currentSlide.teams?.away?.name}
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
            
            {/* Watch Button */}
            <Link
              to={`/match/${currentSlide.category || currentSlide.sport || 'football'}/${currentSlide.id || currentSlide.idEvent}`}
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
