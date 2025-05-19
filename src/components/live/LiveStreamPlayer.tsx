
import React from 'react';
import { Match, Stream, Source } from '../../types/sports';
import StreamPlayer from '../StreamPlayer';
import { useToast } from '../../hooks/use-toast';
import { Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { fetchStream } from '../../api/sportsApi';

interface LiveStreamPlayerProps {
  featuredMatch: Match | null;
  currentStream: Stream | null;
  streamLoading: boolean;
  activeSource: string | null;
  setActiveSource: (source: string) => void;
  setCurrentStream: (stream: Stream | null) => void;
}

const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({
  featuredMatch,
  currentStream,
  streamLoading,
  activeSource,
  setActiveSource,
  setCurrentStream
}) => {
  const { toast } = useToast();

  // Format match time
  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Function to fetch stream data with improved error handling
  const fetchStreamData = async (source: Source) => {
    setActiveSource(`${source.source}/${source.id}`);
    try {
      console.log(`Fetching stream data: source=${source.source}, id=${source.id}`);
      toast({
        title: "Loading Stream",
        description: `Loading stream from ${source.source}...`,
      });
      
      const stream = await fetchStream(source.source, source.id);
      console.log('Stream data received:', stream);
      
      if (stream.error || !stream.embedUrl) {
        toast({
          title: "Stream Issues",
          description: "This stream source may not be available. Try another source.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Stream Ready",
          description: `Stream from ${source.source} loaded successfully!`,
        });
      }
      
      setCurrentStream(stream);
      
      // Scroll to player if not in view
      const playerElement = document.getElementById('stream-player');
      if (playerElement) {
        playerElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (error) {
      console.error('Error loading stream:', error);
      toast({
        title: "Error",
        description: "Failed to load stream. Please try another source.",
        variant: "destructive",
      });
      setCurrentStream(null);
    }
  };

  // Handle source change for the current match
  const handleSourceChange = (source: string, id: string) => {
    if (featuredMatch) {
      fetchStreamData({ source, id });
    }
  };

  // Handle stream retry
  const handleStreamRetry = () => {
    if (featuredMatch?.sources && featuredMatch.sources.length > 0) {
      fetchStreamData(featuredMatch.sources[0]);
    }
  };

  // Check if a match is currently live
  const isMatchLive = (match: Match): boolean => {
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

  if (!featuredMatch) return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{featuredMatch.title}</h2>
        {streamLoading ? (
          <div className="text-sm text-[#fa2d04] flex items-center gap-1">
            <span className="inline-block h-2 w-2 bg-[#fa2d04] rounded-full animate-pulse"></span>
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
        onRetry={handleStreamRetry} 
      />
      
      {/* Stream Sources with improved UI */}
      {featuredMatch.sources && featuredMatch.sources.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-4 text-white">Stream Sources</h3>
          <div className="flex flex-wrap gap-3">
            {featuredMatch.sources.map(({ source, id }) => (
              <Button
                key={`${source}-${id}`}
                variant={activeSource === `${source}/${id}` ? "default" : "outline"}
                size="sm"
                className={`${
                  activeSource === `${source}/${id}` 
                    ? 'bg-[#343a4d] border-[#fa2d04] text-white' 
                    : 'bg-[#242836] border-[#343a4d] text-gray-300'
                } hover:bg-[#343a4d] hover:text-white transition-colors`}
                onClick={() => handleSourceChange(source, id)}
              >
                {source.charAt(0).toUpperCase() + source.slice(1)} {id}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamPlayer;
