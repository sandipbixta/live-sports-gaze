import { Button } from '@/components/ui/button';
import { Source, Stream } from '@/types/sports';
import { useState, useEffect } from 'react';
import { fetchStream } from '@/api/sportsApi';
import { Loader, Play } from 'lucide-react';

interface StreamSourcesProps {
  sources: Source[];
  activeSource: string | null;
  onSourceChange: (source: string, id: string, streamNo?: number) => void;
  streamId: string;
  allStreams?: Record<string, Stream[]>;
}

const StreamSources = ({ 
  sources, 
  activeSource, 
  onSourceChange, 
  streamId,
  allStreams = {} 
}: StreamSourcesProps) => {
  const [localStreams, setLocalStreams] = useState<Record<string, Stream[]>>({});
  const [loadingStreams, setLoadingStreams] = useState<Record<string, boolean>>({});

  const isAdminSourceName = (name: string) => name?.toLowerCase().includes('admin');
  const visibleSources = sources.filter(s => !isAdminSourceName(s.source));

  const effectiveStreams = Object.keys(allStreams).length > 0 ? allStreams : localStreams;

  useEffect(() => {
    const fetchMissingStreams = async () => {
      if (Object.keys(allStreams).length > 0) return;
      if (!visibleSources || visibleSources.length === 0) return;

      for (const source of visibleSources) {
        const sourceKey = `${source.source}/${source.id}`;
        if (localStreams[sourceKey]) continue;

        setLoadingStreams(prev => ({ ...prev, [sourceKey]: true }));

        try {
          const streamData = await fetchStream(source.source, source.id);

          const streams = streamData
            .map((s: any) => {
              const url = s?.embedUrl || '';
              const normalized = url.startsWith('//') ? 'https:' + url : url.replace(/^http:\/\//i, 'https://');
              return normalized && !normalized.includes('youtube.com') && !normalized.includes('demo')
                ? { ...s, embedUrl: normalized }
                : null;
            })
            .filter(Boolean) as Stream[];

          setLocalStreams(prev => ({
            ...prev,
            [sourceKey]: streams
          }));
        } catch (error) {
          setLocalStreams(prev => ({ ...prev, [sourceKey]: [] }));
        } finally {
          setLoadingStreams(prev => ({ ...prev, [sourceKey]: false }));
        }
      }
    };

    fetchMissingStreams();
  }, [sources]);

  if (!visibleSources || visibleSources.length === 0) return null;

  const allAvailableStreams: Array<{ stream: any; sourceKey: string; index: number; }> = [];
  visibleSources.forEach((source) => {
    const sourceKey = `${source.source}/${source.id}`;
    const streams = effectiveStreams[sourceKey] || [];
    streams.forEach((stream, index) => {
      allAvailableStreams.push({ stream, sourceKey, index });
    });
  });

  const isAnyLoading = Object.values(loadingStreams).some(Boolean);

  if (isAnyLoading && allAvailableStreams.length === 0) {
    return (
      <div className="mt-6 flex items-center gap-2 text-gray-400 justify-center py-8">
        <Loader className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading streams...</span>
      </div>
    );
  }

  if (allAvailableStreams.length === 0) {
    return (
      <div className="mt-6 text-center py-8">
        <p className="text-gray-400">No streams available for this match.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Stream Links</h3>
      
      <div className="flex flex-wrap gap-3 ml-8">
        {allAvailableStreams.slice(0, 3).map(({ stream, sourceKey, index }) => {
          const streamKey = `${stream.source}/${stream.id}/${stream.streamNo || index}`;
          const baseKey = `${stream.source}/${stream.id}`;
          const isActive = activeSource === streamKey || activeSource === baseKey;

          const streamName = stream.name || 
                             (stream.language && stream.language !== 'Original' ? stream.language : null) ||
                             (stream.source && stream.source !== 'intel' ? stream.source.toUpperCase() : null) ||
                             `Stream ${stream.streamNo || index + 1}`;

          return (
            <Button
              key={streamKey}
              variant={isActive ? "default" : "outline"}
              className={`min-w-[120px] ${
                isActive 
                  ? 'bg-gray-700 text-white'     // <-- Active button gray now
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600' // <-- Normal button gray
              }`}
              onClick={() => onSourceChange(stream.source, stream.id, stream.streamNo || index)}
            >
              <Play className="w-4 h-4 mr-2" />
              {streamName}
              {stream.hd && <span className="ml-2 text-xs bg-red-600 px-1 rounded">HD</span>}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default StreamSources;
