import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { Match, Stream, Source } from '../types/sports';
import { fetchMatches, fetchStream, fetchSports } from '../api/sportsApi';
import { Separator } from '../components/ui/separator';
import { Button } from '../components/ui/button';
import StreamPlayer from '../components/StreamPlayer';
import { Link } from 'react-router-dom';
import { Radio, Tv, RefreshCcw, Calendar, Search } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import MatchCard from '../components/MatchCard';
import SearchBar from '../components/SearchBar';
import { useIsMobile } from '../hooks/use-mobile';

const Live = () => {
  const { toast } = useToast();
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredMatch, setFeaturedMatch] = useState<Match | null>(null);
  const [currentStream, setCurrentStream] = useState<Stream | null>(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSource, setActiveSource] = useState<string | null>(null);
  
  // Determine if we're on mobile
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchLiveContent = async () => {
      setLoading(true);
      try {
        console.log('Fetching live matches...');
        // Get sports data to show proper sport names
        const sports = await fetchSports();
        console.log('Sports data:', sports);
        
        // Fetch from multiple sports to find live matches
        const sportIds = ['1', '2', '3', '4', 'football', 'basketball', 'hockey']; // Extended sport IDs
        let allLiveMatches: Match[] = [];
        
        for (const sportId of sportIds) {
          console.log(`Fetching matches for sport ID: ${sportId}`);
          const matches = await fetchMatches(sportId);
          console.log(`Matches for ${sportId}:`, matches ? matches.length : 0);
          
          // Filter for matches with sources (live streams)
          const livesFromSport = matches.filter(match => 
            match.sources && match.sources.length > 0);
          // Add sport ID as a property to each match for reference
          const matchesWithSportId = livesFromSport.map(match => ({
            ...match,
            sportId
          }));
          allLiveMatches = [...allLiveMatches, ...matchesWithSportId];
        }
        
        console.log('All live matches before filtering:', allLiveMatches.length);
        
        // Filter out advertisement matches (like Sky Sports News)
        allLiveMatches = allLiveMatches.filter(match => 
          !match.title.toLowerCase().includes('sky sports news') && 
          !match.id.includes('sky-sports-news')
        );
        
        console.log('Live matches after filtering:', allLiveMatches.length);
        setLiveMatches(allLiveMatches);
        setFilteredMatches(allLiveMatches);
        
        // Set featured match (first one with sources)
        if (allLiveMatches.length > 0) {
          setFeaturedMatch(allLiveMatches[0]);
          
          // Fetch the stream for the featured match
          if (allLiveMatches[0].sources && allLiveMatches[0].sources.length > 0) {
            loadStream(allLiveMatches[0].sources[0]);
          }
        } else {
          setFeaturedMatch(null);
          setCurrentStream(null);
        }
      } catch (error) {
        console.error('Error fetching live content:', error);
        toast({
          title: "Error",
          description: "Failed to load live content. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLiveContent();
  }, [toast, retryCount]);

  // Update filtered matches when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMatches(liveMatches);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = liveMatches.filter(match => 
        match.title.toLowerCase().includes(query) || 
        match.teams?.home?.name?.toLowerCase().includes(query) || 
        match.teams?.away?.name?.toLowerCase().includes(query)
      );
      setFilteredMatches(filtered);
    }
  }, [searchQuery, liveMatches]);

  // Function to load stream from a source
  const loadStream = async (source: Source) => {
    setStreamLoading(true);
    setActiveSource(`${source.source}/${source.id}`);
    try {
      const stream = await fetchStream(source.source, source.id);
      setCurrentStream(stream);
      // Scroll to player if not in view
      const playerElement = document.getElementById('stream-player');
      if (playerElement) {
        playerElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (error) {
      console.error('Error loading stream:', error);
      toast({
        title: "Error",
        description: "Failed to load stream.",
        variant: "destructive",
      });
      setCurrentStream(null);
    } finally {
      setStreamLoading(false);
    }
  };

  // Function to handle match selection
  const handleMatchSelect = (match: Match) => {
    setFeaturedMatch(match);
    if (match.sources && match.sources.length > 0) {
      loadStream(match.sources[0]);
    } else {
      setCurrentStream(null);
      toast({
        title: "No Stream",
        description: "This match has no available streams.",
        variant: "destructive",
      });
    }
  };

  // Function to retry loading content
  const handleRetryLoading = () => {
    setRetryCount(prev => prev + 1);
  };

  // Function to handle source change for the current match
  const handleSourceChange = (source: string, id: string) => {
    if (featuredMatch) {
      loadStream({ source, id });
    }
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // The filtering is already handled by the useEffect
    
    // Show a toast to confirm search
    if (searchQuery.trim() !== '') {
      toast({
        title: "Searching",
        description: `Finding matches for "${searchQuery}"`,
      });
    }
  };

  return (
    <PageLayout>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
          <h1 className="text-3xl font-bold text-white">Live Now</h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSubmit={handleSearchSubmit}
              placeholder="Search live games..."
              className="w-full sm:w-64"
              showButton={true}
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#242836] px-3 py-1.5 rounded-full">
                <Tv size={16} className="text-[#fa2d04] animate-pulse" />
                <span className="text-sm font-medium text-white">{filteredMatches.length} Live Broadcasts</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[#242836] border-[#343a4d] hover:bg-[#2a2f3f]"
                onClick={handleRetryLoading}
              >
                <RefreshCcw size={14} className="mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
        
        <div id="stream-player">
          {loading ? (
            <div className="w-full bg-[#242836] rounded-xl p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5] mx-auto"></div>
              <p className="mt-4 text-gray-300">Loading live streams...</p>
            </div>
          ) : featuredMatch ? (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">{featuredMatch.title}</h2>
                {streamLoading ? (
                  <div className="text-sm text-[#9b87f5] flex items-center gap-1">
                    <span className="inline-block h-2 w-2 bg-[#9b87f5] rounded-full animate-pulse"></span>
                    Loading stream...
                  </div>
                ) : currentStream ? (
                  <div className="text-sm text-[#fa2d04] flex items-center gap-1">
                    <span className="inline-block h-2 w-2 bg-[#fa2d04] rounded-full animate-pulse"></span>
                    Live now
                  </div>
                ) : null}
              </div>
              <StreamPlayer 
                stream={currentStream} 
                isLoading={streamLoading} 
              />
              
              {/* Stream Sources */}
              {featuredMatch.sources && featuredMatch.sources.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold mb-4 text-white">Stream Sources</h3>
                  <div className="flex flex-wrap gap-3">
                    {featuredMatch.sources.map(({ source, id }) => (
                      <Button
                        key={`${source}-${id}`}
                        variant="outline"
                        size="sm"
                        className={`${
                          activeSource === `${source}/${id}` 
                            ? 'bg-[#343a4d] border-[#9b87f5]' 
                            : 'bg-[#242836] border-[#343a4d]'
                        } text-white`}
                        onClick={() => handleSourceChange(source, id)}
                      >
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full bg-[#242836] rounded-xl p-12 text-center">
              <Tv size={48} className="text-[#343a4d] mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-2">No live streams available at the moment.</p>
              <p className="text-gray-400 text-sm mb-4">Check back later or view scheduled matches.</p>
              <div className="flex gap-4 justify-center mt-2">
                <Button onClick={handleRetryLoading} className="bg-[#9b87f5] hover:bg-[#8a75e8]">
                  <RefreshCcw size={16} className="mr-2" />
                  Refresh
                </Button>
                <Link to="/schedule">
                  <Button variant="outline" className="bg-transparent border border-[#343a4d]">
                    <Calendar size={16} className="mr-2" />
                    View Schedule
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Separator className="my-8 bg-[#343a4d]" />
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            All Live Matches
            {filteredMatches.length > 0 && (
              <span className="inline-block h-2 w-2 bg-[#fa2d04] rounded-full animate-pulse"></span>
            )}
          </div>
          {searchQuery && (
            <div className="text-sm text-gray-300">
              {filteredMatches.length === 0 ? 'No matches found' : `Found ${filteredMatches.length} matches`}
            </div>
          )}
        </h2>
        {loading ? (
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-36 bg-[#242836] rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4`}>
            {filteredMatches.map((match) => (
              <div 
                key={match.id} 
                className="cursor-pointer"
                onClick={() => handleMatchSelect(match)}
              >
                <MatchCard 
                  match={match}
                  sportId={match.sportId || "1"}
                  onClick={() => handleMatchSelect(match)}
                  preventNavigation={true} // This prevents navigation to match page
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full bg-[#242836] rounded-xl p-8 text-center">
            {searchQuery ? (
              <div>
                <Search size={40} className="mx-auto mb-3 text-gray-400" />
                <p className="text-gray-300 mb-3">No matches found for "{searchQuery}"</p>
                <Button onClick={() => setSearchQuery('')} size="sm" className="bg-[#9b87f5] hover:bg-[#8a75e8]">
                  Clear Search
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-300 mb-3">No live matches currently available.</p>
                <Button onClick={handleRetryLoading} size="sm" className="bg-[#9b87f5] hover:bg-[#8a75e8]">
                  <RefreshCcw size={14} className="mr-1" />
                  Refresh
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Link to="/channels" className="block w-full">
        <div className="bg-[#242836] hover:bg-[#2a2f3f] border border-[#343a4d] rounded-xl p-6 text-center transition-all">
          <Radio className="h-10 w-10 text-[#9b87f5] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white">Live TV Channels</h3>
          <p className="text-gray-300 mt-2">Access 70+ international sports channels from around the world</p>
          <Button className="mt-4 bg-[#9b87f5] hover:bg-[#8a75e8]">Browse Channels</Button>
        </div>
      </Link>
    </PageLayout>
  );
};

export default Live;
