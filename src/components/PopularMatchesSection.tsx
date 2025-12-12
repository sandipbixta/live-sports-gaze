import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SectionHeader from './SectionHeader';
import { format } from 'date-fns';
import TeamLogo from './TeamLogo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Play, Tv, ChevronLeft, ChevronRight } from 'lucide-react';

interface CDNChannel {
  id: string;
  name: string;
  country: string;
  logo: string;
  embedUrl: string;
}

interface PopularMatch {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamBadge: string | null;
  awayTeamBadge: string | null;
  homeScore: string | null;
  awayScore: string | null;
  league: string;
  leagueId: string;
  date: string;
  time: string;
  timestamp: string;
  status: string | null;
  progress: string | null;
  poster: string | null;
  isLive: boolean;
  isFinished: boolean;
  channels: CDNChannel[];
  priority: number;
}

// Countdown hook
const useCountdown = (timestamp: string) => {
  const [countdown, setCountdown] = useState('');
  
  useEffect(() => {
    const matchDate = new Date(timestamp);
    
    const updateCountdown = () => {
      const now = Date.now();
      const timeUntilMatch = matchDate.getTime() - now;
      
      if (timeUntilMatch <= 0) {
        setCountdown('');
        return;
      }
      
      const hours = Math.floor(timeUntilMatch / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilMatch % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeUntilMatch % (1000 * 60)) / 1000);
      
      if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        setCountdown(`${days}d : ${remainingHours}h`);
      } else if (hours > 0) {
        setCountdown(`${hours}h : ${minutes.toString().padStart(2, '0')}m`);
      } else {
        setCountdown(`${minutes}m : ${seconds.toString().padStart(2, '0')}s`);
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [timestamp]);
  
  return countdown;
};

// Stream Modal Component
const StreamModal: React.FC<{
  match: PopularMatch | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ match, isOpen, onClose }) => {
  const [selectedChannel, setSelectedChannel] = useState<CDNChannel | null>(null);
  
  useEffect(() => {
    if (match && match.channels.length > 0) {
      setSelectedChannel(match.channels[0]);
    }
  }, [match]);
  
  if (!match) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] p-0 bg-background border-border overflow-hidden">
        <DialogHeader className="p-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {match.isLive && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                  ● LIVE
                </span>
              )}
              <DialogTitle className="text-lg font-bold">{match.title}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {match.isLive && match.homeScore && match.awayScore && (
            <div className="flex items-center justify-center gap-4 py-2">
              <span className="font-bold text-2xl">{match.homeScore}</span>
              <span className="text-muted-foreground">-</span>
              <span className="font-bold text-2xl">{match.awayScore}</span>
            </div>
          )}
        </DialogHeader>
        
        {/* Stream Player */}
        <div className="aspect-video bg-black relative">
          {selectedChannel ? (
            <iframe
              src={selectedChannel.embedUrl}
              className="w-full h-full border-0"
              allowFullScreen
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Tv className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a channel to start watching</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Channel Selection */}
        {match.channels.length > 1 && (
          <div className="p-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Available Channels:</p>
            <div className="flex flex-wrap gap-2">
              {match.channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel?.id === channel.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedChannel(channel)}
                  className="text-xs"
                >
                  <Play className="w-3 h-3 mr-1" />
                  {channel.name} ({channel.country})
                </Button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Match Card Component
const PopularMatchCard: React.FC<{ 
  match: PopularMatch; 
  onClick: () => void;
}> = ({ match, onClick }) => {
  const [imgError, setImgError] = useState({ home: false, away: false, poster: false });
  const countdown = useCountdown(match.timestamp);
  
  const hasStream = match.channels.length > 0;

  const generateThumbnail = () => {
    if (match.poster && !imgError.poster) {
      return (
        <div className="w-full h-full relative bg-black">
          <img
            src={match.poster}
            alt={match.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(prev => ({ ...prev, poster: true }))}
          />
        </div>
      );
    }

    if ((match.homeTeamBadge && !imgError.home) || (match.awayTeamBadge && !imgError.away)) {
      return (
        <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-primary/20 to-background">
          <div className="flex items-center gap-4 z-10 relative h-full justify-center">
            {match.homeTeamBadge && !imgError.home ? (
              <div className="flex flex-col items-center">
                <img
                  src={match.homeTeamBadge}
                  alt={match.homeTeam}
                  className="w-12 h-12 object-contain drop-shadow-md"
                  onError={() => setImgError(prev => ({ ...prev, home: true }))}
                />
                <span className="text-foreground text-[10px] font-medium mt-1 text-center truncate max-w-[60px]">
                  {match.homeTeam}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground text-xs font-bold">
                  {match.homeTeam.substring(0, 2).toUpperCase()}
                </div>
              </div>
            )}
            <span className="text-foreground font-bold text-sm">VS</span>
            {match.awayTeamBadge && !imgError.away ? (
              <div className="flex flex-col items-center">
                <img
                  src={match.awayTeamBadge}
                  alt={match.awayTeam}
                  className="w-12 h-12 object-contain drop-shadow-md"
                  onError={() => setImgError(prev => ({ ...prev, away: true }))}
                />
                <span className="text-foreground text-[10px] font-medium mt-1 text-center truncate max-w-[60px]">
                  {match.awayTeam}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground text-xs font-bold">
                  {match.awayTeam.substring(0, 2).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-primary/30 to-background">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-foreground font-bold text-xl tracking-wide">DAMITV</span>
        </div>
      </div>
    );
  };

  const matchDate = new Date(match.timestamp);

  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer h-full min-w-[280px] flex-shrink-0"
    >
      <div className="relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:scale-[1.02] hover:shadow-xl h-full flex flex-col border border-border/50">
        {/* Banner Image Section */}
        <div className="relative aspect-video overflow-hidden rounded-t-xl flex-shrink-0">
          {generateThumbnail()}
          
          {/* LIVE Badge */}
          {match.isLive && (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                LIVE
              </span>
            </div>
          )}
          
          {/* FREE Badge */}
          {hasStream && !match.isLive && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-green-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                FREE
              </span>
            </div>
          )}
          
          {/* Countdown */}
          {!match.isLive && countdown && (
            <div className="absolute bottom-2 left-2 z-10">
              <div className="bg-primary text-primary-foreground text-[10px] font-bold py-1 px-2.5 rounded">
                STARTS IN {countdown}
              </div>
            </div>
          )}
          
          {/* Live Score Overlay */}
          {match.isLive && match.homeScore && match.awayScore && (
            <div className="absolute bottom-2 right-2 z-10">
              <div className="bg-black/80 text-white text-sm font-bold py-1 px-3 rounded">
                {match.homeScore} - {match.awayScore}
              </div>
            </div>
          )}
          
          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 flex flex-col gap-2 flex-1 bg-card">
          {/* League */}
          <p className="text-xs text-muted-foreground truncate">
            ⚽ {match.league}
          </p>
          
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo teamName={match.homeTeam} sport="Soccer" size="sm" showFallbackIcon={false} />
              <span className="text-sm font-medium text-foreground truncate">{match.homeTeam}</span>
            </div>
            {match.isLive && match.homeScore && (
              <span className="text-foreground font-bold text-lg ml-2 min-w-[28px] text-right tabular-nums">
                {match.homeScore}
              </span>
            )}
          </div>
          
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo teamName={match.awayTeam} sport="Soccer" size="sm" showFallbackIcon={false} />
              <span className="text-sm font-medium text-foreground truncate">{match.awayTeam}</span>
            </div>
            {match.isLive && match.awayScore && (
              <span className="text-foreground font-bold text-lg ml-2 min-w-[28px] text-right tabular-nums">
                {match.awayScore}
              </span>
            )}
          </div>
          
          {/* Match Time/Progress */}
          <div className="flex items-center justify-between mt-auto pt-1 border-t border-border/50">
            {match.isLive ? (
              <span className="text-xs text-red-500 font-medium">
                {match.progress || 'Live'}
              </span>
            ) : (
              <p className="text-xs text-muted-foreground">
                {format(matchDate, 'EEE, MMM d • h:mm a')}
              </p>
            )}
            {match.channels.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {match.channels.length} stream{match.channels.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Component
const MatchCardSkeleton: React.FC = () => (
  <div className="min-w-[280px] flex-shrink-0 rounded-xl bg-card overflow-hidden border border-border/50">
    <div className="aspect-video bg-muted animate-pulse" />
    <div className="p-3 space-y-2">
      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      <div className="h-4 w-28 bg-muted animate-pulse rounded" />
      <div className="h-3 w-36 bg-muted animate-pulse rounded" />
    </div>
  </div>
);

const PopularMatchesSection: React.FC = () => {
  const [matches, setMatches] = useState<PopularMatch[]>([]);
  const [liveCount, setLiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<PopularMatch | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const fetchMatches = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('fetch-popular-matches');
      
      if (error) {
        console.error('Error fetching popular matches:', error);
        return;
      }
      
      const fetchedMatches = data?.matches || [];
      setMatches(fetchedMatches);
      setLiveCount(data?.liveCount || 0);
      
      console.log(`Popular matches: ${fetchedMatches.length} (${data?.liveCount || 0} live)`);
    } catch (err) {
      console.error('Error fetching popular matches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches(true);
    
    // Full data refresh every 2 minutes
    const fullRefreshInterval = setInterval(() => fetchMatches(false), 2 * 60 * 1000);
    
    // Live score refresh every 30 seconds (only if there are live matches)
    const liveRefreshInterval = setInterval(() => {
      if (liveCount > 0) {
        fetchMatches(false);
      }
    }, 30 * 1000);
    
    return () => {
      clearInterval(fullRefreshInterval);
      clearInterval(liveRefreshInterval);
    };
  }, [fetchMatches, liveCount]);

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      return () => container.removeEventListener('scroll', checkScrollButtons);
    }
  }, [checkScrollButtons, matches]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="mb-8">
        <SectionHeader title="Selected Matches" />
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <MatchCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (matches.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">Selected Matches</h2>
          {liveCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              {liveCount} LIVE
            </span>
          )}
        </div>
        <a 
          href="/schedule" 
          className="text-sm text-primary hover:underline"
        >
          VIEW SCHEDULE →
        </a>
      </div>
      
      <div className="relative group">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background/90 border border-border rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background/90 border border-border rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        
        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {matches.map(match => (
            <PopularMatchCard 
              key={match.id} 
              match={match} 
              onClick={() => setSelectedMatch(match)}
            />
          ))}
        </div>
      </div>
      
      {/* Stream Modal */}
      <StreamModal
        match={selectedMatch}
        isOpen={selectedMatch !== null}
        onClose={() => setSelectedMatch(null)}
      />
    </section>
  );
};

export default PopularMatchesSection;
