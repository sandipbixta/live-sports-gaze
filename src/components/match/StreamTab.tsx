import React, { useEffect, useState } from 'react';
import { Clock, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import StreamPlayer from '@/components/StreamPlayer';
import StreamSources from './StreamSources';
import MatchCard from '@/components/MatchCard';
import Advertisement from '@/components/Advertisement';
import MatchDetails from '@/components/MatchDetails';
import { Match as MatchType, Stream } from '@/types/sports';
import { ViewerCount } from '@/components/ViewerCount';

import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { isTrendingMatch } from '@/utils/popularLeagues';
import { useAutoFallback } from '@/hooks/useAutoFallback';

interface StreamTabProps {
  match: MatchType;
  stream: Stream | null;
  loadingStream: boolean;
  activeSource: string | null;
  handleSourceChange: (source: string, id: string, streamNo?: number) => void;
  popularMatches: MatchType[];
  sportId: string;
  allStreams?: Record<string, Stream[]>; // Add allStreams prop
}

const StreamTab = ({ 
  match, 
  stream, 
  loadingStream, 
  activeSource, 
  handleSourceChange, 
  popularMatches, 
  sportId,
  allStreams = {}
}: StreamTabProps) => {
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [currentStreamViewers, setCurrentStreamViewers] = useState<number>(0);
  
  // Auto-fallback hook
  const { tryNextSource, isAutoRetrying, attemptedSourcesCount, totalSourcesCount } = useAutoFallback({
    allStreams,
    onSourceChange: handleSourceChange,
    currentStream: stream
  });
  
  const getStreamId = () => {
    return match?.sources?.length > 0 ? match.sources[0].id : match.id;
  };
  
  const streamId = getStreamId();
  
  useEffect(() => {
    console.log('Match sources:', match.sources);
    console.log('Active source:', activeSource);
    console.log('Current stream:', stream);
  }, [match.sources, activeSource, stream]);

  const handleRetry = async () => {
    if (!activeSource) return;
    
    const parts = activeSource.split('/');
    const [source, id, streamNo] = parts;
    
    if (source && id) {
      setRetryCount(prev => prev + 1);
      
      toast({
        title: "Retrying stream",
        description: "Attempting to reconnect to the stream...",
      });
      
      handleSourceChange(source, id, streamNo ? parseInt(streamNo) : undefined);
    } else {
      if (match.sources && match.sources.length > 0) {
        const { source, id } = match.sources[0];
        setRetryCount(prev => prev + 1);
        
        toast({
          title: "Trying another source",
          description: "Attempting to connect to a different stream source...",
        });
        
        handleSourceChange(source, id);
      }
    }
  };
  
  // Auto-fallback handler
  const handleAutoFallback = () => {
    const hasNextSource = tryNextSource();
    
    if (hasNextSource) {
      toast({
        title: "Switching source automatically",
        description: `Trying alternative source (${attemptedSourcesCount}/${totalSourcesCount})`,
      });
    } else {
      toast({
        title: "All sources attempted",
        description: "No more stream sources available. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const formatMatchTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const isMatchLive = (): boolean => {
    const matchTime = typeof match.date === 'number' ? match.date : new Date(match.date).getTime();
    const now = new Date().getTime();
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    const oneHourInMs = 60 * 60 * 1000;
    
    return (
      match.sources && 
      match.sources.length > 0 && 
      matchTime - now < oneHourInMs &&
      now - matchTime < threeHoursInMs
    );
  };

  // Fetch viewer count for current active stream
  useEffect(() => {
    const fetchCurrentViewers = async () => {
      if (!activeSource) return;
      
      const parts = activeSource.split('/');
      const [source, id] = parts;
      
      if (source && id) {
        try {
          const response = await fetch(`https://streamed.pk/api/stream/${source}/${id}`, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000)
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Sum up all viewers from this source
            if (Array.isArray(data)) {
              const total = data.reduce((sum: number, stream: any) => sum + (stream.viewers || 0), 0);
              setCurrentStreamViewers(total);
            }
          }
        } catch (error) {
          console.error('Failed to fetch viewer count:', error);
        }
      }
    };

    fetchCurrentViewers();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCurrentViewers, 30000);
    return () => clearInterval(interval);
  }, [activeSource]);

  const sortedPopularMatches = [...popularMatches].sort((a, b) => {
    const aTrending = isTrendingMatch(a.title);
    const bTrending = isTrendingMatch(b.title);
    return bTrending.score - aTrending.score;
  });

  return (
    <div>
      <StreamPlayer
        stream={stream}
        isLoading={loadingStream || isAutoRetrying}
        onRetry={handleRetry}
        onAutoFallback={handleAutoFallback}
        title={match.title}
        isManualChannel={false}
        isTvChannel={false}
        isTheaterMode={isTheaterMode}
        onTheaterModeToggle={() => setIsTheaterMode(!isTheaterMode)}
        match={match}
        allStreams={allStreams}
        showMatchDetails={false}
      />
      
      <StreamSources
        sources={match.sources}
        activeSource={activeSource}
        onSourceChange={handleSourceChange}
        streamId={streamId}
        allStreams={allStreams}
        currentStreamViewers={currentStreamViewers}
        isLive={isMatchLive()}
      />
      
      {!loadingStream && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-3">
            {isMatchLive() ? (
              <Badge variant="live" className="flex items-center gap-1.5 px-3 py-1">
                <span className="h-2 w-2 bg-white rounded-full animate-pulse"></span>
                LIVE NOW
              </Badge>
            ) : (
              <Badge variant="info" className="flex items-center gap-1.5 px-3 py-1 text-white">
                <Clock size={14} />
                Starts at {formatMatchTime(match.date)}
              </Badge>
            )}
            
            {/* Viewer count removed - only show in match cards */}
          </div>
        </div>
      )}
      
      {!stream && !loadingStream && (
        <Card className="bg-sports-card border-sports mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">Stream will be available closer to match time.</p>
          </CardContent>
        </Card>
      )}
      
      {/* Hide trending matches in theater mode or show them normally */}
      {!isTheaterMode && sortedPopularMatches.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔥</span>
            <h3 className="text-xl font-bold text-foreground">Trending Matches</h3>
            <span className="text-xs px-2 py-1 rounded-lg bg-card text-muted-foreground border border-border">
              {Math.min(sortedPopularMatches.length, 5)} matches
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {sortedPopularMatches.slice(0, 5).map((m, index) => (
              <MatchCard
                key={`streamtab-trending-${m.id}-${index}`}
                match={m}
                sportId={sportId}
                isPriority
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Match Details at Bottom */}
      {!isTheaterMode && (
        <div className="mt-8 px-4">
          <MatchDetails 
            match={match}
            isLive={isMatchLive()}
            showCompact={false}
          />
        </div>
      )}
      
    </div>
  );
};

export default StreamTab;
