import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import SectionHeader from './SectionHeader';
import { Calendar, Clock, MapPin, Trophy, Play } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';

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
}

const SPORT_ICONS: Record<string, string> = {
  'Soccer': '⚽',
  'Basketball': '🏀',
  'American Football': '🏈',
  'Ice Hockey': '🏒',
  'Tennis': '🎾',
  'Baseball': '⚾',
  'Rugby': '🏉',
  'Cricket': '🏏',
  'Golf': '⛳',
  'MMA': '🥊',
  'Boxing': '🥊',
  'Formula 1': '🏎️',
  'Motorsport': '🏎️',
};

const getSportIcon = (sport: string): string => {
  return SPORT_ICONS[sport] || '🏆';
};

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

const PopularMatchCard: React.FC<{ match: PopularMatch }> = ({ match }) => {
  const [imgError, setImgError] = useState({ home: false, away: false });
  
  const handleImageError = (team: 'home' | 'away') => {
    setImgError(prev => ({ ...prev, [team]: true }));
  };

  const matchUrl = `/match/sportsdb/${match.id}`;
  
  return (
    <Link to={matchUrl}>
      <Card className="group relative overflow-hidden bg-card hover:bg-accent/50 transition-all duration-300 border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        {/* Match poster background */}
        {match.poster && (
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
            <img 
              src={match.poster} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        
        <CardContent className="relative p-4">
          {/* League and Sport */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getSportIcon(match.sport)}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {match.league}
              </span>
            </div>
            {match.isLive && (
              <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
          
          {/* Teams */}
          <div className="space-y-3">
            {/* Home Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {match.homeTeamBadge && !imgError.home ? (
                  <img 
                    src={match.homeTeamBadge} 
                    alt={match.homeTeam}
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                    onError={() => handleImageError('home')}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
                <span className="text-sm font-medium text-foreground truncate">
                  {match.homeTeam}
                </span>
              </div>
              {match.homeScore && (
                <span className="text-foreground font-bold text-lg ml-2 min-w-[28px] text-right">
                  {match.homeScore}
                </span>
              )}
            </div>
            
            {/* Away Team */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {match.awayTeamBadge && !imgError.away ? (
                  <img 
                    src={match.awayTeamBadge} 
                    alt={match.awayTeam}
                    className="w-6 h-6 object-contain"
                    loading="lazy"
                    onError={() => handleImageError('away')}
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
                <span className="text-sm font-medium text-foreground truncate">
                  {match.awayTeam}
                </span>
              </div>
              {match.awayScore && (
                <span className="text-foreground font-bold text-lg ml-2 min-w-[28px] text-right">
                  {match.awayScore}
                </span>
              )}
            </div>
          </div>
          
          {/* Match Info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatMatchDate(match.timestamp, match.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatMatchTime(match.time)}</span>
              </div>
            </div>
            
            {/* Play button on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-foreground fill-current" />
              </div>
            </div>
          </div>
          
          {/* Venue */}
          {match.venue && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{match.venue}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

const PopularMatchesSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="flex gap-3 mt-3 pt-3 border-t border-border">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const PopularMatchesSection: React.FC = () => {
  const [matches, setMatches] = useState<PopularMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase.functions.invoke('fetch-popular-matches');
        
        if (error) {
          console.error('Error fetching popular matches:', error);
          setError('Failed to load matches');
          return;
        }
        
        console.log('Popular matches data:', data);
        setMatches(data?.matches || []);
      } catch (err) {
        console.error('Error fetching popular matches:', err);
        setError('Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularMatches();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchPopularMatches, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Group matches by sport for filtering
  const sportFilters = useMemo(() => {
    const sports = new Set(matches.map(m => m.sport));
    return Array.from(sports);
  }, [matches]);

  if (loading) {
    return (
      <section className="mb-8">
        <SectionHeader title="Selected Matches" />
        <PopularMatchesSkeleton />
      </section>
    );
  }

  if (error || matches.length === 0) {
    return null; // Don't show section if no matches
  }

  return (
    <section className="mb-8">
      <SectionHeader 
        title="Selected Matches" 
        seeAllLink="/schedule" 
        seeAllText="VIEW SCHEDULE"
      />
      <p className="text-muted-foreground text-sm mb-4">
        {matches.length} upcoming matches from top leagues worldwide
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {matches.map(match => (
          <PopularMatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
};

export default PopularMatchesSection;
