
import { Badge } from '@/components/ui/badge';
import { Source } from '@/types/sports';
import { useState, useEffect } from 'react';
import { fetchStream } from '@/api/sportsApi';
import { Loader } from 'lucide-react';

interface StreamSourcesProps {
  sources: Source[];
  activeSource: string | null;
  onSourceChange: (source: string, id: string, embedUrl?: string) => void;
  streamId: string;
}

interface DetailedStream {
  id: string;
  language: string;
  hd: boolean;
  source: string;
  embedUrl: string;
  streamNo?: number;
}

const StreamSources = ({ 
  sources, 
  activeSource, 
  onSourceChange, 
  streamId 
}: StreamSourcesProps) => {
  const [detailedStreams, setDetailedStreams] = useState<Record<string, DetailedStream[]>>({});
  const [loadingStreams, setLoadingStreams] = useState<Record<string, boolean>>({});

  // Debug logging
  console.log('StreamSources - All sources received:', sources);
  console.log('StreamSources - Number of sources:', sources?.length || 0);

  useEffect(() => {
    const fetchDetailedStreams = async () => {
      if (!sources || sources.length === 0) return;

      // Fetch detailed stream data for each source
      for (const source of sources) {
        const sourceKey = `${source.source}/${source.id}`;
        
        // Skip if already loading or loaded
        if (loadingStreams[sourceKey] || detailedStreams[sourceKey]) continue;

        setLoadingStreams(prev => ({ ...prev, [sourceKey]: true }));

        try {
          console.log(`Fetching detailed streams for ${source.source}/${source.id}`);
          
          const streamData = await fetchStream(source.source, source.id);
          
          let streams: DetailedStream[] = [];
          
          if (Array.isArray(streamData)) {
            streams = streamData.map((stream, index) => ({
              id: `${source.id}-${index}-${stream.language || index}`,
              language: stream.language || `Stream ${index + 1}`,
              hd: stream.hd || false,
              source: source.source,
              embedUrl: stream.embedUrl,
              streamNo: stream.streamNo || index + 1
            }));
          } else if (streamData && streamData.embedUrl) {
            streams = [{
              id: source.id,
              language: streamData.language || 'Default',
              hd: streamData.hd || false,
              source: source.source,
              embedUrl: streamData.embedUrl,
              streamNo: streamData.streamNo || 1
            }];
          }

          console.log(`Found ${streams.length} detailed streams for ${source.source}:`, streams);
          
          setDetailedStreams(prev => ({
            ...prev,
            [sourceKey]: streams
          }));
          
        } catch (error) {
          console.error(`Error fetching detailed streams for ${sourceKey}:`, error);
          setDetailedStreams(prev => ({
            ...prev,
            [sourceKey]: []
          }));
        } finally {
          setLoadingStreams(prev => ({ ...prev, [sourceKey]: false }));
        }
      }
    };

    fetchDetailedStreams();
  }, [sources]);

  if (!sources || sources.length === 0) {
    console.log('StreamSources - No sources available');
    return null;
  }

  // Calculate total available streams
  const totalStreams = Object.values(detailedStreams).reduce((total, streams) => total + streams.length, 0);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-white">
        Stream Sources ({totalStreams > 0 ? totalStreams : sources.length} available)
      </h3>
      
      {/* Display sources with their detailed streams */}
      {sources.map((source) => {
        const sourceKey = `${source.source}/${source.id}`;
        const isLoading = loadingStreams[sourceKey];
        const streams = detailedStreams[sourceKey] || [];
        
        return (
          <div key={sourceKey} className="mb-4">
            <h4 className="text-md font-semibold mb-2 text-gray-300 first-letter:uppercase">
              {source.source} 
              {isLoading && <Loader className="inline-block ml-2 h-4 w-4 animate-spin" />}
              {!isLoading && streams.length > 0 && ` (${streams.length} streams)`}
            </h4>
            
            <div className="flex flex-wrap gap-3">
              {isLoading ? (
                <Badge variant="secondary" className="cursor-not-allowed opacity-50">
                  Loading streams...
                </Badge>
              ) : streams.length > 0 ? (
                streams.map((stream) => {
                  const streamKey = `${stream.source}/${stream.id}`;
                  return (
                    <Badge
                      key={streamKey}
                      variant="source"
                      className={`cursor-pointer text-sm py-2 px-4 ${
                        activeSource === streamKey 
                          ? 'bg-[#343a4d] border-[#9b87f5]' 
                          : ''
                      }`}
                      onClick={() => {
                        console.log(`Clicking stream: ${stream.language} with URL: ${stream.embedUrl}`);
                        onSourceChange(stream.source, stream.id, stream.embedUrl);
                      }}
                    >
                      {stream.language}
                      {stream.hd && <span className="ml-1 text-xs">HD</span>}
                    </Badge>
                  );
                })
              ) : (
                <Badge
                  variant="source"
                  className={`cursor-pointer text-sm py-2 px-4 ${
                    activeSource === sourceKey 
                      ? 'bg-[#343a4d] border-[#9b87f5]' 
                      : ''
                  }`}
                  onClick={() => onSourceChange(source.source, source.id)}
                >
                  {source.source} - {source.id}
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StreamSources;
