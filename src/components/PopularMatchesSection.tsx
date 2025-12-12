import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SectionHeader from './SectionHeader';
import { format } from 'date-fns';
import TeamLogo from './TeamLogo';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface CDNChannel {
  id: string;
  title: string;
  country: string;
  logo: string;
  embedUrl: string;
}

interface BroadcastChannel {
  id: string;
  name: string;
  logo: string | null;
  country: string;
  language: string | null;
  cdnChannel: CDNChannel | null;
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
  channels: BroadcastChannel[];
}

// Cache for matches
const matchesCache: { data: PopularMatch[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

const PopularMatchCard: React.FC<{ match: PopularMatch }> = ({ match }) => {
  const [imgError, setImgError] = useState({ home: false, away: false, poster: false });
  const countdown = useCountdown(match.timestamp);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const channels = match.channels || [];
  const streamableChannel = channels.find(ch => ch.cdnChannel);
  const hasStream = streamableChannel !== undefined;
  
  // Link to dedicated page to show all stream options
  const watchUrl = `/selected-match/${match.id}`;

  // Generate thumbnail - same logic as MatchCard
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

    // Team badges fallback
    if ((match.homeTeamBadge && !imgError.home) || (match.awayTeamBadge && !imgError.away)) {
      return (
        <div className="w-full h-full relative overflow-hidden bg-black">
          <div className="flex items-center gap-4 z-10 relative h-full justify-center">
            {match.homeTeamBadge && !imgError.home ? (
              <div className="flex flex-col items-center">
                <img
                  src={match.homeTeamBadge}
                  alt={match.homeTeam}
                  className="w-14 h-14 object-contain drop-shadow-md filter brightness-110"
                  onError={() => setImgError(prev => ({ ...prev, home: true }))}
                />
                <span className="text-white text-xs font-medium mt-1 text-center truncate max-w-[60px] drop-shadow-sm">
                  {match.homeTeam}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {match.homeTeam.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-white text-xs font-medium mt-1 text-center truncate max-w-[60px] drop-shadow-sm">
                  {match.homeTeam}
                </span>
              </div>
            )}
            <span className="text-white font-bold text-lg drop-shadow-sm">VS</span>
            {match.awayTeamBadge && !imgError.away ? (
              <div className="flex flex-col items-center">
                <img
                  src={match.awayTeamBadge}
                  alt={match.awayTeam}
                  className="w-14 h-14 object-contain drop-shadow-md filter brightness-110"
                  onError={() => setImgError(prev => ({ ...prev, away: true }))}
                />
                <span className="text-white text-xs font-medium mt-1 text-center truncate max-w-[60px] drop-shadow-sm">
                  {match.awayTeam}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {match.awayTeam.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-white text-xs font-medium mt-1 text-center truncate max-w-[60px] drop-shadow-sm">
                  {match.awayTeam}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default DAMITV fallback
    return (
      <div className="w-full h-full relative overflow-hidden bg-black">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="text-white font-bold text-2xl drop-shadow-lg tracking-wide">DAMITV</span>
        </div>
      </div>
    );
  };

  const matchDate = new Date(match.timestamp);

  return (
    <Link to={watchUrl}>
      <div ref={cardRef} className="group cursor-pointer h-full">
        <div className="relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:opacity-90 h-full flex flex-col">
          {/* Banner Image Section - 16:9 aspect ratio */}
          <div className="relative aspect-video overflow-hidden rounded-t-xl flex-shrink-0">
            {generateThumbnail()}
            
            {/* FREE Badge - Top left */}
            {hasStream && !match.isLive && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-green-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  FREE
                </span>
              </div>
            )}
            
            {/* LIVE Badge - Top right */}
            {match.isLive && (
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded animate-pulse">
                  ● LIVE
                </span>
              </div>
            )}
            
            {/* Countdown */}
            {!match.isLive && countdown && (
              <div className="absolute bottom-2 left-2 z-10">
                <div className="bg-[hsl(16,100%,60%)] text-white text-[10px] font-bold py-1 px-2.5 rounded italic tracking-wide">
                  WATCH IN {countdown}
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="p-3 flex flex-col gap-2 flex-1 bg-card">
            {/* Sport • League */}
            <p className="text-xs text-muted-foreground truncate">
              {match.sport} • {match.league}
            </p>
            
            {/* Home Team with Score */}
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
            
            {/* Away Team with Score */}
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
            
            {/* Match Time */}
            <div className="flex items-center justify-between mt-auto">
              {match.isLive ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {match.progress || 'Live'}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {format(matchDate, 'EEE, do MMM, h:mm a')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const PopularMatchesSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="rounded-xl bg-card overflow-hidden">
        <div className="aspect-video bg-muted animate-pulse" />
        <div className="p-3 space-y-2">
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-3 w-28 bg-muted animate-pulse rounded" />
        </div>
      </div>
    ))}
  </div>
);

const PopularMatchesSection: React.FC = () => {
  const [matches, setMatches] = useState<PopularMatch[]>([]);
  const [loading, setLoading] = useState(true);

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
        const activeMatches = fetchedMatches.filter((m: PopularMatch) => !m.isFinished);
        
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
    
    const interval = setInterval(fetchPopularMatches, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
      
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-3">
          {matches.map(match => (
            <CarouselItem 
              key={match.id} 
              className="pl-2 md:pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
            >
              <PopularMatchCard match={match} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default PopularMatchesSection;
