import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Sport, Match } from '../types/sports';
import { fetchSports, fetchMatches } from '../api/sportsApi';
import SportsList from '../components/SportsList';
import MatchesList from '../components/MatchesList';
import PopularMatches from '../components/PopularMatches';
import { Separator } from '../components/ui/separator';
import { Calendar, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import PageLayout from '../components/PageLayout';
import { isPopularLeague } from '../utils/popularLeagues';

const Index = () => {
  const { toast } = useToast();
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [popularMatches, setPopularMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<{[sportId: string]: Match[]}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Fetch sports on mount and sort them with football first
  useEffect(() => {
    const loadSports = async () => {
      setLoadingSports(true);
      try {
        let sportsData = await fetchSports();
        
        // Sort sports to put football first, then basketball
        sportsData = sportsData.sort((a, b) => {
          if (a.name.toLowerCase() === 'football') return -1;
          if (b.name.toLowerCase() === 'football') return 1;
          if (a.name.toLowerCase() === 'basketball') return -1;
          if (b.name.toLowerCase() === 'basketball') return 1;
          return a.name.localeCompare(b.name);
        });
        
        setSports(sportsData);
        
        // Auto-select first sport (should be football after sorting)
        if (sportsData.length > 0) {
          handleSelectSport(sportsData[0].id);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load sports data.",
          variant: "destructive",
        });
      } finally {
        setLoadingSports(false);
      }
    };

    loadSports();
  }, [toast]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      setFilteredMatches(matches);
      return;
    }
    
    const lowercaseSearch = value.toLowerCase();
    const results = matches.filter(match => {
      return match.title.toLowerCase().includes(lowercaseSearch) || 
        match.teams?.home?.name?.toLowerCase().includes(lowercaseSearch) ||
        match.teams?.away?.name?.toLowerCase().includes(lowercaseSearch);
    });
    
    setFilteredMatches(results);
  };

  // Fetch matches when a sport is selected
  const handleSelectSport = async (sportId: string) => {
    setSelectedSport(sportId);
    setLoadingMatches(true);
    
    try {
      // Check if we already have matches for this sport
      if (allMatches[sportId]) {
        setMatches(allMatches[sportId]);
        setFilteredMatches(allMatches[sportId]);
        
        // Find popular matches from major leagues
        const popular = allMatches[sportId].filter(match => 
          isPopularLeague(match.title) && 
          !match.title.toLowerCase().includes('sky sports news') && 
          !match.id.includes('sky-sports-news')
        );
        setPopularMatches(popular);
      } else {
        const matchesData = await fetchMatches(sportId);
        setMatches(matchesData);
        setFilteredMatches(matchesData);
        
        // Find popular matches from major leagues
        const popular = matchesData.filter(match => 
          isPopularLeague(match.title) && 
          !match.title.toLowerCase().includes('sky sports news') && 
          !match.id.includes('sky-sports-news')
        );
        setPopularMatches(popular);
        
        // Store the matches for this sport
        setAllMatches(prev => ({
          ...prev,
          [sportId]: matchesData
        }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load matches data.",
        variant: "destructive",
      });
    } finally {
      setLoadingMatches(false);
    }
  };

  return (
    <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
      <main className="py-4">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Featured Sports</h2>
            <Link to="/schedule">
              <Button variant="outline" className="text-white border-[#343a4d] hover:bg-[#343a4d] bg-transparent">
                <Calendar className="mr-2 h-4 w-4" /> View Schedule
              </Button>
            </Link>
          </div>
          <SportsList 
            sports={sports}
            onSelectSport={handleSelectSport}
            selectedSport={selectedSport}
            isLoading={loadingSports}
          />
        </div>
        
        {popularMatches.length > 0 && (
          <>
            <PopularMatches 
              popularMatches={popularMatches} 
              selectedSport={selectedSport}
            />
            <Separator className="my-8 bg-[#343a4d]" />
          </>
        )}
        
        <div className="mb-8">
          {(selectedSport || loadingMatches) && (
            <MatchesList
              matches={searchTerm ? filteredMatches : matches}
              sportId={selectedSport || ""}
              isLoading={loadingMatches}
            />
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-[#242836] rounded-xl p-6 border border-[#343a4d]">
            <h3 className="text-xl font-bold mb-4 text-white">Live Now</h3>
            <p className="text-gray-300">Discover events happening right now across different sports.</p>
            <Button variant="link" className="mt-4 text-[#9b87f5]">See all live events →</Button>
          </div>
          
          <div className="bg-[#242836] rounded-xl p-6 border border-[#343a4d]">
            <h3 className="text-xl font-bold mb-4 text-white">Coming Up</h3>
            <p className="text-gray-300">Get ready for upcoming matches and tournaments.</p>
            <Button variant="link" className="mt-4 text-[#9b87f5]">See schedule →</Button>
          </div>
        </div>
      </main>
    </PageLayout>
  );
};

export default Index;
