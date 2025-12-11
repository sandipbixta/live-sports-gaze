import React, { useState, useEffect } from 'react';
import { useFeaturedMatches } from '../hooks/useFeaturedMatches';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import defaultBg from '../assets/hero-background.jpeg';

const FeaturedMatchesCarousel = () => {
  const { matches, loading, error } = useFeaturedMatches(6);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (matches.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % matches.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [matches.length]);

  if (loading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-muted animate-pulse rounded-xl" />
    );
  }

  if (error || matches.length === 0) {
    // Fallback to static hero
    return (
      <div 
        className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${defaultBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Live Sports Streaming
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Watch live sports from around the world
          </p>
          <Link
            to="/live"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors w-fit"
          >
            <Play className="w-5 h-5" />
            Browse Live Matches
          </Link>
        </div>
      </div>
    );
  }

  const currentMatch = matches[currentIndex];
  const backgroundImage = currentMatch.poster || defaultBg;

  // Check if match is live
  const isLive = currentMatch.isLive || 
    currentMatch.status === 'live' || 
    (currentMatch.date && new Date(currentMatch.date).getTime() <= Date.now());

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden group">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          filter: 'brightness(0.4)'
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
        {/* Live badge */}
        {isLive && (
          <span className="inline-flex items-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded mb-3 w-fit">
            <span className="w-2 h-2 bg-destructive-foreground rounded-full animate-pulse" />
            LIVE
          </span>
        )}
        
        {/* Category/League */}
        <p className="text-muted-foreground text-sm mb-2 capitalize">
          {currentMatch.category || currentMatch.league || currentMatch.sport}
        </p>
        
        {/* Teams */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          {/* Home Team */}
          <div className="flex items-center gap-3">
            {currentMatch.teams?.home?.badge && (
              <img 
                src={currentMatch.teams.home.badge} 
                alt="" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
              />
            )}
            <span className="text-foreground text-lg md:text-2xl font-bold">
              {currentMatch.teams?.home?.name || 'Home'}
            </span>
          </div>
          
          <span className="text-muted-foreground text-lg font-medium">vs</span>
          
          {/* Away Team */}
          <div className="flex items-center gap-3">
            <span className="text-foreground text-lg md:text-2xl font-bold">
              {currentMatch.teams?.away?.name || 'Away'}
            </span>
            {currentMatch.teams?.away?.badge && (
              <img 
                src={currentMatch.teams.away.badge} 
                alt="" 
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
              />
            )}
          </div>
        </div>
        
        {/* Watch button */}
        <Link
          to={`/match/${currentMatch.category || 'football'}/${currentMatch.id}`}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-colors w-fit"
        >
          <Play className="w-5 h-5" />
          Watch Now
        </Link>
        
        {/* Dots navigation */}
        <div className="flex gap-2 mt-6">
          {matches.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-primary' : 'bg-muted-foreground/50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
      
      {/* Navigation arrows */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % matches.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default FeaturedMatchesCarousel;
