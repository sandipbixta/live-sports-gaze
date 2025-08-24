import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import StreamPlayer from '@/components/StreamPlayer';
import StreamSources from './StreamSources';
import MatchCard from '@/components/MatchCard';
import Advertisement from '@/components/Advertisement';
import { Match as MatchType, Stream } from '@/types/sports';

import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { isTrendingMatch } from '@/utils/popularLeagues';
import { useViewerTracking } from '@/hooks/useViewerTracking';
import ViewerCounter from '@/components/ViewerCounter';

interface StreamTabProps {
  match: MatchType;
  stream: Stream | null;
  loadingStream: boolean;
  activeSource: string | null;
  handleSourceChange: (source: string, id: string, streamNo?: number) => void;
  popularMatches: MatchType[];
  sportId: string;
}

const StreamTab = ({ 
  match, 
  stream, 
  loadingStream, 
  activeSource, 
  handleSourceChange, 
  popularMatches,
  sportId 
}: StreamTabProps) => {
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  
  // Real-time viewer tracking
  const { viewerCount, isTracking, startTracking, stopTracking } = useViewerTracking(match?.id || null);
  
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

  const sortedPopularMatches = [...popularMatches].sort((a, b) => {
    const aTrending = isTrendingMatch(a.title);
    const bTrending = isTrendingMatch(b.title);
    return bTrending.score - aTrending.score;
  });

  // Start/stop viewer tracking based on stream availability
  useEffect(() => {
    if (stream && match && !loadingStream) {
      startTracking();
    } else {
      stopTracking();
    }
    
    return () => {
      stopTracking();
    };
  }, [stream, match, loadingStream]);

  return (
    <div>
      <StreamPlayer
        stream={stream}
        isLoading={loadingStream}
        onRetry={handleRetry}
        title={match.title}
        isManualChannel={false}
        isTvChannel={false}
        isTheaterMode={isTheaterMode}
        onTheaterModeToggle={() => setIsTheaterMode(!isTheaterMode)}
        viewerCount={viewerCount}
        isLive={isMatchLive()}
        showViewerCounter={false}
      />
      
      <StreamSources
        sources={match.sources}
        activeSource={activeSource}
        onSourceChange={handleSourceChange}
        streamId={streamId}
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
      
    </div>
  );
};

export default StreamTab;
