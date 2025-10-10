import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Match as MatchType } from '@/types/sports';
import { fetchMatch, fetchMatches } from '@/api/sportsApi';
import { useStreamPlayer } from '@/hooks/useStreamPlayer';
import { useViewerTracking } from '@/hooks/useViewerTracking';
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
import MatchAnalysis from '@/components/match/MatchAnalysis';

const Match = () => {
  const { toast } = useToast();
  const { sportId, matchId } = useParams();
  const [match, setMatch] = useState<MatchType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [allMatches, setAllMatches] = useState<MatchType[]>([]);
  const [recommendedMatches, setRecommendedMatches] = useState<MatchType[]>([]);
  const [trendingMatches, setTrendingMatches] = useState<MatchType[]>([]);

  // Track viewer count for this match
  useViewerTracking(matchId);

  // Use enhanced stream player hook for comprehensive stream management
  const {
    currentStream: stream,
    streamLoading: loadingStream,
    activeSource,
    allStreams,
    handleSourceChange,
    handleMatchSelect
  } = useStreamPlayer();

  // Load match data and streams
  useEffect(() => {
    const loadMatchData = async () => {
      if (!sportId || !matchId) return;

      try {
        setIsLoading(true);
        console.log(`Loading match: ${sportId}/${matchId}`);
        
        // Fetch the specific match
        const matchData = await fetchMatch(sportId, matchId);
        const enhancedMatch = teamLogoService.enhanceMatchWithLogos(matchData);
        setMatch(enhancedMatch);

        // Use the enhanced stream player to load all streams
        await handleMatchSelect(enhancedMatch);

        // Auto-scroll to video player after data loads
        setTimeout(() => {
          const streamElement = document.querySelector('[data-stream-container]') || 
                              document.querySelector('#stream-player') ||
                              document.querySelector('.stream-player');
          if (streamElement) {
            streamElement.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 500);

        // Load all matches for recommended sections
        const allMatches = await fetchMatches(sportId);
        const otherMatches = allMatches.filter(m => m.id !== matchId);
        setAllMatches(allMatches);
        
        // Recommended matches (similar category)
        const recommended = otherMatches
          .filter(m => m.category === matchData.category && m.id !== matchId)
          .slice(0, 6);
        
        // Trending matches (using trending logic)
        const trending = otherMatches
          .filter(m => isTrendingMatch(m.title).isTrending)
          .slice(0, 6);

        setRecommendedMatches(recommended);
        setTrendingMatches(trending);
        
      } catch (error) {
        console.error('Error loading match:', error);
        setMatch(null);
        toast({
          title: "Error loading match",
          description: "Failed to load match details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMatchData();
  }, [sportId, matchId, toast, handleMatchSelect]);

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
      return baseUrl + `?v=${Date.now()}`;
    }
    return 'https://i.imgur.com/m4nV9S8.png';
  };

  const matchPosterUrl = getMatchPosterUrl();

  return (
    <div className="min-h-screen bg-sports-dark text-sports-light">
      <SEOMetaTags
        title={`${matchTitle} - Live Stream | DamiTV`}
        description={`${matchDescription} - Watch ${matchTitle} on damitv.pro with HD quality streaming.`}
        keywords={`${homeTeam} live stream, ${awayTeam} online, ${matchTitle}, ${matchTitle} on damitv.pro, live football streaming`}
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
          { name: `${matchTitle} on damitv.pro`, url: `https://damitv.pro/match/${sportId}/${matchId}` }
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
        <div className="mb-4">
          <TelegramBanner />
        </div>

        <div className="mb-4 sm:mb-6">
          <Advertisement type="banner" className="w-full max-w-full overflow-hidden" />
        </div>
        
        <div className="w-full flex justify-center mb-4">
          <div className="text-center max-w-4xl px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{match.title}</h1>
            <p className="text-sm md:text-base text-gray-400">{matchTitle} on damitv.pro</p>
          </div>
        </div>
        
        <div id="stream-container" data-stream-container>
          <StreamTab
            match={match}
            stream={stream}
            loadingStream={loadingStream}
            activeSource={activeSource}
            handleSourceChange={handleSourceChange}
            popularMatches={[]}
            sportId={sportId || ''}
            allStreams={allStreams}
          />
        </div>

        {/* Match Analysis and Preview Content */}
        <div className="mt-8">
          <MatchAnalysis match={match} />
        </div>

        {/* Recommended Matches */}
        {recommendedMatches.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Similar Matches You Might Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedMatches.map((relatedMatch) => (
                <MatchCard key={relatedMatch.id} match={relatedMatch} />
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