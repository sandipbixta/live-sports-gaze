
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Match as MatchType, Stream } from '@/types/sports';
import { fetchMatch, fetchStream, fetchMatches } from '@/api/ppvApi';
import { Helmet } from 'react-helmet-async';
import Advertisement from '@/components/Advertisement';
import { isTrendingMatch } from '@/utils/popularLeagues';
import TelegramBanner from '@/components/TelegramBanner';
import { teamLogoService } from '@/services/teamLogoService';
import SEOMetaTags from '@/components/SEOMetaTags';
import SocialShare from '@/components/SocialShare';

// Component imports
import MatchHeader from '@/components/match/MatchHeader';
import StreamTab from '@/components/match/StreamTab';
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
  
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [popularMatches, setPopularMatches] = useState<MatchType[]>([]);
  const [recommendedMatches, setRecommendedMatches] = useState<MatchType[]>([]);
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
        
        // Enhance match with team logos for better sharing
        const enhancedMatch = teamLogoService.enhanceMatchWithLogos(matchData);
        console.log('Enhanced match with logos:', enhancedMatch);
        setMatch(enhancedMatch);
        
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

        // Load all matches for recommended and trending sections
        const allMatches = await fetchMatches(sportId);
        
        // Filter live matches for recommended section (exclude current match)
        const liveMatches = allMatches.filter(match => 
          !match.title.toLowerCase().includes('sky sports news') && 
          !match.id.includes('sky-sports-news') &&
          match.id !== matchId && // Don't show current match
          match.date <= Date.now() && // Live matches (started)
          match.date > Date.now() - (24 * 60 * 60 * 1000) // Within last 24 hours
        ).slice(0, 6); // Show top 6 live matches
        
        setRecommendedMatches(liveMatches);
        
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
  const homeTeam = match.teams?.home?.name || '';
  const awayTeam = match.teams?.away?.name || '';
  const matchTitle = homeTeam && awayTeam ? `${homeTeam} vs ${awayTeam}` : match.title;
  const matchDescription = `Watch ${matchTitle} live stream online for free on DamiTV. HD quality streaming with multiple sources available.`;

  // Generate match poster URL for social sharing
  const getMatchPosterUrl = () => {
    if (match.poster && match.poster.trim() !== '') {
      const baseUrl = match.poster.startsWith('http') 
        ? match.poster 
        : `https://streamed.pk${match.poster}.webp`;
      // Add cache busting parameter for fresh social media sharing
      const cacheBuster = `?v=${Date.now()}`;
      return baseUrl + cacheBuster;
    }
    return 'https://i.imgur.com/m4nV9S8.png'; // Fallback to DamiTV logo
  };

  const matchPosterUrl = getMatchPosterUrl();

  return (
    <div className="min-h-screen bg-sports-dark text-sports-light">
      <SEOMetaTags
        title={`${matchTitle} - Live Stream | DamiTV`}
        description={matchDescription}
        keywords={`${homeTeam} live stream, ${awayTeam} online, ${matchTitle}, live football streaming, watch ${homeTeam} vs ${awayTeam}`}
        canonicalUrl={`https://damitv.pro/match/${sportId}/${matchId}`}
        ogImage={matchPosterUrl}
        matchInfo={{
          homeTeam,
          awayTeam,
          league: match.category || 'Football',
          date: match.date ? new Date(match.date) : new Date(),
        }}
        breadcrumbs={[
          { name: 'Home', url: 'https://damitv.pro/' },
          { name: 'Live Matches', url: 'https://damitv.pro/live' },
          { name: matchTitle, url: `https://damitv.pro/match/${sportId}/${matchId}` }
        ]}
      />

      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes" />
      </Helmet>
      
      <MatchHeader 
        match={match} 
        streamAvailable={!!stream && stream.id !== "error"}
        socialShare={
          <SocialShare 
            title={matchTitle}
            description={matchDescription}
            image={matchPosterUrl}
            url={`https://damitv.pro/match/${sportId}/${matchId}`}
          />
        }
      />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Telegram Banner */}
        <div className="mb-4">
          <TelegramBanner />
        </div>

        {/* Banner Advertisement - mobile responsive */}
        <div className="mb-4 sm:mb-6">
          <Advertisement type="banner" className="w-full max-w-full overflow-hidden" />
        </div>
        
        {/* Match Title - Centered above video player */}
        <div className="w-full flex justify-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center max-w-4xl px-4">{match.title}</h1>
        </div>
        
        <StreamTab
          match={match}
          stream={stream}
          loadingStream={loadingStream}
          activeSource={activeSource}
          handleSourceChange={handleSourceChange}
          popularMatches={popularMatches}
          sportId={sportId || ''}
        />

        {/* Recommended Live Matches Section */}
        {recommendedMatches.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              🎯 Recommended Live Games
              <span className="text-sm bg-[#242836] border border-[#343a4d] rounded-lg px-2 py-1 text-white">
                {recommendedMatches.length} live
              </span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
              {recommendedMatches.map((recommendedMatch) => (
                <MatchCard 
                  key={recommendedMatch.id}
                  match={recommendedMatch}
                  sportId={sportId || ''}
                />
              ))}
            </div>
          </div>
        )}

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

        {/* Video Advertisement - After trending matches */}
        <div className="mt-8">
          <Advertisement type="video" className="w-full" />
        </div>
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
