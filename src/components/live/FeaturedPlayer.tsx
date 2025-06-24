
import React from 'react';
import { Match, Stream } from '../../types/sports';
import StreamPlayer from '../StreamPlayer';
import StreamSources from '../match/StreamSources';
import { Clock, Tv, Calendar, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';
import { isMatchLive } from '../../utils/matchUtils';

interface FeaturedPlayerProps {
  loading: boolean;
  featuredMatch: Match | null;
  currentStream: Stream | null;
  streamLoading: boolean;
  activeSource: string | null;
  onSourceChange: (source: string, id: string, streamNo?: number) => void;
  onStreamRetry: () => void;
  onRetryLoading: () => void;
}

const FeaturedPlayer: React.FC<FeaturedPlayerProps> = ({
  loading,
  featuredMatch,
  currentStream,
  streamLoading,
  activeSource,
  onSourceChange,
  onStreamRetry,
  onRetryLoading
}) => {
  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="w-full bg-[#242836] rounded-xl p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5] mx-auto"></div>
        <p className="mt-4 text-gray-300">Loading live streams...</p>
      </div>
    );
  }

  if (!featuredMatch) {
    return (
      <div className="w-full bg-[#242836] rounded-xl p-12 text-center">
        <Tv size={48} className="text-[#343a4d] mx-auto mb-4" />
        <p className="text-gray-300 text-lg mb-2">No live streams available at the moment.</p>
        <p className="text-gray-400 text-sm mb-4">Check back later or view scheduled matches.</p>
        <div className="flex gap-4 justify-center mt-2">
          <Button onClick={onRetryLoading} className="bg-[#9b87f5] hover:bg-[#8a75e8]">
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </Button>
          <Link to="/schedule">
            <Button variant="outline" className="bg-transparent border border-[#343a4d]">
              <Calendar size={16} className="mr-2" />
              View Schedule
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{featuredMatch.title}</h2>
        {streamLoading ? (
          <div className="text-sm text-[#9b87f5] flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-[#9b87f5] rounded-full animate-pulse"></span>
            Loading stream...
          </div>
        ) : isMatchLive(featuredMatch) ? (
          <div className="text-sm text-[#fa2d04] flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-[#fa2d04] rounded-full animate-pulse"></span>
            Live now
          </div>
        ) : (
          <div className="text-sm text-[#1EAEDB] flex items-center gap-1">
            <Clock size={14} />
            Starts at {formatMatchTime(featuredMatch.date)}
          </div>
        )}
      </div>
      <StreamPlayer 
        stream={currentStream} 
        isLoading={streamLoading}
        onRetry={onStreamRetry} 
      />
      
      {/* Stream Sources with substreams */}
      {featuredMatch.sources && featuredMatch.sources.length > 0 && (
        <StreamSources
          sources={featuredMatch.sources}
          activeSource={activeSource}
          onSourceChange={onSourceChange}
          streamId={featuredMatch.id}
        />
      )}
    </div>
  );
};

export default FeaturedPlayer;
