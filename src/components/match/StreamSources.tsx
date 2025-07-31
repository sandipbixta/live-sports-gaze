
import { Badge } from '@/components/ui/badge';
import { Source, Stream } from '@/types/sports';
import { useState, useEffect } from 'react';
import { fetchStream } from '@/api/sportsApi';
import { Loader, Play } from 'lucide-react';

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
  const [allStreams, setAllStreams] = useState<Record<string, Stream[]>>({});
  const [loadingStreams, setLoadingStreams] = useState<Record<string, boolean>>({});

  // Fetch all available streams for each source
  useEffect(() => {
    const fetchAllStreams = async () => {
      if (!sources || sources.length === 0) return;

      for (const source of sources) {
        const sourceKey = `${source.source}/${source.id}`;
        
        if (allStreams[sourceKey]) continue; // Already fetched
        
        setLoadingStreams(prev => ({ ...prev, [sourceKey]: true }));
        
        try {
          console.log(`Fetching all streams for: ${source.source}/${source.id}`);
          const streamData = await fetchStream(source.source, source.id);
          
          let streams: Stream[] = [];
          
          if (Array.isArray(streamData)) {
            // API returned multiple streams
            streams = streamData.filter(stream => 
              stream.embedUrl && 
              stream.embedUrl.startsWith('http') &&
              !stream.embedUrl.includes('youtube.com') &&
              !stream.embedUrl.includes('demo')
            );
          } else if (streamData && typeof streamData === 'object' && streamData.embedUrl) {
            // API returned single stream
            if (streamData.embedUrl.startsWith('http') && 
                !streamData.embedUrl.includes('youtube.com') &&
                !streamData.embedUrl.includes('demo')) {
              streams = [streamData];
            }
          }
          
          console.log(`Found ${streams.length} valid streams for ${sourceKey}:`, streams);
          
          setAllStreams(prev => ({
            ...prev,
            [sourceKey]: streams
          }));
        } catch (error) {
          console.error(`Failed to fetch streams for ${sourceKey}:`, error);
          setAllStreams(prev => ({
            ...prev,
            [sourceKey]: []
          }));
        } finally {
          setLoadingStreams(prev => ({ ...prev, [sourceKey]: false }));
        }
      }
    };

    fetchAllStreams();
  }, [sources]);

  if (!sources || sources.length === 0) {
    return null;
  }

  // Group sources by source name and consolidate their streams
  const consolidatedSources = sources.reduce((groups: Record<string, { sources: Source[], allStreams: Stream[] }>, source) => {
    const groupName = source.source;
    if (!groups[groupName]) {
      groups[groupName] = { sources: [], allStreams: [] };
    }
    groups[groupName].sources.push(source);
    
    // Add streams from this source to the consolidated list
    const sourceKey = `${source.source}/${source.id}`;
    const sourceStreams = allStreams[sourceKey] || [];
    
    // Only add streams that aren't already in the consolidated list
    sourceStreams.forEach(stream => {
      const streamExists = groups[groupName].allStreams.some(existing => 
        existing.embedUrl === stream.embedUrl
      );
      if (!streamExists) {
        groups[groupName].allStreams.push(stream);
      }
    });
    
    return groups;
  }, {});

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-white">Stream Sources</h3>
      
      {Object.entries(consolidatedSources).map(([groupName, { sources: groupSources, allStreams: consolidatedStreams }]) => {
        const isLoading = groupSources.some(source => loadingStreams[`${source.source}/${source.id}`]);
        
        return (
          <div key={groupName} className="mb-6">
            <h4 className="text-md font-semibold mb-3 text-gray-300 capitalize">{groupName}</h4>
            
            <div className="bg-[#1a1f2e] rounded-lg p-4 border border-[#343a4d]">
              {isLoading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading streams...</span>
                </div>
              ) : consolidatedStreams.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 mb-2">
                    {consolidatedStreams.length} stream{consolidatedStreams.length > 1 ? 's' : ''} available
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {consolidatedStreams.map((stream, index) => {
                      const streamKey = `${stream.source}/${stream.id}/${stream.streamNo || index}`;
                      const isActive = activeSource === streamKey;
                      
                      return (
                        <Badge
                          key={streamKey}
                          variant="source"
                          className={`cursor-pointer p-3 text-left transition-all hover:scale-105 ${
                            isActive 
                              ? 'bg-[#ff5a36] border-[#ff5a36] text-white' 
                              : 'bg-[#242836] border-[#343a4d] text-gray-300 hover:bg-[#343a4d]'
                          }`}
                          onClick={() => onSourceChange(stream.source, stream.id, stream.streamNo || index)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Play size={12} />
                                <span className="font-medium">
                                  Stream {stream.streamNo || (index + 1)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="capitalize">{stream.language || 'English'}</span>
                                {stream.hd && (
                                  <span className="bg-[#ff5a36] text-white px-1 rounded text-xs font-bold">
                                    HD
                                  </span>
                                )}
                              </div>
                            </div>
                            {isActive && (
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            )}
                          </div>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">No streams available for this source</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
      
      {Object.keys(allStreams).length === 0 && !Object.values(loadingStreams).some(Boolean) && (
        <div className="text-center py-8">
          <p className="text-gray-400">No stream sources available for this match.</p>
        </div>
      )}
    </div>
  );
};

export default StreamSources;
