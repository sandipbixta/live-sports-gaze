
import { Badge } from '@/components/ui/badge';
import { Source } from '@/types/sports';
import { useState, useEffect } from 'react';
import { fetchStream } from '@/api/sportsApi';
import { Loader, AlertTriangle } from 'lucide-react';

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
  const [streamErrors, setStreamErrors] = useState<Record<string, string>>({});

  console.log('StreamSources - All sources received:', sources);

  useEffect(() => {
    const fetchDetailedStreams = async () => {
      if (!sources || sources.length === 0) return;

      for (const source of sources) {
        const sourceKey = `${source.source}/${source.id}`;
        
        if (loadingStreams[sourceKey] || detailedStreams[sourceKey]) continue;

        setLoadingStreams(prev => ({ ...prev, [sourceKey]: true }));
        setStreamErrors(prev => ({ ...prev, [sourceKey]: '' }));

        try {
          console.log(`Fetching real streams for ${source.source}/${source.id}`);
          
          const streamData = await fetchStream(source.source, source.id);
          
          let streams: DetailedStream[] = [];
          
          if (Array.isArray(streamData)) {
            streams = streamData.map((stream, index) => ({
              id: stream.id,
              language: stream.language || `Stream ${index + 1}`,
              hd: stream.hd || false,
              source: stream.source,
              embedUrl: stream.embedUrl,
              streamNo: stream.streamNo || index + 1
            }));
          } else if (streamData && streamData.embedUrl) {
            streams = [{
              id: streamData.id,
              language: streamData.language || 'Default',
              hd: streamData.hd || false,
              source: streamData.source,
              embedUrl: streamData.embedUrl,
              streamNo: streamData.streamNo || 1
            }];
          }

          console.log(`Found ${streams.length} real streams for ${source.source}:`, streams);
          
          if (streams.length === 0) {
            setStreamErrors(prev => ({ ...prev, [sourceKey]: 'No real streams available' }));
          }
          
          setDetailedStreams(prev => ({
            ...prev,
            [sourceKey]: streams
          }));
          
        } catch (error) {
          console.error(`Error fetching streams for ${sourceKey}:`, error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to load stream';
          setStreamErrors(prev => ({ ...prev, [sourceKey]: errorMessage }));
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
    return (
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4 text-white">Stream Sources</h3>
        <p className="text-gray-400">No stream sources available for this match.</p>
      </div>
    );
  }

  const totalStreams = Object.values(detailedStreams).reduce((total, streams) => total + streams.length, 0);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold mb-4 text-white">
        Stream Sources ({totalStreams > 0 ? `${totalStreams} real streams` : `${sources.length} sources`} available)
      </h3>
      
      {sources.map((source) => {
        const sourceKey = `${source.source}/${source.id}`;
        const isLoading = loadingStreams[sourceKey];
        const streams = detailedStreams[sourceKey] || [];
        const error = streamErrors[sourceKey];
        
        return (
          <div key={sourceKey} className="mb-4">
            <h4 className="text-md font-semibold mb-2 text-gray-300 capitalize flex items-center gap-2">
              {source.source} Source
              {isLoading && <Loader className="h-4 w-4 animate-spin" />}
              {error && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
              {!isLoading && streams.length > 0 && <span className="text-green-400">({streams.length} real streams)</span>}
              {!isLoading && error && <span className="text-red-400 text-sm">({error})</span>}
            </h4>
            
            <div className="flex flex-wrap gap-3">
              {isLoading ? (
                <Badge variant="secondary" className="cursor-not-allowed opacity-50">
                  Loading real streams...
                </Badge>
              ) : streams.length > 0 ? (
                streams.map((stream) => {
                  const streamKey = `${stream.source}/${stream.id}`;
                  const isActive = activeSource === streamKey;
                  
                  return (
                    <Badge
                      key={stream.id}
                      variant="source"
                      className={`cursor-pointer text-sm py-2 px-4 transition-all ${
                        isActive 
                          ? 'bg-[#343a4d] border-[#9b87f5] ring-2 ring-[#9b87f5]/50' 
                          : 'hover:bg-[#343a4d] hover:border-[#9b87f5]'
                      }`}
                      onClick={() => {
                        console.log(`Selecting real stream: ${stream.language} with URL: ${stream.embedUrl}`);
                        onSourceChange(stream.source, stream.id, stream.embedUrl);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span>{stream.language}</span>
                        {stream.hd && <span className="text-xs bg-green-500 px-1 rounded">HD</span>}
                        <span className="text-xs text-gray-400">#{stream.streamNo}</span>
                        <span className="text-xs bg-blue-500 px-1 rounded">REAL</span>
                      </div>
                    </Badge>
                  );
                })
              ) : error ? (
                <Badge variant="destructive" className="cursor-not-allowed opacity-75">
                  {error}
                </Badge>
              ) : (
                <Badge variant="secondary" className="cursor-not-allowed opacity-50">
                  No real streams found
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
