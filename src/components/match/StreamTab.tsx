
import { Card, CardContent } from '@/components/ui/card';
import StreamPlayer from '@/components/StreamPlayer';
import StreamSources from './StreamSources';
import PopularMatches from '@/components/PopularMatches';
import { Match as MatchType, Stream } from '@/types/sports';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface StreamTabProps {
  match: MatchType;
  stream: Stream | null;
  loadingStream: boolean;
  activeSource: string | null;
  handleSourceChange: (source: string, id: string) => void;
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

  // Check if stream has error
  const hasStreamError = stream?.id === "error";

  return (
    <div>
      <StreamPlayer
        stream={stream}
        isLoading={loadingStream}
      />
      
      {/* Stream Sources */}
      <StreamSources
        sources={match.sources}
        activeSource={activeSource}
        onSourceChange={handleSourceChange}
        streamId={streamId}
      />
      
      {/* Stream Error Message */}
      {hasStreamError && !loadingStream && (
        <Card className="bg-sports-card border-sports mt-6">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <p className="text-gray-400">Stream error. Please try another source.</p>
          </CardContent>
        </Card>
      )}
      
      {/* No Stream Available Message */}
      {!stream && !loadingStream && !hasStreamError && (
        <Card className="bg-sports-card border-sports mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">Stream will be available closer to match time.</p>
          </CardContent>
        </Card>
      )}
      
      {/* Popular Matches Section */}
      {popularMatches.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-white">More {match.title.split('-')[0].trim()} Matches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularMatches.map((match) => (
              <Link 
                key={match.id} 
                to={`/match/${sportId}/${match.id}`}
                className="bg-[#242836] border-[#343a4d] rounded-xl overflow-hidden cursor-pointer hover:bg-[#2a2f3f] transition-all"
              >
                <div className="p-4">
                  <h3 className="font-bold mb-2 text-white text-xs truncate">{match.title}</h3>
                  <p className="text-xs text-gray-300">Related Match</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {popularMatches.length === 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-white">More {match.title.split('-')[0].trim()} Matches</h3>
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
