import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../hooks/use-toast';
import { Sport, Match } from '../types/sports';
import { fetchSports, fetchMatches, fetchAllMatches } from '../api/sportsApi';
import SportsList from '../components/SportsList';
import { Separator } from '../components/ui/separator';
import { format, startOfDay, isSameDay } from 'date-fns';
import MatchesList from '../components/MatchesList';
import PageLayout from '../components/PageLayout';
import PageHeader from '../components/PageHeader';
import DatePagination from '../components/DatePagination';
import PopularGames from '../components/PopularGames';
import { isPopularLeague } from '../utils/popularLeagues';
import { Helmet } from 'react-helmet-async';
import TelegramBanner from '../components/TelegramBanner';
import SportFilterPills from '../components/live/SportFilterPills';

const Schedule = () => {
  const { toast } = useToast();
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [allSportsMatches, setAllSportsMatches] = useState<Match[]>([]); // All matches from ALL sports
  const [sportMatches, setSportMatches] = useState<Match[]>([]); // Matches for selected sport
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date()));
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [activeTournamentFilter, setActiveTournamentFilter] = useState<string | null>(null);

  // Extract unique dates from ALL sports matches (for date navigation)
  const availableDates = useMemo(() => {
    const dateSet = new Set<string>();
    allSportsMatches.forEach(match => {
      if (match.date) {
        const dateStr = format(startOfDay(new Date(match.date)), 'yyyy-MM-dd');
        dateSet.add(dateStr);
      }
    });
    return Array.from(dateSet)
      .map(d => startOfDay(new Date(d)))
      .sort((a, b) => a.getTime() - b.getTime());
  }, [allSportsMatches]);

  // Filter matches by current date (from selected sport's matches)
  const matchesForDate = useMemo(() => {
    return sportMatches.filter(match => {
      const matchDate = startOfDay(new Date(match.date));
      return isSameDay(matchDate, currentDate);
    });
  }, [sportMatches, currentDate]);

  // Apply search filter
  const filteredMatches = useMemo(() => {
    if (!searchTerm.trim()) return matchesForDate;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return matchesForDate.filter(match => {
      return match.title.toLowerCase().includes(lowercaseSearch) || 
        match.teams?.home?.name?.toLowerCase().includes(lowercaseSearch) ||
        match.teams?.away?.name?.toLowerCase().includes(lowercaseSearch);
    });
  }, [matchesForDate, searchTerm]);

  // Apply tournament filter
  const displayMatches = useMemo(() => {
    if (!activeTournamentFilter) return filteredMatches;
    return filteredMatches.filter(m => m.tournament === activeTournamentFilter);
  }, [filteredMatches, activeTournamentFilter]);

  // Get unique tournaments
  const tournaments = useMemo(() => {
    const tournamentSet = new Set<string>();
    matchesForDate.forEach(match => {
      if (match.tournament) {
        tournamentSet.add(match.tournament);
      }
    });
    return Array.from(tournamentSet).sort();
  }, [matchesForDate]);

  // Popular matches from major leagues
  const popularMatches = useMemo(() => {
    return displayMatches.filter(match => isPopularLeague(match.title));
  }, [displayMatches]);

  // Helper function to remove duplicates
  const removeDuplicatesFromMatches = (matches: Match[]): Match[] => {
    const seen = new Set<string>();
    const uniqueMatches: Match[] = [];
    
    matches.forEach(match => {
      const homeTeam = match.teams?.home?.name || '';
      const awayTeam = match.teams?.away?.name || '';
      const matchDate = format(new Date(match.date), 'yyyy-MM-dd');
      
      const uniqueKey = homeTeam && awayTeam 
        ? `${homeTeam}-vs-${awayTeam}-${matchDate}`.toLowerCase()
        : `${match.title}-${matchDate}`.toLowerCase();
      
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        uniqueMatches.push(match);
      }
    });
    
    return uniqueMatches;
  };

  // Fetch sports and ALL matches on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingSports(true);
      setLoadingMatches(true);
      
      try {
        // Fetch sports list
        const sportsData = await fetchSports();
        setSports(sportsData);
        
        // Fetch ALL matches from all sports to get available dates
        const allMatches = await fetchAllMatches();
        const uniqueAllMatches = removeDuplicatesFromMatches(allMatches);
        setAllSportsMatches(uniqueAllMatches);
        
        // Auto-select first date with matches if today has none
        if (uniqueAllMatches.length > 0) {
          const today = startOfDay(new Date());
          const todayHasMatches = uniqueAllMatches.some(m => 
            isSameDay(startOfDay(new Date(m.date)), today)
          );
          
          if (!todayHasMatches) {
            const futureDates = uniqueAllMatches
              .map(m => startOfDay(new Date(m.date)))
              .filter(d => d >= today)
              .sort((a, b) => a.getTime() - b.getTime());
            
            if (futureDates.length > 0) {
              setCurrentDate(futureDates[0]);
            }
          }
        }
        
        // Auto-select first sport
        if (sportsData.length > 0) {
          setSelectedSport(sportsData[0].id);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load sports data.",
          variant: "destructive",
        });
      } finally {
        setLoadingSports(false);
        setLoadingMatches(false);
      }
    };

    loadInitialData();
  }, [toast]);

  // Fetch matches for selected sport
  useEffect(() => {
    if (!selectedSport) return;
    
    const loadSportMatches = async () => {
      setLoadingMatches(true);
      try {
        const matchesData = await fetchMatches(selectedSport);
        const uniqueMatches = removeDuplicatesFromMatches(matchesData);
        setSportMatches(uniqueMatches);
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

    loadSportMatches();
  }, [selectedSport, toast]);

  // Handle sport selection
  const handleSelectSport = (sportId: string) => {
    setSelectedSport(sportId);
    setActiveTournamentFilter(null);
  };

  // Handle date navigation (fallback for when no available dates)
  const navigateDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(startOfDay(newDate));
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <Helmet>
        <title>Sports Schedule Today - Match Times & Fixtures | DamiTV</title>
        <link rel="canonical" href="https://damitv.pro/schedule" />
        <meta name="description" content="Today's sports schedule with football, basketball, tennis fixtures. Check match times for Premier League, Champions League and more." />
        <meta name="keywords" content="football schedule, live matches today, premier league schedule, champions league schedule, free sports schedule" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:title" content="Football Schedule - Live Matches Today | DamiTV" />
        <meta property="og:description" content="Check today's football schedule with Premier League, Champions League and more live matches" />
        <meta property="og:url" content="https://damitv.pro/schedule" />
        <meta property="og:type" content="website" />
        
        <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://damitv.pro/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Sports Schedule",
                "item": "https://damitv.pro/schedule"
              }
            ]
          }
        `}
        </script>
      </Helmet>
      
      <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Sports Schedule</h1>
          <p className="text-muted-foreground">Find upcoming matches and events across all sports</p>
        </header>
        
        <PageHeader 
          title="" 
          subtitle="" 
          currentDate={currentDate}
          showCalendar={false}
        />
        
        {/* Telegram Banner */}
        <div className="mb-6">
          <TelegramBanner />
        </div>
        
        <div className="mb-6">
          <DatePagination 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate} 
            navigateDate={navigateDate}
            availableDates={availableDates.length > 0 ? availableDates : undefined}
          />
        </div>
        
        <div className="mb-4">
          <SportsList 
            sports={sports}
            onSelectSport={handleSelectSport}
            selectedSport={selectedSport}
            isLoading={loadingSports}
          />
        </div>
        
        {matchesForDate.length > 0 && (
          <div className="mb-6">
            <SportFilterPills
              allMatches={matchesForDate}
              sports={sports}
              activeSportFilter="all"
              onSportFilterChange={() => {}}
              activeTournamentFilter={activeTournamentFilter || 'all'}
              onTournamentFilterChange={(t) => setActiveTournamentFilter(t === 'all' ? null : t)}
            />
          </div>
        )}

        <PopularGames 
          popularMatches={popularMatches}
          selectedSport={selectedSport}
        />

        {popularMatches.length > 0 && (
          <Separator className="my-8 bg-border" />
        )}
        
        <div className="mb-8">
          {(selectedSport || loadingMatches) && (
            <MatchesList
              matches={displayMatches}
              sportId={selectedSport || ""}
              isLoading={loadingMatches}
            />
          )}
        </div>
        
        {/* SEO Content Section */}
        <section className="mt-12 mb-8">
          <div className="prose prose-invert max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Complete Sports Schedule</h2>
                <p className="text-muted-foreground text-sm mb-3">
                  Browse today's complete sports schedule on DamiTV. Check match times and fixtures for football, basketball, tennis and more. Plan your viewing with our <a href="/live" className="text-primary hover:underline">live sports streaming</a> schedule updated daily.
                </p>
                <p className="text-muted-foreground text-sm">
                  Access <a href="/" className="text-primary hover:underline">live streams</a> and <a href="/channels" className="text-primary hover:underline">TV channels</a> for all scheduled matches. As one of the <a href="https://damitv.pro/" className="text-primary hover:underline font-medium">top totalsportek similar sites for live sports</a>, DamiTV ensures you never miss a game.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-3">Schedule Features</h2>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Daily updated match schedules</li>
                  <li>• All time zones supported</li>
                  <li>• Premier League, Champions League, La Liga</li>
                  <li>• NBA, tennis, MMA, boxing schedules</li>
                  <li>• Set reminders for your favorite matches</li>
                  <li>• Direct links to live streams</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </PageLayout>
    </>
  );
};

export default Schedule;

