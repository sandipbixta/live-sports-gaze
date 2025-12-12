import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SectionHeader from './SectionHeader';
import { Calendar, Clock, Play, ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import TeamLogo from './TeamLogo';

interface CDNChannel {
  id: string;
  title: string;
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
  sport: string;
  league: string;
  date: string;
  time: string;
  timestamp: string;
  venue: string | null;
  country: string | null;
  status: string | null;
  progress: string | null;
  poster: string | null;
  banner: string | null;
  isLive: boolean;
  isFinished: boolean;
  channels: CDNChannel[];
}

// Cache for matches
const matchesCache: { data: PopularMatch[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const SPORT_ICONS: Record<string, string> = {
  'Soccer': '⚽',
  'Basketball': '🏀',
  'American Football': '🏈',
  'Ice Hockey': '🏒',
  'Tennis': '🎾',
  'Baseball': '⚾',
};

const getSportIcon = (sport: string): string => SPORT_ICONS[sport] || '🏆';

const formatMatchDate = (timestamp: string, date: string): string => {
  try {
    const matchDate = parseISO(timestamp || date);
    if (isToday(matchDate)) return 'Today';
    if (isTomorrow(matchDate)) return 'Tomorrow';
    return format(matchDate, 'EEE, MMM d');
  } catch {
    return date;
  }
};

const formatMatchTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, 'h:mm a');
  } catch {
    return time;
  }
};

// Calculate countdown
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

const PopularMatchCard: React.FC<{ match: PopularMatch }> = ({ match }) => {
  const [imgError, setImgError] = useState({ home: false, away: false, poster: false });
  const countdown = useCountdown(match.timestamp);
  
  // Ensure channels is always an array
  const channels = match.channels || [];
  
  // Build watch URL - if channels available, link to first channel, else to a match page
  const watchUrl = channels.length > 0 
    ? `/channel/${channels[0].country}/${channels[0].id}`
    : `/live`;

  return (
    <div className="group cursor-pointer h-full min-w-[280px] sm:min-w-[320px]">
      <div className="relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:opacity-90 h-full flex flex-col">
        {/* Banner Image Section */}
        <div className="relative aspect-video overflow-hidden rounded-t-xl flex-shrink-0">
          {/* Background */}
          <div className="w-full h-full relative bg-black">
            {match.poster && !imgError.poster ? (
              <img
                src={match.poster}
                alt={match.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImgError(prev => ({ ...prev, poster: true }))}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center gap-4">
                {match.homeTeamBadge && !imgError.home ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={match.homeTeamBadge}
                      alt={match.homeTeam}
                      className="w-14 h-14 object-contain drop-shadow-md"
                      onError={() => setImgError(prev => ({ ...prev, home: true }))}
                    />
                    <span className="text-white text-xs font-medium mt-1 truncate max-w-[60px]">
                      {match.homeTeam}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {match.homeTeam.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-white text-xs font-medium mt-1 truncate max-w-[60px]">
                      {match.homeTeam}
                    </span>
                  </div>
                )}
                <span className="text-white font-bold text-lg">VS</span>
                {match.awayTeamBadge && !imgError.away ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={match.awayTeamBadge}
                      alt={match.awayTeam}
                      className="w-14 h-14 object-contain drop-shadow-md"
                      onError={() => setImgError(prev => ({ ...prev, away: true }))}
                    />
                    <span className="text-white text-xs font-medium mt-1 truncate max-w-[60px]">
                      {match.awayTeam}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {match.awayTeam.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-white text-xs font-medium mt-1 truncate max-w-[60px]">
                      {match.awayTeam}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* FREE Badge */}
          {channels.length > 0 && !match.isLive && (
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-green-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                FREE
              </span>
            </div>
          )}
          
          {/* LIVE Badge */}
          {match.isLive && (
            <div className="absolute top-2 right-2 z-10">
              <span className="bg-destructive text-destructive-foreground text-[10px] font-bold uppercase px-2 py-0.5 rounded animate-pulse">
                ● LIVE
              </span>
            </div>
          )}
          
          {/* Countdown */}
          {!match.isLive && countdown && (
            <div className="absolute bottom-2 left-2 z-10">
              <div className="bg-primary text-primary-foreground text-[10px] font-bold py-1 px-2.5 rounded italic tracking-wide">
                WATCH IN {countdown}
              </div>
            </div>
          )}
          
          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <Play className="w-6 h-6 text-primary-foreground fill-current" />
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 flex flex-col gap-2 flex-1 bg-card">
          {/* Sport • League */}
          <p className="text-xs text-muted-foreground truncate">
            {getSportIcon(match.sport)} {match.sport} • {match.league}
          </p>
          
          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamLogo teamName={match.homeTeam} sport={match.sport} size="sm" showFallbackIcon={false} />
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
              <TeamLogo teamName={match.awayTeam} sport={match.sport} size="sm" showFallbackIcon={false} />
              <span className="text-sm font-medium text-foreground truncate">{match.awayTeam}</span>
            </div>
            {match.isLive && match.awayScore && (
              <span className="text-foreground font-bold text-lg ml-2 min-w-[28px] text-right tabular-nums">
                {match.awayScore}
              </span>
            )}
          </div>
          
          {/* Date/Time and Watch Button */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatMatchDate(match.timestamp, match.date)}</span>
              <Clock className="w-3 h-3 ml-1" />
              <span>{formatMatchTime(match.time)}</span>
            </div>
          </div>
          
          {/* Watch Button */}
          <Link to={watchUrl} className="w-full">
            <Button 
              size="sm" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Play className="w-4 h-4 mr-2 fill-current" />
              Watch Now
              {channels.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px]">
                  <Tv className="w-3 h-3 mr-1" />
                  {channels.length}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const PopularMatchesSkeleton: React.FC = () => (
  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="min-w-[280px] sm:min-w-[320px]">
        <div className="rounded-xl bg-card overflow-hidden">
          <div className="aspect-video bg-muted animate-pulse" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-28 bg-muted animate-pulse rounded" />
            <div className="h-8 w-full bg-muted animate-pulse rounded mt-2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const PopularMatchesSection: React.FC = () => {
  const [matches, setMatches] = useState<PopularMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchPopularMatches = async () => {
      try {
        // Check local cache first
        if (matchesCache.data && Date.now() - matchesCache.timestamp < CACHE_DURATION) {
          console.log('Using cached popular matches');
          setMatches(matchesCache.data);
          setLoading(false);
          return;
        }
        
        setLoading(true);
        
        const { data, error } = await supabase.functions.invoke('fetch-popular-matches');
        
        if (error) {
          console.error('Error fetching popular matches:', error);
          return;
        }
        
        const fetchedMatches = data?.matches || [];
        
        // Filter out finished matches on client side too
        const activeMatches = fetchedMatches.filter((m: PopularMatch) => !m.isFinished);
        
        // Update cache
        matchesCache.data = activeMatches;
        matchesCache.timestamp = Date.now();
        
        console.log('Popular matches:', activeMatches.length);
        setMatches(activeMatches);
      } catch (err) {
        console.error('Error fetching popular matches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularMatches();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchPopularMatches, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Check scroll position
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, [matches]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="mb-8">
        <SectionHeader title="Selected Matches" />
        <PopularMatchesSkeleton />
      </section>
    );
  }

  if (matches.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <SectionHeader 
        title="Selected Matches" 
        seeAllLink="/schedule" 
        seeAllText="VIEW SCHEDULE"
      />
      
      <div className="relative">
        {/* Scroll buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        
        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {matches.map(match => (
            <PopularMatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularMatchesSection;
