import { Card, CardContent } from '@/components/ui/card';
import StreamPlayer from '@/components/StreamPlayer';
import StreamSources from './StreamSources';
import MatchCard from '@/components/MatchCard';
import { Match as MatchType, Stream } from '@/types/sports';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { isTrendingMatch } from '@/utils/popularLeagues';

interface StreamTabProps {
  match: MatchType;
  stream: Stream | null;
  loadingStream: boolean;
  activeSource: string | null;
  handleSourceChange: (source: string, id: string, streamNo?: number) => void;
  popularMatches: MatchType[];
  trendingMatches: MatchType[];
  sportId: string;
  isTheaterMode: boolean;
  setIsTheaterMode: (mode: boolean) => void;
}

const StreamTab = ({ 
  match, 
  stream, 
  loadingStream, 
  activeSource, 
  handleSourceChange, 
  popularMatches,
  trendingMatches,
  sportId,
  isTheaterMode,
  setIsTheaterMode
}: StreamTabProps) => {
  const { toast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  
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

  // Use trending matches for sidebar, they have better data
  const sidebarMatches = trendingMatches.length > 0 ? trendingMatches : popularMatches;
  const sortedSidebarMatches = [...sidebarMatches].sort((a, b) => {
    const aTrending = isTrendingMatch(a.title);
    const bTrending = isTrendingMatch(b.title);
    return bTrending.score - aTrending.score;
  });

  return (
    <div className={isTheaterMode ? "space-y-6" : "grid grid-cols-1 lg:grid-cols-3 gap-6"}>
      {/* Video Player Section */}
      <div className={isTheaterMode ? "w-full" : "lg:col-span-2"}>
        <StreamPlayer
          stream={stream}
          isLoading={loadingStream}
          onRetry={handleRetry}
          title={match.title}
          isManualChannel={false}
          isTvChannel={false}
          isTheaterMode={isTheaterMode}
          setIsTheaterMode={setIsTheaterMode}
        />
        
        <StreamSources
          sources={match.sources}
          activeSource={activeSource}
          onSourceChange={handleSourceChange}
          streamId={streamId}
        />
        
        {!loadingStream && (
          <div className="flex justify-center mt-4">
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
          </div>
        )}
        
        {!stream && !loadingStream && (
          <Card className="bg-sports-card border-sports mt-6">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">Stream will be available closer to match time.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trending Matches Section */}
      <div className={isTheaterMode ? "w-full mt-8" : "lg:col-span-1"}>
        {sortedSidebarMatches.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔥</span>
              <h3 className="text-lg font-bold text-foreground">Trending</h3>
              <span className="text-xs px-2 py-1 rounded-lg bg-card text-muted-foreground border border-border">
                {Math.min(sortedSidebarMatches.length, 8)} matches
              </span>
            </div>
            <div className={isTheaterMode ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4" : "space-y-3"}>
              {sortedSidebarMatches.slice(0, isTheaterMode ? 12 : 8).map((m, index) => (
                <MatchCard
                  key={`sidebar-trending-${m.id}-${index}`}
                  match={m}
                  sportId={sportId}
                  isPriority
                  className="transform hover:scale-102 transition-transform"
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔥</span>
              <h3 className="text-lg font-bold text-white">Trending</h3>
            </div>
            <Card className="bg-sports-card border-sports">
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground text-sm">No trending matches available.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamTab;
