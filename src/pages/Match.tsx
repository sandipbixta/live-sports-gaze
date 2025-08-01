
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Match as MatchType, Stream } from '@/types/sports';
import { fetchMatch, fetchStream, fetchMatches } from '@/api/sportsApi';
import { Helmet } from 'react-helmet-async';
import Advertisement from '@/components/Advertisement';
import { isTrendingMatch } from '@/utils/popularLeagues';


// Component imports
import MatchHeader from '@/components/match/MatchHeader';
import TabsNavigation from '@/components/match/TabsNavigation';
import StreamTab from '@/components/match/StreamTab';
import HighlightsTab from '@/components/match/HighlightsTab';
import LoadingState from '@/components/match/LoadingState';
import NotFoundState from '@/components/match/NotFoundState';
import MatchCard from '@/components/MatchCard';

const Match = () => {
  const { toast } = useToast();
  const { sportId, matchId } = useParams();
  const [match, setMatch] = useState<MatchType | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStream, setLoadingStream] = useState(false);
  const [activeTab, setActiveTab] = useState('stream');
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [popularMatches, setPopularMatches] = useState<MatchType[]>([]);
  const [trendingMatches, setTrendingMatches] = useState<MatchType[]>([]);
  const [retryCounter, setRetryCounter] = useState(0);
  
  // Memoized stream fetching function
  const fetchStreamData = useCallback(async (source: string, id: string, streamNo?: number) => {
    setLoadingStream(true);
    try {
      console.log(`Fetching stream: source=${source}, id=${id}, streamNo=${streamNo}`);
      const streamData = await fetchStream(source, id, streamNo);
      
      if (Array.isArray(streamData)) {
        // If array, pick the requested streamNo or the first available stream
        const selectedStream = streamNo !== undefined
          ? streamData.find(s => s.streamNo === streamNo) || streamData[0]
          : streamData.find(s => s.hd) || streamData[0];
        
        console.log('Selected stream from array:', selectedStream);
        setStream(selectedStream || null);
      } else if (streamData && streamData.embedUrl) {
        console.log('Single stream received:', streamData);
        setStream(streamData);
      } else {
        console.log('No valid stream data received');
        setStream(null);
      }
    } catch (error) {
      console.error('Error fetching stream:', error);
      toast({
        title: "Stream Error",
        description: "Failed to load this stream. Try another source.",
        variant: "destructive",
      });
      setStream(null);
    } finally {
      setLoadingStream(false);
    }
  }, [toast]);
  
  useEffect(() => {
    const loadMatch = async () => {
      if (!sportId || !matchId) return;
      
      setIsLoading(true);
      try {
        console.log(`Loading match: sportId=${sportId}, matchId=${matchId}`);
        const matchData = await fetchMatch(sportId, matchId);
        console.log('Match data loaded:', matchData);
        setMatch(matchData);
        
        // Auto-load stream if available
        if (matchData?.sources?.length > 0) {
          const { source, id } = matchData.sources[0];
          setActiveSource(`${source}/${id}`);
          
          await fetchStreamData(source, id);
        }
        
        // Load popular matches (limited to 3)
        if (matchData?.related?.length > 0) {
          setPopularMatches(matchData.related.slice(0, 3));
        }

        // Load trending matches from all sports
        const allMatches = await fetchMatches(sportId);
        
        // Filter and sort by trending score
        const trending = allMatches
          .filter(match => 
            !match.title.toLowerCase().includes('sky sports news') && 
            !match.id.includes('sky-sports-news') &&
            match.id !== matchId // Don't show current match
          )
          .map(match => ({
            ...match,
            trendingData: isTrendingMatch(match.title)
          }))
          .filter(match => match.trendingData.score >= 5)
          .sort((a, b) => b.trendingData.score - a.trendingData.score)
          .slice(0, 6); // Show top 6 trending matches
        
        setTrendingMatches(trending);
        
      } catch (error) {
        console.error('Error in loadMatch:', error);
        toast({
          title: "Error",
          description: "Failed to load match data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMatch();
  }, [sportId, matchId, toast, fetchStreamData]);

  const handleSourceChange = async (source: string, id: string, streamNo?: number) => {
    console.log(`Source change requested: ${source}/${id}/${streamNo || 'default'}`);
    const sourceKey = streamNo !== undefined 
      ? `${source}/${id}/${streamNo}` 
      : `${source}/${id}`;
    
    setActiveSource(sourceKey);
    setRetryCounter(prev => prev + 1);
    await fetchStreamData(source, id, streamNo);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (!match) {
    return <NotFoundState />;
  }
  
  // Format match title for SEO
  const matchTitle = match.title || 'Sports Match';
  const teams = match.teams ? `${match.teams.home?.name || ''} vs ${match.teams.away?.name || ''}` : '';
  const pageTitle = teams ? `${teams} - Live Stream | DamiTV` : `${matchTitle} - Live Stream | DamiTV`;
  const pageDescription = teams 
    ? `Watch ${teams} live stream online for free. Stream this ${match.title} match with high-quality video on DamiTV.` 
    : `Watch ${matchTitle} live stream online for free. Stream this sports match with high-quality video on DamiTV.`;

  return (
    <div className="min-h-screen bg-sports-dark text-sports-light">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${matchTitle} live stream, ${teams} live, watch ${match.title}, free stream ${teams}`} />
        <link rel="canonical" href={`https://damitv.pro/match/${sportId}/${matchId}`} />
        {/* Schema.org structured data for sports event */}
        <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            "name": "${matchTitle}",
            "description": "${pageDescription}",
            "startDate": "${new Date().toISOString()}",
            "url": "https://damitv.pro/match/${sportId}/${matchId}",
            "location": {
              "@type": "VirtualLocation",
              "name": "DamiTV Streaming Platform"
            },
            "competitor": [
              {
                "@type": "SportsTeam",
                "name": "${match.teams?.home?.name || 'Home Team'}"
              },
              {
                "@type": "SportsTeam",
                "name": "${match.teams?.away?.name || 'Away Team'}"
              }
            ],
            "video": {
              "@type": "VideoObject",
              "name": "${matchTitle} Live Stream",
              "description": "Live streaming video for ${matchTitle}",
              "uploadDate": "${new Date().toISOString()}",
              "thumbnailUrl": "${match.teams?.home?.logo || match.teams?.away?.logo || 'https://damitv.pro/logo.png'}"
            }
          }
        `}
        </script>
      </Helmet>
      
      
      <MatchHeader match={match} streamAvailable={!!stream && stream.id !== "error"} />
      <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Banner Advertisement - mobile responsive */}
        <div className="mb-4 sm:mb-6">
          <Advertisement type="banner" className="w-full max-w-full overflow-hidden" />
        </div>
        
        {activeTab === 'stream' && (
          <StreamTab
            match={match}
            stream={stream}
            loadingStream={loadingStream}
            activeSource={activeSource}
            handleSourceChange={handleSourceChange}
            popularMatches={popularMatches}
            sportId={sportId || ''}
          />
        )}
        
        {activeTab === 'highlights' && <HighlightsTab />}

        {/* Direct Link Advertisement - mobile optimized */}
        <div className="my-6 sm:my-8">
          <Advertisement type="direct-link" className="w-full" />
        </div>

        {/* AutoTag Advertisement */}
        <div className="my-6 sm:my-8">
          <Advertisement type="autotag" className="w-full" />
        </div>

        {/* Trending Matches Section */}
        {trendingMatches.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              🔥 Trending Matches
              <span className="text-sm bg-[#242836] border border-[#343a4d] rounded-lg px-2 py-1 text-white">
                {trendingMatches.length} matches
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
              {trendingMatches.map((trendingMatch) => (
                <MatchCard 
                  key={trendingMatch.id}
                  match={trendingMatch}
                  sportId={sportId || ''}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <footer className="bg-sports-darker text-gray-400 py-6 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 DamiTV - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Match;
