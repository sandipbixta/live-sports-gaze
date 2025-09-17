
import { Badge } from '@/components/ui/badge';
import { Source, Stream } from '@/types/sports';
import { useState, useEffect } from 'react';
import { fetchStream } from '@/api/sportsApi';
import { Loader, Play } from 'lucide-react';
import { getLanguageName } from '@/utils/languageDetection';

interface StreamSourcesProps {
  sources: Source[];
  activeSource: string | null;
  onSourceChange: (source: string, id: string, streamNo?: number) => void;
  streamId: string;
  allStreams?: Record<string, Stream[]>; // Pre-loaded streams from all sources
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
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== 'undefined' && ((/iPhone|iPad|iPod/i.test(navigator.userAgent)) || ((navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1));
  const [filterMode, setFilterMode] = useState<'all' | 'ios' | 'android'>('all');

  // Show admin sources and prioritize them first
  const isAdminSourceName = (name: string) => name?.toLowerCase().includes('admin');
  const sortedSources = sources.sort((a, b) => {
    const aIsAdmin = isAdminSourceName(a.source);
    const bIsAdmin = isAdminSourceName(b.source);
    if (aIsAdmin && !bIsAdmin) return -1; // Admin sources first
    if (!aIsAdmin && bIsAdmin) return 1;
    return 0;
  });
  const visibleSources = sortedSources;

  // Use pre-loaded streams if available, otherwise fetch individually
  const effectiveStreams = Object.keys(allStreams).length > 0 ? allStreams : localStreams;

  // Fetch streams only if not already provided
  useEffect(() => {
    const fetchMissingStreams = async () => {
      if (Object.keys(allStreams).length > 0) {
        console.log('✅ Using pre-loaded streams from all sources');
        return; // Use pre-loaded streams
      }

      if (!visibleSources || visibleSources.length === 0) return;

      console.log('🔄 Fetching individual streams (fallback mode)');
      
      for (const source of visibleSources) {
        const sourceKey = `${source.source}/${source.id}`;
        
        if (localStreams[sourceKey]) continue; // Already fetched
        
        setLoadingStreams(prev => ({ ...prev, [sourceKey]: true }));
        
        try {
          console.log(`Fetching streams for: ${source.source}/${source.id}`);
          const streamData = await fetchStream(source.source, source.id);
          
          let streams: Stream[] = [];
          
          if (Array.isArray(streamData)) {
            // API returned multiple streams
            streams = streamData
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
          } else if (streamData && typeof streamData === 'object' && streamData.embedUrl) {
            // API returned single stream
            const url = streamData.embedUrl;
            const normalized = url.startsWith('//') ? 'https:' + url : url.replace(/^http:\/\//i, 'https://');
            if (normalized && 
                !normalized.includes('youtube.com') &&
                !normalized.includes('demo')) {
              streams = [{ ...streamData, embedUrl: normalized } as Stream];
            }
          }
          
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

  if (!visibleSources || visibleSources.length === 0) {
    return null;
  }


  // Group sources by source name
  const groupedSources = visibleSources.reduce((groups: Record<string, Source[]>, source) => {
    const groupName = source.source;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(source);
    return groups;
  }, {});

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-xl font-bold text-white">Stream Sources</h3>
        <div className="flex items-center gap-2">
          <Badge variant={filterMode === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterMode('all')}>All</Badge>
          <Badge variant={filterMode === 'ios' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterMode('ios')}>iOS links</Badge>
          <Badge variant={filterMode === 'android' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterMode('android')}>Android links</Badge>
        </div>
      </div>
      
      {/* Collect all streams from all sources */}
      {(() => {
        const allAvailableStreams: Array<{
          stream: any;
          sourceKey: string;
          index: number;
          groupName: string;
        }> = [];
        
        Object.entries(groupedSources).forEach(([groupName, groupSources]) => {
          groupSources.forEach((source) => {
            const sourceKey = `${source.source}/${source.id}`;
            const streams = effectiveStreams[sourceKey] || [];
            
            streams.forEach((stream, index) => {
              allAvailableStreams.push({
                stream,
                sourceKey,
                index,
                groupName
              });
            });
          });
        });
        
        const isAnyLoading = Object.values(loadingStreams).some(Boolean);
        
        const filteredAvailableStreams = allAvailableStreams.filter(({ stream }) => {
          const url = stream?.embedUrl || '';
          const isM3U8 = /\.m3u8(\?|$)/i.test(url);
          if (filterMode === 'ios') return isM3U8;
          if (filterMode === 'android') return !isM3U8;
          return true;
        });
        
        if (isAnyLoading && filteredAvailableStreams.length === 0) {
          return (
            <div className="flex items-center gap-2 text-gray-400 justify-center py-8">
              <Loader className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading streams...</span>
            </div>
          );
        }
        
        if (filteredAvailableStreams.length === 0) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-400">No matching streams for this filter. Try another filter.</p>
            </div>
          );
        }

        // Sort streams to put admin sources first
        const sortedAvailableStreams = filteredAvailableStreams.sort((a, b) => {
          const aIsAdmin = isAdminSourceName(a.groupName);
          const bIsAdmin = isAdminSourceName(b.groupName);
          if (aIsAdmin && !bIsAdmin) return -1; // Admin streams first
          if (!aIsAdmin && bIsAdmin) return 1;
          return 0;
        });
        
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              {sortedAvailableStreams.length} stream{sortedAvailableStreams.length > 1 ? 's' : ''} available
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {sortedAvailableStreams.map(({ stream, sourceKey, index, groupName }) => {
                const streamKey = `${stream.source}/${stream.id}/${stream.streamNo || index}`;
                const isActive = activeSource === streamKey;
                
                // Get the actual source name from the API data
                const getDisplayName = (stream: any, sourceInfo: Source, index: number): string => {
                  console.log('Stream data:', stream);
                  console.log('Source info:', sourceInfo);
                  
                  // 1. First priority: Use the source name from the match sources array
                  if (sourceInfo.source) {
                    // Convert known source identifiers to readable names
                    const sourceDisplayNames: Record<string, string> = {
                      'admin': 'Main Stream',
                      'alpha': 'Server Alpha',
                      'bravo': 'Server Bravo', 
                      'charlie': 'Server Charlie',
                      'delta': 'Server Delta',
                      'echo': 'Server Echo',
                      'foxtrot': 'Server Foxtrot',
                      'golf': 'Server Golf',
                      'stream1': 'Stream 1',
                      'stream2': 'Stream 2',
                      'stream3': 'Stream 3'
                    };
                    
                    const baseName = sourceDisplayNames[sourceInfo.source.toLowerCase()] || 
                                   sourceInfo.source.charAt(0).toUpperCase() + sourceInfo.source.slice(1);
                    
                    // If multiple streams from same source, add number
                    const streamsFromSameSource = effectiveStreams[sourceKey] || [];
                    if (streamsFromSameSource.length > 1) {
                      return `${baseName} ${stream.streamNo || (index + 1)}`;
                    }
                    
                    return baseName;
                  }
                  
                  // 2. Second priority: Use stream source if different from sourceInfo
                  if (stream.source && stream.source !== sourceInfo.source) {
                    return stream.source.charAt(0).toUpperCase() + stream.source.slice(1);
                  }
                  
                  // 3. Third priority: Extract meaningful name from embedUrl
                  if (stream.embedUrl) {
                    try {
                      const url = new URL(stream.embedUrl);
                      
                      // For common streaming domains, extract meaningful names
                      const domainNameMap: Record<string, string> = {
                        'streameast': 'Stream East',
                        'buffstreams': 'Buff Streams',
                        'cricfree': 'CricFree',
                        'sportsbay': 'Sports Bay',
                        'streamhub': 'Stream Hub'
                      };
                      
                      const hostname = url.hostname.replace('www.', '').toLowerCase();
                      const domainName = Object.keys(domainNameMap).find(key => hostname.includes(key));
                      
                      if (domainName) {
                        return domainNameMap[domainName];
                      }
                      
                      // Extract from channel path if available
                      if (stream.embedUrl.includes('/channel/')) {
                        const channelPart = stream.embedUrl.split('/channel/')[1];
                        if (channelPart) {
                          const cleanName = channelPart.split('?')[0]
                            .replace(/\[.*?\]/g, '') // Remove [Country] parts
                            .replace(/([A-Z])/g, ' $1')
                            .trim()
                            .replace(/\s+/g, ' ');
                          if (cleanName.length > 0 && cleanName !== '/') {
                            return cleanName.substring(0, 15);
                          }
                        }
                      }
                      
                      // Use domain name as fallback
                      const domain = hostname.split('.')[0];
                      return domain.charAt(0).toUpperCase() + domain.slice(1);
                      
                    } catch (error) {
                      console.log('Error parsing embed URL:', error);
                    }
                  }
                  
                  // 4. Final fallback: Use server + number format
                  return `Server ${index + 1}`;
                };
                
                const displayName = getDisplayName(stream, visibleSources.find(s => `${s.source}/${s.id}` === sourceKey) || visibleSources[0], index);
                // Heuristic platform label based on URL type
                const isM3U8 = /\.m3u8(\?|$)/i.test(stream?.embedUrl || '');
                
                return (
                  <Badge
                    key={streamKey}
                    variant="source"
                    className={`cursor-pointer p-2 text-left transition-all hover:scale-105 w-full min-h-[60px] ${
                      isActive 
                        ? 'bg-[#ff5a36] border-[#ff5a36] text-white' 
                        : 'bg-[#242836] border-[#343a4d] text-gray-300 hover:bg-[#343a4d]'
                    }`}
                    onClick={() => onSourceChange(stream.source, stream.id, stream.streamNo || index)}
                  >
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center gap-1">
                        <Play size={10} />
                        <span className="font-medium text-xs leading-tight line-clamp-2">
                          {displayName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {/* Platform badge derived from stream URL */}
                        <span className="text-xs uppercase opacity-80">{isM3U8 ? 'iOS' : 'Android'}</span>
                        <span className="capitalize text-xs">{getLanguageName(stream.language)}</span>
                        {stream.hd && (
                          <span className="bg-[#ff5a36] text-white px-1 rounded text-xs font-bold">
                            HD
                          </span>
                        )}
                        {isActive && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse ml-auto"></div>
                        )}
                      </div>
                    </div>
                  </Badge>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default StreamSources;
