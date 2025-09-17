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

  // Mark admin sources but don’t hide them
  const isAdminSourceName = (name: string) => name?.toLowerCase().includes('admin');
  const visibleSources = sources.map(s => ({
    ...s,
    isAdmin: isAdminSourceName(s.source),
  }));

  // Use pre-loaded streams if available, otherwise fetch individually
  const effectiveStreams = Object.keys(allStreams).length > 0 ? allStreams : localStreams;

  // Fetch streams from ALL sources concurrently
  useEffect(() => {
    const fetchAllStreams = async () => {
      if (Object.keys(allStreams).length > 0) {
        console.log('✅ Using pre-loaded streams from all sources');
        return;
      }

      if (!visibleSources || visibleSources.length === 0) return;

      console.log('🔄 Fetching streams from ALL sources concurrently');
      
      // Fetch from all sources concurrently for better performance
      const fetchPromises = visibleSources.map(async (source) => {
        const sourceKey = `${source.source}/${source.id}`;
        
        if (localStreams[sourceKey]) return;
        
        setLoadingStreams(prev => ({ ...prev, [sourceKey]: true }));
        
        try {
          console.log(`🎯 Fetching streams for: ${source.source}/${source.id}`);
          const streamData = await fetchStream(source.source, source.id);
          
          const streams = streamData
            .map((s: any) => {
              const url = s?.embedUrl || '';
              const normalized = url.startsWith('//') ? 'https:' + url : url.replace(/^http:\/\//i, 'https://');
              return normalized &&
                !normalized.includes('youtube.com') &&
                !normalized.includes('demo')
                ? { ...s, embedUrl: normalized }
                : null;
            })
            .filter(Boolean) as Stream[];
          
          console.log(`✅ Found ${streams.length} streams for ${sourceKey}:`, streams);
          
          setLocalStreams(prev => ({
            ...prev,
            [sourceKey]: streams
          }));
        } catch (error) {
          console.error(`❌ Failed to fetch streams for ${sourceKey}:`, error);
          setLocalStreams(prev => ({
            ...prev,
            [sourceKey]: []
          }));
        } finally {
          setLoadingStreams(prev => ({ ...prev, [sourceKey]: false }));
        }
      });

      // Wait for all sources to complete
      await Promise.all(fetchPromises);
      console.log('🎉 Finished fetching streams from all sources');
    };

    fetchAllStreams();
  }, [sources]);

  if (!visibleSources || visibleSources.length === 0) {
    return null;
  }

  // Collect all available streams from all sources
  const allAvailableStreams: Array<{
    stream: any;
    sourceKey: string;
    index: number;
  }> = [];
  
  visibleSources.forEach((source) => {
    const sourceKey = `${source.source}/${source.id}`;
    const streams = effectiveStreams[sourceKey] || [];
    
    streams.forEach((stream, index) => {
      allAvailableStreams.push({
        stream,
        sourceKey,
        index
      });
    });
  });

  const isAnyLoading = Object.values(loadingStreams).some(Boolean);

  // Show loading state
  if (isAnyLoading && allAvailableStreams.length === 0) {
    return (
      <div className="mt-6 flex items-center gap-2 text-gray-400 justify-center py-8">
        <Loader className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading streams...</span>
      </div>
    );
  }

  // Show no streams message
  if (allAvailableStreams.length === 0) {
    return (
      <div className="mt-6 text-center py-8">
        <p className="text-gray-400">No streams available for this match.</p>
      </div>
    );
  }

  // Simple layout: show stream buttons like HTML code
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Stream Links</h3>
      
      <div className="flex flex-wrap gap-3">
        {allAvailableStreams.map(({ stream, sourceKey, index }) => {
          const streamKey = `${stream.source}/${stream.id}/${stream.streamNo || index}`;
          const isActive = activeSource === streamKey;
          
          // Use API-provided names like the HTML code
          let streamName = stream.name || 
                          (stream.language && stream.language !== 'Original' ? stream.language : null) ||
                          (stream.source && stream.source !== 'intel' ? stream.source.toUpperCase() : null) ||
                          `Stream ${stream.streamNo || index + 1}`;

          if (stream.source?.toLowerCase().includes('admin')) {
            streamName = `🔴 ${streamName}`;
          }
          
          return (
            <Button
              key={streamKey}
              variant={isActive ? "default" : "outline"}
              className={`rounded-full px-5 py-2 min-w-[120px] ${
                stream.source?.toLowerCase().includes('admin')
                  ? isActive 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-red-800 hover:bg-red-700 text-red-100 border-red-600'
                  : isActive 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600'
              }`}
              onClick={() => onSourceChange(stream.source, stream.id, stream.streamNo || index)}
            >
              <Play className="w-4 h-4 mr-2" />
              {streamName}
              {stream.hd && <span className="ml-2 text-xs bg-green-600 px-1 rounded">HD</span>}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default StreamSources;
