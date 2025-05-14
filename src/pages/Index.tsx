
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Sport, Match } from '../types/sports';
import { fetchSports, fetchMatches } from '../api/sportsApi';
import SportsList from '../components/SportsList';
import MatchesList from '../components/MatchesList';
import { Separator } from '../components/ui/separator';
import { Search, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import MainNav from '../components/MainNav';
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
        const popular = allMatches[sportId].filter(match => isPopularLeague(match.title));
        setPopularMatches(popular);
      } else {
        const matchesData = await fetchMatches(sportId);
        setMatches(matchesData);
        setFilteredMatches(matchesData);
        
        // Find popular matches from major leagues
        const popular = matchesData.filter(match => isPopularLeague(match.title));
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
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      <header className="bg-[#151922] shadow-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <MainNav />
            <div className="flex items-center space-x-4">
              <div className="relative md:flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type="text" 
                  placeholder="Search events..." 
                  className="bg-[#242836] border border-[#343a4d] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#9b87f5] w-64 text-white"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button className="bg-[#9b87f5] hover:bg-[#8a75e8] text-white">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
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
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6 text-white">Popular Games</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularMatches.slice(0, 6).map((match) => {
                  const homeBadge = match.teams?.home?.badge 
                    ? `https://streamed.su/api/images/badge/${match.teams.home.badge}.webp` 
                    : '';
                  const awayBadge = match.teams?.away?.badge 
                    ? `https://streamed.su/api/images/badge/${match.teams.away.badge}.webp` 
                    : '';
                  const home = match.teams?.home?.name || 'Team A';
                  const away = match.teams?.away?.name || 'Team B';
                  
                  return (
                    <Link to={`/match/${selectedSport}/${match.id}`} key={`popular-${match.id}`} className="group">
                      <div className="bg-[#242836] border border-[#9b87f5]/30 rounded-xl p-4 h-full hover:shadow-lg hover:shadow-[#9b87f5]/10 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-center mb-4">
                          <div className="flex flex-col items-center">
                            {homeBadge ? (
                              <img 
                                src={homeBadge} 
                                alt={home} 
                                className="w-10 h-10 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-[#343a4d] rounded-full flex items-center justify-center">
                                <span className="font-bold text-white">{home.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mx-4">
                            <span className="text-sm text-gray-300">vs</span>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            {awayBadge ? (
                              <img 
                                src={awayBadge} 
                                alt={away} 
                                className="w-10 h-10 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-[#343a4d] rounded-full flex items-center justify-center">
                                <span className="font-bold text-white">{away.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <h3 className="font-bold text-center text-white">{match.title}</h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
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
      
      <footer className="bg-[#151922] text-gray-300 py-10 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-white mb-4">DAMITV</h4>
              <p className="text-sm">Your premium destination for live sports streaming.</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Sports</h5>
              <ul className="space-y-2 text-sm">
                <li>Football</li>
                <li>Basketball</li>
                <li>Tennis</li>
                <li>Racing</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Help</h5>
              <ul className="space-y-2 text-sm">
                <li>FAQ</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Follow Us</h5>
              <div className="flex space-x-4">
                <div className="w-8 h-8 rounded-full bg-[#343a4d] flex items-center justify-center">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#343a4d] flex items-center justify-center">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#343a4d] flex items-center justify-center">
                  <span className="sr-only">YouTube</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd"></path></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#343a4d] mt-8 pt-8 text-center text-sm">
            <p>© 2025 DAMITV - All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
