
import { Badge } from '@/components/ui/badge';
import { Source, Stream } from '@/types/sports';
import { useState, useEffect } from 'react';
import { fetchStream } from '@/api/sportsApi';
import { Loader, Tv } from 'lucide-react';

interface StreamSourcesProps {
  sources: Source[];
  activeSource: string | null;
  onSourceChange: (source: string, id: string, streamNo?: number) => void;
  streamId: string;
}

const StreamSources = ({ 
  sources, 
  activeSource, 
  onSourceChange, 
  streamId 
}: StreamSourcesProps) => {
  const [subStreams, setSubStreams] = useState<Record<string, Stream[]>>({});
  const [loadingSubStreams, setLoadingSubStreams] = useState<Record<string, boolean>>({});

  // Separate sources by type
  const apiSources = sources.filter(source => source.source !== 'manual-channel');
  const channelSources = sources.filter(source => source.source === 'manual-channel');

  // Fetch sub-streams for each API source
  useEffect(() => {
    const fetchSubStreams = async () => {
      for (const source of apiSources) {
        const sourceKey = `${source.source}/${source.id}`;
        
        if (subStreams[sourceKey]) continue; // Already fetched
        
        setLoadingSubStreams(prev => ({ ...prev, [sourceKey]: true }));
        
        try {
          console.log(`Fetching sub-streams for: ${source.source}/${source.id}`);
          const streamData = await fetchStream(source.source, source.id);
          
          // If we get an array of streams, use them directly
          // If we get a single stream, check if there are multiple streamNo variants
          let streams: Stream[] = [];
          
          if (Array.isArray(streamData)) {
            streams = streamData;
          } else {
            // For single stream response, we'll display it as is
            streams = [streamData];
          }
          
          setSubStreams(prev => ({
            ...prev,
            [sourceKey]: streams
          }));
        } catch (error) {
          console.error(`Failed to fetch sub-streams for ${sourceKey}:`, error);
          setSubStreams(prev => ({
            ...prev,
            [sourceKey]: []
          }));
        } finally {
          setLoadingSubStreams(prev => ({ ...prev, [sourceKey]: false }));
        }
      }
    };

    if (apiSources && apiSources.length > 0) {
      fetchSubStreams();
    }
  }, [apiSources]);

  if (!sources || sources.length === 0) {
    return null;
  }

  // Group API sources by source name to organize different languages/qualities
  const groupedApiSources = apiSources.reduce((groups: Record<string, Source[]>, source) => {
    const groupName = source.source;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(source);
    return groups;
  }, {});

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-white">Stream Sources</h3>
      
      {/* Manual Channel Sources - Show these first as they're more reliable */}
      {channelSources.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-300 flex items-center gap-2">
            <Tv className="h-4 w-4" />
            TV Channel Sources
          </h4>
          <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#343a4d]">
            <div className="flex flex-wrap gap-2">
              {channelSources.map((source) => (
                <Badge
                  key={`${source.source}-${source.id}`}
                  variant="source"
                  className={`cursor-pointer text-sm py-2 px-4 ${
                    activeSource === `${source.source}/${source.id}` 
                      ? 'bg-[#343a4d] border-[#9b87f5]' 
                      : ''
                  }`}
                  onClick={() => onSourceChange(source.source, source.id)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>📺 {source.id.replace(/-/g, ' ').toUpperCase()}</span>
                    <span className="text-xs text-gray-400">Live TV Channel</span>
                  </div>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              ℹ️ These will open the live TV channel player in a new page
            </p>
          </div>
        </div>
      )}
      
      {/* API Stream Sources */}
      {Object.keys(groupedApiSources).length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-300">Live Stream Sources</h4>
          
          {Object.entries(groupedApiSources).map(([groupName, groupSources]) => (
            <div key={groupName} className="mb-4">
              <h5 className="text-sm font-medium mb-2 text-gray-400 first-letter:uppercase">{groupName}</h5>
              
              {groupSources.map((source) => {
                const sourceKey = `${source.source}/${source.id}`;
                const streams = subStreams[sourceKey] || [];
                const isLoading = loadingSubStreams[sourceKey];
                
                return (
                  <div key={sourceKey} className="mb-4 bg-[#1a1f2e] rounded-lg p-4 border border-[#343a4d]">
                    <div className="flex flex-wrap gap-2">
                      {isLoading ? (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Loader className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Loading streams...</span>
                        </div>
                      ) : streams.length > 0 ? (
                        streams.map((stream) => (
                          <Badge
                            key={`${stream.source}-${stream.id}-${stream.streamNo}`}
                            variant="source"
                            className={`cursor-pointer text-sm py-2 px-4 ${
                              activeSource === `${stream.source}/${stream.id}/${stream.streamNo}` 
                                ? 'bg-[#343a4d] border-[#9b87f5]' 
                                : ''
                            }`}
                            onClick={() => onSourceChange(stream.source, stream.id, stream.streamNo)}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span>Stream {stream.streamNo}</span>
                              <div className="flex items-center gap-1 text-xs">
                                <span>{stream.language}</span>
                                {stream.hd && (
                                  <span className="bg-[#ff5a36] text-white px-1 rounded text-xs">HD</span>
                                )}
                              </div>
                            </div>
                          </Badge>
                        ))
                      ) : (
                        <Badge
                          variant="source"
                          className={`cursor-pointer text-sm py-2 px-4 ${
                            activeSource === `${source.source}/${source.id}` 
                              ? 'bg-[#343a4d] border-[#9b87f5]' 
                              : ''
                          }`}
                          onClick={() => onSourceChange(source.source, source.id)}
                        >
                          {source.id}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StreamSources;
