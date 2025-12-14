import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity } from 'lucide-react';

interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: string | null;
  awayScore: string | null;
  progress: string | null;
  league: string;
  isLive: boolean;
}

const LiveScoresTicker: React.FC = () => {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('fetch-popular-matches');
        
        if (error) {
          console.error('Error fetching live matches for ticker:', error);
          return;
        }

        if (data?.matches) {
          const live = data.matches
            .filter((m: any) => {
              const homeScore = m.score?.home || m.homeScore;
              const awayScore = m.score?.away || m.awayScore;
              return m.isLive && homeScore !== undefined && awayScore !== undefined;
            })
            .map((m: any) => ({
              id: m.id || `${m.teams?.home?.name || m.homeTeam}-${m.teams?.away?.name || m.awayTeam}`,
              homeTeam: m.teams?.home?.name || m.homeTeam || 'Home',
              awayTeam: m.teams?.away?.name || m.awayTeam || 'Away',
              homeScore: m.score?.home || m.homeScore,
              awayScore: m.score?.away || m.awayScore,
              progress: m.progress,
              league: m.tournament || m.league || m.category || 'Live',
              isLive: true
            }));
          setLiveMatches(live);
        }
      } catch (error) {
        console.error('Failed to fetch live matches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveMatches();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchLiveMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || liveMatches.length === 0) {
    return null;
  }

  // Duplicate matches for seamless infinite scroll
  const duplicatedMatches = [...liveMatches, ...liveMatches];

  return (
    <div className="w-full bg-black/90 backdrop-blur-sm border-b border-border/30 overflow-hidden">
      <div className="flex items-center">
        {/* Fixed Label */}
        <div className="flex-shrink-0 bg-red-600 px-3 py-2 flex items-center gap-2 z-10">
          <Activity className="w-4 h-4 text-white animate-pulse" />
          <span className="text-white text-xs font-bold uppercase tracking-wide">Live</span>
        </div>
        
        {/* Scrolling Ticker */}
        <div className="flex-1 overflow-hidden relative group">
          <div 
            ref={tickerRef}
            className="flex animate-ticker whitespace-nowrap group-hover:[animation-play-state:paused]"
            style={{
              animationDuration: `${duplicatedMatches.length * 2}s`
            }}
          >
            {duplicatedMatches.map((match, index) => (
              <div 
                key={`${match.id}-${index}`}
                className="flex items-center px-4 py-2 border-r border-border/20"
              >
                {/* League */}
                <span className="text-muted-foreground text-[10px] uppercase mr-3">
                  {match.league}
                </span>
                
                {/* Home Team */}
                <span className="text-white text-xs font-medium truncate max-w-[100px]">
                  {match.homeTeam}
                </span>
                
                {/* Score */}
                <div className="mx-2 bg-primary/20 px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="text-white font-bold text-sm tabular-nums">
                    {match.homeScore}
                  </span>
                  <span className="text-muted-foreground text-xs">-</span>
                  <span className="text-white font-bold text-sm tabular-nums">
                    {match.awayScore}
                  </span>
                </div>
                
                {/* Away Team */}
                <span className="text-white text-xs font-medium truncate max-w-[100px]">
                  {match.awayTeam}
                </span>
                
                {/* Progress */}
                {match.progress && (
                  <span className="ml-2 text-red-400 text-[10px] font-bold">
                    {match.progress}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScoresTicker;
