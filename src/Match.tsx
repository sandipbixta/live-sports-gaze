import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Match as MatchType, Stream } from '../types/sports';
import { fetchMatch, fetchStream } from '../api/sportsApi';
import { Helmet } from 'react-helmet-async';

// Component imports
import MatchHeader from '../components/match/MatchHeader';
import TabsNavigation from '../components/match/TabsNavigation';
import StreamTab from '../components/match/StreamTab';
import HighlightsTab from '../components/match/HighlightsTab';
import LoadingState from '../components/match/LoadingState';
import NotFoundState from '../components/match/NotFoundState';

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
  
  useEffect(() => {
    const loadMatch = async () => {
      if (!sportId || !matchId) return;
      
      setIsLoading(true);
      try {
        const matchData = await fetchMatch(sportId, matchId);
        setMatch(matchData);
        
        // Auto-load stream if available
        if (matchData?.sources?.length > 0) {
          const { source, id } = matchData.sources[0];
          setActiveSource(`${source}/${id}`);
          
          try {
            setLoadingStream(true);
            const streamData = await fetchStream(source, id);
            setStream(streamData);
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to load stream data.",
              variant: "destructive",
            });
          } finally {
            setLoadingStream(false);
          }
        }
        
        // Load popular matches (limited to 3)
        if (matchData?.related?.length > 0) {
          setPopularMatches(matchData.related.slice(0, 3));
        }
      } catch (error) {
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
  }, [sportId, matchId, toast]);

  const handleSourceChange = async (source: string, id: string) => {
    setActiveSource(`${source}/${id}`);
    setLoadingStream(true);
    try {
      const streamData = await fetchStream(source, id);
      setStream(streamData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load stream data.",
        variant: "destructive",
      });
    } finally {
      setLoadingStream(false);
    }
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

  // Fix the property access
  const homeLogo = match.teams?.home?.badge || '';
  const awayLogo = match.teams?.away?.badge || '';
  const defaultLogo = 'https://damitv.pro/logo.png';
  const thumbnailUrl = homeLogo || awayLogo || defaultLogo;

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
              "thumbnailUrl": "${thumbnailUrl}"
            }
          }
        `}
        </script>
      </Helmet>
      
      <MatchHeader match={match} streamAvailable={!!stream} />
      <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto px-4 py-8">
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
