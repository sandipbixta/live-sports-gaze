import { Card, CardContent } from '@/components/ui/card';
import StreamPlayer from '@/components/StreamPlayer';
import StreamSources from './StreamSources';
import PopularMatches from '@/components/PopularMatches';
import { Match as MatchType, Stream } from '@/types/sports';

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
      
      {!stream && !loadingStream && (
        <Card className="bg-sports-card border-sports mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-gray-400">Stream will be available closer to match time.</p>
          </CardContent>
        </Card>
      )}
      
      {/* Popular Matches Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-white">More {match.title.split('-')[0].trim()} Matches</h3>
        {popularMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <PopularMatches 
              popularMatches={popularMatches} 
              selectedSport={sportId} 
            />
          </div>
        ) : (
          <Card className="bg-sports-card border-sports">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">No related matches available at this time.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StreamTab;
