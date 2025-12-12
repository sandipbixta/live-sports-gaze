import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Match } from '../types/sports';
import { Badge } from './ui/badge';
import TeamLogo from './TeamLogo';

interface HeroSectionProps {
  matches: Match[];
  onWatchNow?: (match: Match) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ matches, onWatchNow }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredMatches = matches.slice(0, 5);
  
  useEffect(() => {
    if (featuredMatches.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMatches.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [featuredMatches.length]);

  if (featuredMatches.length === 0) {
    return (
      <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-card to-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Live Matches</h2>
          <p className="text-muted-foreground">Check back soon for live sports action</p>
        </div>
      </div>
    );
  }

  const currentMatch = featuredMatches[currentIndex];
  const isLive = currentMatch.isLive || (currentMatch.date && currentMatch.date <= Date.now());
  const home = currentMatch.teams?.home?.name || 'TBA';
  const away = currentMatch.teams?.away?.name || 'TBA';

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const goToSlide = (index: number) => setCurrentIndex(index);
  const goPrev = () => setCurrentIndex((prev) => (prev - 1 + featuredMatches.length) % featuredMatches.length);
  const goNext = () => setCurrentIndex((prev) => (prev + 1) % featuredMatches.length);

  return (
    <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-card to-background" />
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-10">
        {/* Category & Status */}
        <div className="flex items-center gap-3 mb-4">
          {isLive ? (
            <Badge className="bg-live text-white font-bold uppercase tracking-wide animate-pulse-live">
              ● LIVE
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-sports-upcoming text-white font-semibold">
              <Calendar className="w-3 h-3 mr-1" />
              {formatTime(currentMatch.date)}
            </Badge>
          )}
          <span className="text-muted-foreground text-sm uppercase tracking-wide">
            {currentMatch.category || currentMatch.tournament || 'Sports'}
          </span>
        </div>
        
        {/* Teams */}
        <div className="flex items-center gap-6 md:gap-10 mb-6">
          {/* Home Team */}
          <div className="flex items-center gap-3">
            <TeamLogo 
              teamName={home} 
              sport={currentMatch.category} 
              size="lg" 
              className="w-16 h-16 md:w-20 md:h-20"
            />
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-foreground">{home}</h2>
              {isLive && currentMatch.score?.home !== undefined && (
                <span className="text-3xl md:text-5xl font-black text-primary">{currentMatch.score.home}</span>
              )}
            </div>
          </div>
          
          {/* VS */}
          <div className="flex flex-col items-center">
            <span className="text-2xl md:text-4xl font-bold text-muted-foreground">VS</span>
            {currentMatch.progress && (
              <span className="text-sm text-primary font-medium">{currentMatch.progress}</span>
            )}
          </div>
          
          {/* Away Team */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h2 className="text-xl md:text-3xl font-bold text-foreground">{away}</h2>
              {isLive && currentMatch.score?.away !== undefined && (
                <span className="text-3xl md:text-5xl font-black text-primary">{currentMatch.score.away}</span>
              )}
            </div>
            <TeamLogo 
              teamName={away} 
              sport={currentMatch.category} 
              size="lg" 
              className="w-16 h-16 md:w-20 md:h-20"
            />
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-4">
          {currentMatch.sources?.length > 0 ? (
            <Link to={`/match/${currentMatch.sportId || currentMatch.category}/${currentMatch.id}`}>
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 h-auto rounded-xl shadow-glow">
                <Play className="w-5 h-5 mr-2 fill-current" />
                {isLive ? 'Watch Live' : 'Watch Now'}
              </Button>
            </Link>
          ) : (
            <Button variant="secondary" className="font-bold px-6 py-3 h-auto rounded-xl" disabled>
              Coming Soon
            </Button>
          )}
          
          {currentMatch.viewerCount && currentMatch.viewerCount > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">{currentMatch.viewerCount.toLocaleString()} watching</span>
            </div>
          )}
        </div>
        
        {/* Slide indicators */}
        {featuredMatches.length > 1 && (
          <div className="flex items-center gap-2 mt-6">
            {featuredMatches.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-primary' 
                    : 'w-4 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Navigation arrows */}
      {featuredMatches.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/70"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/70"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        </>
      )}
    </div>
  );
};

export default HeroSection;
