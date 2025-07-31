
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

  // Group sources by source name
  const groupedSources = sources.reduce((groups: Record<string, Source[]>, source) => {
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
      
      {Object.entries(groupedSources).map(([groupName, groupSources]) => (
        <div key={groupName} className="mb-6">
          <h4 className="text-md font-semibold mb-3 text-gray-300 capitalize">{groupName}</h4>
          
          {groupSources.map((source) => {
            const sourceKey = `${source.source}/${source.id}`;
            const streams = allStreams[sourceKey] || [];
            const isLoading = loadingStreams[sourceKey];
            
            return (
              <div key={sourceKey} className="mb-4 bg-[#1a1f2e] rounded-lg p-4 border border-[#343a4d]">
                {isLoading ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading streams...</span>
                  </div>
                ) : streams.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400 mb-2">
                      {streams.length} stream{streams.length > 1 ? 's' : ''} available
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {streams.map((stream, index) => {
                        const streamKey = `${stream.source}/${stream.id}/${stream.streamNo || index}`;
                        const isActive = activeSource === streamKey;
                        
                        // Extract channel name from URL
                        const getChannelName = (embedUrl: string): string => {
                          if (!embedUrl) return `Stream ${stream.streamNo || (index + 1)}`;
                          
                          try {
                            // For TopEmbed URLs like: https://topembed.pw/channel/SkySportsMainEvent[UK]
                            if (embedUrl.includes('/channel/')) {
                              const channelPart = embedUrl.split('/channel/')[1];
                              if (channelPart) {
                                // Remove query parameters and decode
                                const cleanChannelName = channelPart.split('?')[0];
                                // Replace brackets and clean up the name
                                return cleanChannelName
                                  .replace(/\[|\]/g, ' ')
                                  .replace(/([A-Z])/g, ' $1')
                                  .trim()
                                  .replace(/\s+/g, ' ');
                              }
                            }
                            
                            // For other URLs, try to extract domain or meaningful part
                            const url = new URL(embedUrl);
                            const pathParts = url.pathname.split('/').filter(part => part.length > 0);
                            if (pathParts.length > 0) {
                              const lastPart = pathParts[pathParts.length - 1];
                              return lastPart.replace(/[-_]/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                            }
                            
                            return url.hostname.replace('www.', '');
                          } catch {
                            return `Stream ${stream.streamNo || (index + 1)}`;
                          }
                        };
                        
                        const channelName = getChannelName(stream.embedUrl);
                        
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
                                  <span className="font-medium text-sm">
                                    {channelName}
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
            );
          })}
        </div>
      ))}
      
      {Object.keys(allStreams).length === 0 && !Object.values(loadingStreams).some(Boolean) && (
        <div className="text-center py-8">
          <p className="text-gray-400">No stream sources available for this match.</p>
        </div>
      )}
    </div>
  );
};

export default StreamSources;
