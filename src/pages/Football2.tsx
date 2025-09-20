import React, { useEffect, useState, useMemo } from 'react';
import { useToast } from '../hooks/use-toast';
import { Match } from '../types/sports';
import { fetchFootballFromStreamed } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, filterActiveMatches } from '../utils/matchUtils';
import MatchesList from '../components/MatchesList';
import SportsList from '../components/SportsList';
import PageLayout from '../components/PageLayout';
import { Helmet } from 'react-helmet-async';
import SEOMetaTags from '../components/SEOMetaTags';
import Advertisement from '../components/Advertisement';

const Football2 = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create a mock sports array for the navigation
  const mockSports = [
    { id: 'football', name: 'Football' },
    { id: 'basketball', name: 'Basketball' },
    { id: 'tennis', name: 'Tennis' },
    { id: 'baseball', name: 'Baseball' },
    { id: 'mma', name: 'MMA' },
    { id: 'boxing', name: 'Boxing' }
  ];

  // Filter matches based on search term
  const filteredMatches = useMemo(() => {
    if (!searchTerm.trim()) return matches;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return matches.filter(match => {
      return match.title.toLowerCase().includes(lowercaseSearch) || 
        match.teams?.home?.name?.toLowerCase().includes(lowercaseSearch) ||
        match.teams?.away?.name?.toLowerCase().includes(lowercaseSearch);
    });
  }, [matches, searchTerm]);

  // Load Football 2 matches on mount
  useEffect(() => {
    const loadMatches = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Loading Football 2 matches from Streamed API...');
        
        const rawMatches = await fetchFootballFromStreamed();
        console.log('📥 Raw Football 2 matches:', rawMatches.length);
        
        // Filter and consolidate matches
        const cleanMatches = filterActiveMatches(filterCleanMatches(rawMatches));
        console.log('🧹 Clean active matches:', cleanMatches.length);
        const consolidatedMatches = consolidateMatches(cleanMatches);
        console.log('🔗 Consolidated matches:', consolidatedMatches.length);
        
        setMatches(consolidatedMatches);
        
      } catch (error) {
        console.error('Error loading Football 2 matches:', error);
        toast({
          title: "Error",
          description: "Failed to load Football 2 matches.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, [toast]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectSport = (sportId: string) => {
    // Navigate to home page with the selected sport
    if (sportId === 'football2') {
      // Already on Football 2 page, do nothing
      return;
    } else if (sportId === 'all') {
      window.location.href = '/';
    } else {
      window.location.href = `/?sport=${sportId}`;
    }
  };

  return (
    <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
      <Helmet>
        <title>Football 2 - Free Live Football Streaming | DamiTV</title>
        <meta name="description" content="Watch free live Football 2 matches streaming online at DamiTV. HD quality football streams from Streamed API without registration." />
        <meta name="keywords" content="football 2 streaming, live football matches, free football streams, football 2 online, streamed api football" />
        <link rel="canonical" href="https://www.damitv.pro/football2" />
      </Helmet>
      
      <SEOMetaTags 
        title="Football 2 - Free Live Football Streaming"
        description="Watch free live Football 2 matches streaming online at DamiTV. HD quality football streams from Streamed API without registration."
      />

      <main className="py-4">
        {/* Sports Navigation */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Featured Sports</h2>
          </div>
          
          <SportsList 
            sports={mockSports}
            onSelectSport={handleSelectSport}
            selectedSport="football2"
            isLoading={false}
          />
        </div>

        {/* Advertisement */}
        <div className="mb-6">
          <Advertisement type="banner" />
        </div>

        {/* Football 2 Matches Section */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-foreground">
              ⚽ Football 2 (Streamed API)
            </h1>
            <p className="text-gray-400 text-sm mt-2">
              {filteredMatches.length} football matches available from Streamed API
            </p>
          </div>
          
          <MatchesList
            matches={filteredMatches}
            sportId="football2"
            isLoading={isLoading}
          />
        </div>

        {/* SEO Content */}
        <section className="mb-8">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-semibold text-foreground mb-4">About Football 2 Streaming</h2>
            <p className="text-muted-foreground mb-4">
              Football 2 on DamiTV provides access to live football matches through the Streamed API. 
              Watch high-quality football streams from various leagues and tournaments around the world. 
              Our Football 2 section offers an alternative source for football streaming with different 
              match coverage and streaming options.
            </p>
            <p className="text-muted-foreground mb-4">
              All Football 2 matches are streamed in HD quality when available, with multiple stream 
              sources for reliable viewing. No registration required - simply click on any match to 
              start watching live football action.
            </p>
          </div>
        </section>
      </main>
    </PageLayout>
  );
};

export default Football2;