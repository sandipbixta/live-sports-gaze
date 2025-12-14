import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { triggerStreamChangeAd } from '@/utils/streamAdTrigger';
import { useToast } from '@/hooks/use-toast';
import { Match as MatchType, Stream } from '@/types/sports';

// Lazy load components - same as Match.tsx
const TelegramBanner = lazy(() => import('@/components/TelegramBanner'));
const SEOMetaTags = lazy(() => import('@/components/SEOMetaTags'));
const SocialShare = lazy(() => import('@/components/SocialShare'));
const FavoriteButton = lazy(() => import('@/components/FavoriteButton'));
const MatchHeader = lazy(() => import('@/components/match/MatchHeader'));
const StreamTab = lazy(() => import('@/components/match/StreamTab'));
const MatchAnalysis = lazy(() => import('@/components/match/MatchAnalysis'));
const ViewerStats = lazy(() => import('@/components/match/ViewerStats').then(m => ({ default: m.ViewerStats })));

// Loading states
import LoadingState from '@/components/match/LoadingState';
import NotFoundState from '@/components/match/NotFoundState';

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-32" }: { height?: string }) => (
  <div className={`${height} bg-card rounded-lg animate-pulse`} />
);

interface StreamChannel {
  id: string;
  name: string;
  country: string;
  logo: string;
  embedUrl: string;
}

interface SelectedMatch {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamBadge: string | null;
  awayTeamBadge: string | null;
  homeScore: string | null;
  awayScore: string | null;
  sport: string;
  sportIcon: string;
  league: string;
  date: string;
  time: string;
  timestamp: string;
  venue: string | null;
  country: string | null;
  status: string | null;
  progress: string | null;
  poster: string | null;
  banner: string | null;
  isLive: boolean;
  isFinished: boolean;
  channels: StreamChannel[];
}

// Convert SelectedMatch to MatchType for shared components
const convertToMatchType = (match: SelectedMatch): MatchType => ({
  id: match.id,
  title: match.title,
  category: match.league,
  date: new Date(match.timestamp).getTime(),
  poster: match.poster || '',
  popular: match.isLive,
  teams: {
    home: {
      name: match.homeTeam,
      badge: match.homeTeamBadge || undefined,
    },
    away: {
      name: match.awayTeam,
      badge: match.awayTeamBadge || undefined,
    }
  },
  score: {
    home: match.homeScore || undefined,
    away: match.awayScore || undefined
  },
  progress: match.progress || undefined,
  sources: match.channels?.map((ch, idx) => ({
    source: ch.name,
    id: ch.id || `stream-${idx}`,
    name: ch.name,
    image: ch.logo
  })) || []
});

const SelectedMatchPlayer = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [match, setMatch] = useState<SelectedMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [loadingStream, setLoadingStream] = useState(false);
  const [allStreams, setAllStreams] = useState<Record<string, Stream[]>>({});

  const fetchMatch = async () => {
    if (!matchId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('fetch-popular-matches');
      
      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }
      
      const matches = data?.matches || [];
      const foundMatch = matches.find((m: SelectedMatch) => m.id === matchId);
      
      if (foundMatch) {
        setMatch(foundMatch);
        
        // Build streams from channels
        const streamableChannels = foundMatch.channels?.filter((ch: StreamChannel) => ch.embedUrl) || [];
        const streams: Stream[] = streamableChannels.map((ch: StreamChannel, idx: number) => ({
          id: ch.id || `stream-${idx}`,
          streamNo: idx + 1,
          language: ch.country || 'English',
          hd: true,
          embedUrl: ch.embedUrl,
          source: ch.name,
          name: ch.name,
          image: ch.logo
        }));
        
        // Group streams by source
        const groupedStreams: Record<string, Stream[]> = {};
        streams.forEach(stream => {
          const source = stream.source || 'default';
          if (!groupedStreams[source]) {
            groupedStreams[source] = [];
          }
          groupedStreams[source].push(stream);
        });
        setAllStreams(groupedStreams);
        
        // Set first stream as active
        if (streams.length > 0) {
          const firstStream = streams[0];
          setActiveSource(`${firstStream.source}/${firstStream.id}/1`);
          setCurrentStream(firstStream);
        }
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [matchId]);

  const handleSourceChange = (source: string, id: string, streamNo?: number) => {
    triggerStreamChangeAd();
    setLoadingStream(true);
    setActiveSource(`${source}/${id}/${streamNo || 1}`);
    
    // Find the stream from allStreams
    const streams = allStreams[source] || [];
    const stream = streams.find(s => s.id === id) || streams[0];
    if (stream) {
      setCurrentStream(stream);
    }
    
    setTimeout(() => setLoadingStream(false), 500);
  };

  const handleRefreshStreams = async () => {
    toast({
      title: "Refreshing streams...",
      description: "Scanning for available streams",
    });
    await fetchMatch();
    toast({
      title: "Refresh complete",
      description: `Found ${match?.channels?.filter(c => c.embedUrl).length || 0} streams`,
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!match) {
    return <NotFoundState />;
  }

  const matchDate = new Date(match.timestamp);
  const matchTitle = `${match.homeTeam} vs ${match.awayTeam}`;
  const matchDescription = `Watch ${matchTitle} live stream online for free on DamiTV. ${match.league} match with HD quality streaming.`;

  // Convert to MatchType for shared components
  const matchData = convertToMatchType(match);

  const getMatchPosterUrl = () => {
    if (match.poster && match.poster.trim() !== '') {
      return match.poster.startsWith('http') ? match.poster : `https://api.cdn-live.tv${match.poster}`;
    }
    return 'https://i.imgur.com/m4nV9S8.png';
  };

  const matchPosterUrl = getMatchPosterUrl();

  // Stream discovery info
  const streamDiscovery = {
    sourcesChecked: Object.keys(allStreams).length,
    sourcesWithStreams: Object.values(allStreams).filter(s => s.length > 0).length,
    sourceNames: Object.keys(allStreams)
  };

  return (
    <div className="min-h-screen bg-sports-dark text-sports-light">
      <Suspense fallback={null}>
        <SEOMetaTags
          title={`${matchTitle} - Live Stream | DamiTV`}
          description={`${matchDescription} - Watch ${matchTitle} on damitv.pro with HD quality streaming.`}
          keywords={`${match.homeTeam} live stream, ${match.awayTeam} online, ${matchTitle}, ${matchTitle} on damitv.pro, live football streaming`}
          canonicalUrl={`https://damitv.pro/selected-match/${matchId}`}
          ogImage={matchPosterUrl}
          matchInfo={{
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            league: match.league,
            date: matchDate,
          }}
          breadcrumbs={[
            { name: 'Home', url: 'https://damitv.pro/' },
            { name: 'Live Matches', url: 'https://damitv.pro/live' },
            { name: `${matchTitle} on damitv.pro`, url: `https://damitv.pro/selected-match/${matchId}` }
          ]}
        />
      </Suspense>

      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            "name": matchTitle,
            "description": matchDescription,
            "startDate": matchDate.toISOString(),
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
            "location": {
              "@type": "VirtualLocation",
              "url": `https://damitv.pro/selected-match/${matchId}`
            },
            "image": matchPosterUrl,
            "organizer": {
              "@type": "Organization",
              "name": "DamiTV",
              "url": "https://damitv.pro"
            },
            "competitor": [
              { "@type": "SportsTeam", "name": match.homeTeam },
              { "@type": "SportsTeam", "name": match.awayTeam }
            ]
          })}
        </script>
      </Helmet>
      
      {/* Header - Same as Match.tsx */}
      <Suspense fallback={<LoadingPlaceholder height="h-24" />}>
        <MatchHeader 
          match={matchData} 
          streamAvailable={!!currentStream}
          socialShare={
            <div className="flex items-center gap-2">
              <Suspense fallback={null}>
                <FavoriteButton
                  type="match"
                  id={matchId || ''}
                  name={matchTitle}
                  variant="outline"
                />
              </Suspense>
              <Suspense fallback={null}>
                <SocialShare 
                  title={matchTitle}
                  description={matchDescription}
                  image={matchPosterUrl}
                  url={`https://damitv.pro/selected-match/${matchId}`}
                />
              </Suspense>
            </div>
          }
        />
      </Suspense>
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-4">
          <Suspense fallback={<LoadingPlaceholder height="h-16" />}>
            <TelegramBanner />
          </Suspense>
        </div>
        
        {/* Match Title with Badges - Same as Match.tsx */}
        <div className="w-full flex justify-center mb-4">
          <div className="text-center max-w-4xl px-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              {match.homeTeamBadge && (
                <img 
                  src={match.homeTeamBadge} 
                  alt={match.homeTeam} 
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                  onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                />
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-white">{match.title}</h1>
              {match.awayTeamBadge && (
                <img 
                  src={match.awayTeamBadge} 
                  alt={match.awayTeam} 
                  className="w-8 h-8 md:w-10 md:h-10 object-contain"
                  onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                />
              )}
            </div>
            <p className="text-sm md:text-base text-gray-400">{matchTitle} on damitv.pro</p>
          </div>
        </div>
        
        {/* Video Player and Layout - Same as Match.tsx */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0" id="stream-container" data-stream-container>
            <Suspense fallback={<LoadingPlaceholder height="h-96" />}>
              <StreamTab
                match={matchData}
                stream={currentStream}
                loadingStream={loadingStream}
                activeSource={activeSource}
                handleSourceChange={handleSourceChange}
                popularMatches={[]}
                sportId={match.sport || 'football'}
                allStreams={allStreams}
                streamDiscovery={streamDiscovery}
                onRefreshStreams={handleRefreshStreams}
              />
            </Suspense>

            {/* Viewer Statistics - Same as Match.tsx */}
            <div className="mt-6">
              <Suspense fallback={<LoadingPlaceholder height="h-24" />}>
                <ViewerStats match={matchData} />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Match Analysis - Same as Match.tsx */}
        <div className="mt-8">
          <Suspense fallback={<LoadingPlaceholder height="h-48" />}>
            <MatchAnalysis match={matchData} />
          </Suspense>
        </div>
      </div>
      
      {/* Footer - Same as Match.tsx */}
      <footer className="bg-sports-darker text-gray-400 py-6 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 DamiTV - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default SelectedMatchPlayer;
