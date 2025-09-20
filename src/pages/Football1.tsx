import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { Match, Sport } from '../types/sports';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { Radio, Clock } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { generateCompetitorTitle, generateCompetitorDescription } from '../utils/competitorSEO';
import CompetitorSEOContent from '../components/CompetitorSEOContent';
import { Helmet } from 'react-helmet-async';
import { fetchFootballFromPPV } from '../services/ppvService';
import { fetchSports } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, isMatchLive, filterActiveMatches } from '../utils/matchUtils';
import MatchSection from '../components/MatchSection';
import LoadingGrid from '../components/LoadingGrid';
import EmptyState from '../components/EmptyState';
import TelegramBanner from '../components/TelegramBanner';
import SportsList from '../components/SportsList';
import { useStreamPlayer } from '../hooks/useStreamPlayer';
import FeaturedPlayer from '../components/live/FeaturedPlayer';

const Football1 = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSelectedMatch, setUserSelectedMatch] = useState<boolean>(false);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  
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

  // Fetch sports for navigation
  useEffect(() => {
    const loadSports = async () => {
      try {
        const sportsData = await fetchSports();
        setSports(sportsData);
      } catch (error) {
        console.error('Error loading sports:', error);
      } finally {
        setLoadingSports(false);
      }
    };
    loadSports();
  }, []);

  // Fetch PPV football matches
  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const ppvMatches = await fetchFootballFromPPV();
        const cleanMatches = filterActiveMatches(filterCleanMatches(ppvMatches));
        const consolidatedMatches = consolidateMatches(cleanMatches);
        setMatches(consolidatedMatches);
      } catch (error) {
        console.error('Error loading PPV football matches:', error);
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

  // Handle sport selection from navigation (redirects to home page with sport selected)
  const handleSelectSport = (sportId: string) => {
    if (sportId === 'football1') return; // Already on this page
    if (sportId === 'football2') {
      window.location.href = '/football2';
      return;
    }
    // For other sports, redirect to home page with sport selected
    window.location.href = `/?sport=${sportId}`;
  };

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
        <title>{generateCompetitorTitle('Football 1 - PPV.to Live Football Matches | Free Streaming', 'live')}</title>
        <meta name="description" content={generateCompetitorDescription('Watch live football matches from PPV.to - Free streaming alternative to TotalSportek', 'live')} />
        <meta name="keywords" content="ppv.to football, live football streaming, soccer matches, watch football online, free football streams, totalsportek alternative" />
        <link rel="canonical" href="https://damitv.pro/football1" />
      </Helmet>
      
      {/* Telegram Banner */}
      <div className="mb-6">
        <TelegramBanner />
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Football 1
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
      
      {/* Sports Navigation */}
      <div className="mb-8">
        <SportsList 
          sports={sports}
          onSelectSport={handleSelectSport}
          selectedSport="football1"
          isLoading={loadingSports}
        />
      </div>
      
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

export default Football1;