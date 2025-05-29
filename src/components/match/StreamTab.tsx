
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
  
  // Function to generate stream ID from match ID if needed
  const getStreamId = () => {
    return match?.sources?.length > 0 ? match.sources[0].id : match.id;
  };
  
  const streamId = getStreamId();
  
  // Logging for debugging
  useEffect(() => {
    console.log('Match sources:', match.sources);
    console.log('Active source:', activeSource);
    console.log('Current stream:', stream);
  }, [match.sources, activeSource, stream]);

  // Handle retry function
  const handleRetry = async () => {
    if (!activeSource) return;
    
    // Parse source, id, and streamNo from activeSource string
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
      // If we can't get source/id from activeSource, try the first available source
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

  // Format match time to display time
  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  // Helper function to determine if a match is likely live
  const isMatchLive = (): boolean => {
    // A match is considered live if it has sources AND the match time is within 2 hours of now
    const matchTime = new Date(match.date).getTime();
    const now = new Date().getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    
    return (
      match.sources && 
      match.sources.length > 0 && 
      Math.abs(matchTime - now) < twoHoursInMs
    );
  };

  // Sort related matches by trending score
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
      />
      
      {/* Stream Sources */}
      <StreamSources
        sources={match.sources}
        activeSource={activeSource}
        onSourceChange={handleSourceChange}
        streamId={streamId}
      />
      
      {/* Match status - Live or Upcoming */}
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
      
      {/* No Stream Available Message */}
      {!stream && !loadingStream && (
        <Card className="bg-sports-card border-sports mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">Stream will be available closer to match time.</p>
          </CardContent>
        </Card>
      )}
      
      {/* Popular Matches Section - Now using trending data */}
      {sortedPopularMatches.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-white">Trending {match.title.split('-')[0].trim()} Matches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPopularMatches.map((match) => (
              <Link 
                key={match.id} 
                to={`/match/${sportId}/${match.id}`}
                className="bg-[#242836] border-[#343a4d] rounded-xl overflow-hidden cursor-pointer hover:bg-[#2a2f3f] transition-all"
              >
                <div className="p-4">
                  <h3 className="font-bold mb-2 text-white text-xs truncate">{match.title}</h3>
                  <p className="text-xs text-gray-300">
                    {isTrendingMatch(match.title).score >= 8 ? 
                      '🔥 Highly Trending' : 
                      isTrendingMatch(match.title).score >= 5 ? 
                      '📈 Trending' : 'Related Match'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* No matches message */}
      {sortedPopularMatches.length === 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-white">Trending {match.title.split('-')[0].trim()} Matches</h3>
          <Card className="bg-sports-card border-sports">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">No related matches available at this time.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StreamTab;
