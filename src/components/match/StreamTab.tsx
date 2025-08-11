import { Card, CardContent } from '@/components/ui/card';
import StreamPlayer from '@/components/StreamPlayer';
import StreamSources from './StreamSources';
import PopularMatches from '@/components/PopularMatches';
import { Match as MatchType, Stream } from '@/types/sports';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { fetchStream } from '@/api/sportsApi';
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

  return (
    <div>
      <StreamPlayer
        stream={stream}
        isLoading={loadingStream}
        onRetry={handleRetry}
        title={match.title}
        isManualChannel={false}
        isTvChannel={false}
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
      
      {sortedPopularMatches.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔥</span>
            <h3 className="text-xl font-bold text-white">Trending Matches</h3>
            <span className="bg-white/10 text-white text-xs px-2 py-1 rounded-full">
              {sortedPopularMatches.length} match{sortedPopularMatches.length > 1 ? 'es' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedPopularMatches.slice(0, 4).map((trendingMatch) => {
              const matchTime = typeof trendingMatch.date === 'number' ? trendingMatch.date : new Date(trendingMatch.date).getTime();
              const isLive = Date.now() - matchTime < 3 * 60 * 60 * 1000 && matchTime - Date.now() < 60 * 60 * 1000;
              
              return (
                <Link 
                  key={trendingMatch.id} 
                  to={`/match/${sportId}/${trendingMatch.id}`}
                  className="bg-gradient-to-br from-[#242836] to-[#1a1f2e] border border-[#343a4d] rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-300 hover:border-[#ff5a36]/30"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        {isLive ? (
                          <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            LIVE
                          </div>
                        ) : (
                          <div className="text-xs text-[#ff5a36] font-medium">
                            {formatMatchTime(matchTime)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(matchTime).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      {trendingMatch.teams?.home && trendingMatch.teams?.away ? (
                        <>
                          <div className="text-white text-sm font-medium text-center flex-1">
                            {trendingMatch.teams.home.name.replace(/([a-z])([A-Z][a-z])/g, '$1 $2')}
                          </div>
                          <div className="text-white text-xs font-bold mx-3">VS</div>
                          <div className="text-white text-sm font-medium text-center flex-1">
                            {trendingMatch.teams.away.name.replace(/([a-z])([A-Z][a-z])/g, '$1 $2')}
                          </div>
                        </>
                      ) : (
                        <div className="text-white text-sm font-medium">
                          {trendingMatch.title.replace(/([a-z])([A-Z][a-z])/g, '$1 $2')}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-400">
                        <span className="text-xs">▶</span>
                        <span className="text-xs">
                          {trendingMatch.sources?.length || 0} stream{(trendingMatch.sources?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs text-[#ff5a36] font-medium">
                        {isTrendingMatch(trendingMatch.title).score >= 8 ? 
                          '🔥 Hot' : 
                          '📈 Trending'}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      
      {sortedPopularMatches.length === 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔥</span>
            <h3 className="text-xl font-bold text-white">Trending Matches</h3>
          </div>
          <Card className="bg-[#242836] border-[#343a4d]">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">No trending matches available at this time.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StreamTab;
