import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { Match } from '../types/sports';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Radio, Clock } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { generateCompetitorTitle, generateCompetitorDescription } from '../utils/competitorSEO';
import CompetitorSEOContent from '../components/CompetitorSEOContent';
import { Helmet } from 'react-helmet-async';
import { fetchFootballFromStreamedPk } from '../services/streamSuService';
import { consolidateMatches, filterCleanMatches, isMatchLive, filterActiveMatches } from '../utils/matchUtils';
import MatchSection from '../components/MatchSection';
import LoadingGrid from '../components/LoadingGrid';
import EmptyState from '../components/EmptyState';
import TelegramBanner from '../components/TelegramBanner';
import { useStreamPlayer } from '../hooks/useStreamPlayer';
import FeaturedPlayer from '../components/live/FeaturedPlayer';

const Football2 = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSelectedMatch, setUserSelectedMatch] = useState<boolean>(false);
  
  const {
    featuredMatch,
    currentStream,
    streamLoading,
    activeSource,
    handleMatchSelect,
    handleSourceChange,
    handleStreamRetry,
    setFeaturedMatch,
    fetchStreamData
  } = useStreamPlayer();

  // Fetch Streamed.pk football matches
  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const streamedPkMatches = await fetchFootballFromStreamedPk();
        const cleanMatches = filterActiveMatches(filterCleanMatches(streamedPkMatches));
        const consolidatedMatches = consolidateMatches(cleanMatches);
        setMatches(consolidatedMatches);
      } catch (error) {
        console.error('Error loading Streamed.pk football matches:', error);
        toast({
          title: "Error",
          description: "Failed to load football matches. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [toast]);

  // Filter matches based on search query
  const filteredMatches = matches.filter(match => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return match.title.toLowerCase().includes(query) || 
           match.teams?.home?.name?.toLowerCase().includes(query) || 
           match.teams?.away?.name?.toLowerCase().includes(query);
  });

  // Separate matches into live and upcoming
  const liveMatches = filteredMatches.filter(match => isMatchLive(match));
  const upcomingMatches = filteredMatches.filter(match => !isMatchLive(match));

  // Handle user match selection
  const handleUserMatchSelect = (match: Match) => {
    setUserSelectedMatch(true);
    handleMatchSelect(match);
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim() !== '') {
      toast({
        title: "Searching",
        description: `Finding matches for "${searchQuery}"`,
      });
    }
  };

  const handleRetryLoading = () => {
    window.location.reload();
  };

  return (
    <PageLayout>
      <Helmet>
        <title>{generateCompetitorTitle('Football 2 - Streamed.pk Live Football Matches | Free Streaming', 'live')}</title>
        <meta name="description" content={generateCompetitorDescription('Watch live football matches from Streamed.pk - Free streaming alternative to StreamEast', 'live')} />
        <meta name="keywords" content="streamed.pk football, live football streaming, soccer matches, watch football online, free football streams, streameast alternative" />
        <link rel="canonical" href="https://damitv.pro/football2" />
      </Helmet>
      
      {/* Telegram Banner */}
      <div className="mb-6">
        <TelegramBanner />
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Football 2
            </h1>
            <p className="text-gray-300">
              {loading ? 'Loading...' : `${filteredMatches.length} football matches available`}
            </p>
          </div>
          
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-[#242836] border border-[#343a4d] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#9b87f5] flex-1 sm:w-64"
            />
            <Button type="submit" variant="outline">Search</Button>
          </form>
        </div>
        
        {userSelectedMatch && featuredMatch && (
          <div id="stream-player">
            <FeaturedPlayer
              loading={loading}
              featuredMatch={featuredMatch}
              currentStream={currentStream}
              streamLoading={streamLoading}
              activeSource={activeSource}
              onSourceChange={handleSourceChange}
              onStreamRetry={handleStreamRetry}
              onRetryLoading={handleRetryLoading}
            />
          </div>
        )}
      </div>
      
      <Separator className="my-8 bg-[#343a4d]" />
      
      {loading ? (
        <LoadingGrid />
      ) : filteredMatches.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {/* Live Matches Section */}
          <MatchSection
            matches={liveMatches}
            sportId="football"
            title="Live Football Matches"
            isLive={true}
            showEmptyMessage={liveMatches.length === 0 && upcomingMatches.length > 0}
            emptyMessage="No live football matches available right now."
            onMatchSelect={handleUserMatchSelect}
            preventNavigation={true}
          />
          
          {/* Upcoming Matches Section */}
          <MatchSection
            matches={upcomingMatches}
            sportId="football"
            title="Upcoming Football Matches"
            isLive={false}
            showEmptyMessage={upcomingMatches.length === 0 && liveMatches.length > 0}
            emptyMessage="No upcoming football matches scheduled at this time."
            onMatchSelect={handleUserMatchSelect}
            preventNavigation={true}
          />
        </div>
      )}
      
      <div className="mt-12">
        <Link to="/channels" className="block w-full">
          <div className="bg-[#242836] hover:bg-[#2a2f3f] border border-[#343a4d] rounded-xl p-6 text-center transition-all">
            <Radio className="h-10 w-10 text-[#9b87f5] mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-foreground">Live TV Channels</h3>
            <p className="text-gray-300 mt-2">Access 70+ international sports channels from around the world</p>
            <Button className="mt-4 bg-[#9b87f5] hover:bg-[#8a75e8]">Browse Channels</Button>
          </div>
        </Link>
      </div>
      
      {/* Hidden SEO content for competitor targeting */}
      <CompetitorSEOContent showFAQ={true} showCompetitorMentions={true} />
    </PageLayout>
  );
};

export default Football2;