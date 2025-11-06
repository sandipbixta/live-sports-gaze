
import { Button } from '@/components/ui/button';
import { Source, Stream } from '@/types/sports';
import { useState, useEffect } from 'react';
import { fetchStream } from '@/api/sportsApi';
import { Loader, Users } from 'lucide-react';
import { getConnectionInfo } from '@/utils/connectionOptimizer';
import { fetchViewerCountFromSource, formatViewerCount } from '@/services/viewerCountService';

interface StreamSourcesProps {
  sources: Source[];
  activeSource: string | null;
  onSourceChange: (source: string, id: string, streamNo?: number) => void;
  streamId: string;
  allStreams?: Record<string, Stream[]>;
  viewerCount?: React.ReactNode;
  currentStreamViewers?: number;
  isLive?: boolean;
  streamDiscovery?: {
    sourcesChecked: number;
    sourcesWithStreams: number;
    sourceNames: string[];
  };
  onRefresh?: () => Promise<void>;
}

const StreamSources = ({ 
  sources, 
  activeSource, 
  onSourceChange, 
  streamId,
  allStreams = {},
  viewerCount,
  currentStreamViewers = 0,
  isLive = false,
  streamDiscovery,
  onRefresh
}: StreamSourcesProps) => {
  const [localStreams, setLocalStreams] = useState<Record<string, Stream[]>>({});
  const [loadingStreams, setLoadingStreams] = useState<Record<string, boolean>>({});
  const [connectionQuality, setConnectionQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [streamViewers, setStreamViewers] = useState<Record<string, number>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Monitor connection quality
  useEffect(() => {
    const updateConnectionQuality = () => {
      const info = getConnectionInfo();
      const effectiveType = info.effectiveType || '4g';
      const downlink = info.downlink || 10;

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

  // Handle refresh button click
  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      console.log('🔄 Stream refresh completed');
    } catch (error) {
      console.error('❌ Stream refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!visibleSources || visibleSources.length === 0) {
    return null;
  }

  const isAnyLoading = Object.values(loadingStreams).some(Boolean);

  // Show loading state
  if (isAnyLoading && Object.keys(effectiveStreams).length === 0) {
    return (
      <div className="mt-6 flex items-center gap-2 text-gray-400 justify-center py-8">
        <Loader className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading streams...</span>
      </div>
    );
  }

  // Show no streams message
  if (Object.keys(effectiveStreams).length === 0) {
    return (
      <div className="mt-6 text-center py-8">
        <p className="text-gray-400">No streams available for this match.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Header with source count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-gray-400 text-sm">
            Showing top quality sources • {streamDiscovery?.sourcesWithStreams || 0} of {streamDiscovery?.sourcesChecked || 9} sources
          </h3>
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-400 hover:text-[#ff5722] text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              {isRefreshing ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                  Refresh
                </>
              )}
            </button>
          )}
        </div>
        {currentStreamViewers > 0 && isLive && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{currentStreamViewers.toLocaleString()} watching</span>
          </div>
        )}
      </div>
      
      {/* Group streams by source */}
      <div className="space-y-4">
        {Object.entries(effectiveStreams).map(([sourceKey, streams]) => {
          if (streams.length === 0) return null;
          
          const sourceName = streams[0].source.toUpperCase();
          const streamCount = streams.length;
          
          // Determine quality label based on source
          let qualityLabel = "Good quality";
          if (sourceName === "ALPHA") qualityLabel = "Most reliable (720p 30fps)";
          else if (sourceName === "ECHO") qualityLabel = "Great quality overall";
          else if (sourceName === "CHARLIE") qualityLabel = "Reliable backup";
          
          return (
            <div key={sourceKey} className="border border-yellow-600/40 rounded-lg p-4 bg-black/40">
              {/* Source header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white text-2xl font-bold mb-1">{sourceName}</h4>
                  <p className="text-yellow-500 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {qualityLabel}
                  </p>
                </div>
                <span className="text-[#ff5722] text-sm font-medium">{streamCount} streams</span>
              </div>
              
              {/* Stream list */}
              <div className="space-y-2">
                {streams.map((stream, index) => {
                  const actualStreamNo = stream.streamNo !== undefined ? stream.streamNo : index + 1;
                  const streamKey = `${stream.source}/${stream.id}/${actualStreamNo}`;
                  const isActive = activeSource === streamKey;
                  const viewerCount = stream.viewers || 0;
                  
                  return (
                    <button
                      key={streamKey}
                      onClick={() => onSourceChange(stream.source, stream.id, actualStreamNo)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                        isActive 
                          ? 'bg-[#ff5722]/20 border border-[#ff5722]/50' 
                          : 'bg-gray-900/50 border border-gray-800 hover:border-[#ff5722]/30 hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* HD/SD Badge */}
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                          stream.hd 
                            ? 'bg-[#ff5722] text-white' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {stream.hd ? 'HD' : 'SD'}
                        </span>
                        
                        {/* Stream name */}
                        <span className="text-white font-medium">
                          Stream {actualStreamNo}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {/* Language */}
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                          </svg>
                          {stream.language || 'English'}
                        </span>
                        
                        {/* Viewer count */}
                        {viewerCount > 0 && (
                          <span className="text-[#ff5722] text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            {viewerCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
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
