
import { Button } from '@/components/ui/button';
import { Source, Stream } from '@/types/sports';
import { useState, useEffect } from 'react';
import { fetchStream } from '@/api/sportsApi';
import { Loader, Play } from 'lucide-react';
import { getConnectionInfo } from '@/utils/connectionOptimizer';
import { fetchViewerCountFromSource } from '@/services/viewerCountService';

interface StreamSourcesProps {
  sources: Source[];
  activeSource: string | null;
  onSourceChange: (source: string, id: string, streamNo?: number) => void;
  streamId: string;
  allStreams?: Record<string, Stream[]>;
  viewerCount?: React.ReactNode;
}

const StreamSources = ({ 
  sources, 
  activeSource, 
  onSourceChange, 
  streamId,
  allStreams = {},
  viewerCount
}: StreamSourcesProps) => {
  const [localStreams, setLocalStreams] = useState<Record<string, Stream[]>>({});
  const [loadingStreams, setLoadingStreams] = useState<Record<string, boolean>>({});
  const [connectionQuality, setConnectionQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [streamViewers, setStreamViewers] = useState<Record<string, number>>({});

  // Monitor connection quality
  useEffect(() => {
    const updateConnectionQuality = () => {
      const info = getConnectionInfo();
      const effectiveType = info.effectiveType || '4g';
      const downlink = info.downlink || 10;
      const rtt = info.rtt || 50;

      if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1) {
        setConnectionQuality('poor');
      } else if (effectiveType === '3g' || (downlink >= 1 && downlink < 5)) {
        setConnectionQuality('fair');
      } else if (effectiveType === '4g' || (downlink >= 5 && downlink < 10)) {
        setConnectionQuality('good');
      } else {
        setConnectionQuality('excellent');
      }
    };

    updateConnectionQuality();
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateConnectionQuality);
      return () => connection.removeEventListener('change', updateConnectionQuality);
    }
  }, []);

  const getConnectionDotColor = () => {
    switch (connectionQuality) {
      case 'poor':
        return 'bg-red-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'good':
        return 'bg-green-500';
      case 'excellent':
        return 'bg-green-400';
      default:
        return 'bg-green-500';
    }
  };

  // Mark admin sources but don't hide them
  const isAdminSourceName = (name: string) => name?.toLowerCase().includes('admin');
  const visibleSources = sources.map(s => ({
    ...s,
    isAdmin: isAdminSourceName(s.source),
  }));

  // Use pre-loaded streams if available, otherwise fetch individually
  const effectiveStreams = Object.keys(allStreams).length > 0 ? allStreams : localStreams;

  // Fetch streams only if not already provided
  useEffect(() => {
    const fetchMissingStreams = async () => {
      if (Object.keys(allStreams).length > 0) {
        console.log('✅ Using pre-loaded streams from all sources');
        return;
      }

      if (!visibleSources || visibleSources.length === 0) return;

      console.log('🔄 Fetching individual streams (fallback mode)');
      
      for (const source of visibleSources) {
        const sourceKey = `${source.source}/${source.id}`;
        
        if (localStreams[sourceKey]) continue;
        
        setLoadingStreams(prev => ({ ...prev, [sourceKey]: true }));
        
        try {
          console.log(`Fetching streams for: ${source.source}/${source.id}`);
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
          
          console.log(`Found ${streams.length} valid streams for ${sourceKey}:`, streams);
          
          setLocalStreams(prev => ({
            ...prev,
            [sourceKey]: streams
          }));
        } catch (error) {
          console.error(`Failed to fetch streams for ${sourceKey}:`, error);
          setLocalStreams(prev => ({
            ...prev,
            [sourceKey]: []
          }));
        } finally {
          setLoadingStreams(prev => ({ ...prev, [sourceKey]: false }));
        }
      }
    };

    fetchMissingStreams();
  }, [sources]);

  // Fetch viewer counts for all streams
  useEffect(() => {
    const fetchViewerCounts = async () => {
      const viewers: Record<string, number> = {};
      
      for (const source of visibleSources) {
        const count = await fetchViewerCountFromSource(source.source, source.id);
        if (count !== null) {
          const sourceKey = `${source.source}/${source.id}`;
          viewers[sourceKey] = count;
        }
      }
      
      setStreamViewers(viewers);
    };

    if (visibleSources.length > 0) {
      fetchViewerCounts();
      // Refresh every 30 seconds
      const interval = setInterval(fetchViewerCounts, 30000);
      return () => clearInterval(interval);
    }
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

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-white">Stream Links</h3>
        {viewerCount && (
          <div className="flex items-center">
            {viewerCount}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-3">
        {allAvailableStreams.map(({ stream, sourceKey, index }) => {
          const streamKey = `${stream.source}/${stream.id}/${stream.streamNo || index}`;
          const isActive = activeSource === streamKey;
          
          // Use API-provided names like the HTML code
          let streamName = stream.name || 
                          (stream.language && stream.language !== 'Original' ? stream.language : null) ||
                          (stream.source && stream.source !== 'intel' ? stream.source.toUpperCase() : null) ||
                          `Stream ${stream.streamNo || index + 1}`;
          
          // Get viewer count for this specific stream
          const viewerCount = stream.viewers || 0;
          
          return (
            <div key={streamKey} className="relative">
              <Button
                variant={isActive ? "default" : "outline"}
                className={`rounded-lg px-4 py-3 min-w-[140px] flex flex-col items-start gap-1 h-auto ${
                  isActive 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-400' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600'
                }`}
                onClick={() => onSourceChange(stream.source, stream.id, stream.streamNo || index)}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className={`w-2 h-2 rounded-full ${getConnectionDotColor()} animate-pulse`} />
                  <Play className="w-4 h-4" />
                  <span className="font-semibold">{streamName}</span>
                  {stream.hd && <span className="text-xs bg-red-600 px-1.5 py-0.5 rounded">HD</span>}
                </div>
                <div className="flex items-center gap-1 text-xs opacity-90 ml-6">
                  <span>👁</span>
                  <span className="font-medium">{viewerCount.toLocaleString()}</span>
                  <span className="opacity-75">watching</span>
                </div>
              </Button>
            </div>
          );
        })}
      </div>
      
      {/* Export viewer counts for parent component */}
      <div className="hidden" data-stream-viewers={JSON.stringify(streamViewers)} />
    </div>
  );
};

export default StreamSources;
