
import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/use-toast';
import { Sport, Match } from '../types/sports';
import { fetchSports, fetchMatches } from '../api/sportsApi';
import SportsList from '../components/SportsList';
import { Separator } from '../components/ui/separator';
import { format, addDays, startOfDay } from 'date-fns';
import MatchesList from '../components/MatchesList';
import PageLayout from '../components/PageLayout';
import PageHeader from '../components/PageHeader';
import DatePagination from '../components/DatePagination';
import PopularMatches from '../components/PopularMatches';
import { isPopularLeague } from '../utils/popularLeagues';

const Schedule = () => {
  const { toast } = useToast();
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [popularMatches, setPopularMatches] = useState<Match[]>([]);
  const [currentDate, setCurrentDate] = useState(startOfDay(new Date())); // Ensure we start at beginning of day
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
  
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Fetch sports on mount
  useEffect(() => {
    const loadSports = async () => {
      setLoadingSports(true);
      try {
        const sportsData = await fetchSports();
        setSports(sportsData);
        
        // Auto-select first sport
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

  // Fetch matches when a sport is selected or date changes
  useEffect(() => {
    if (selectedSport) {
      handleSelectSport(selectedSport);
    }
  }, [currentDate, selectedSport]);

  // Handle sport selection
  const handleSelectSport = async (sportId: string) => {
    setSelectedSport(sportId);
    setLoadingMatches(true);
    
    try {
      const matchesData = await fetchMatches(sportId);
      
      // Filter matches by date
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const filtered = matchesData.filter(match => {
        const matchDate = new Date(match.date);
        return format(matchDate, 'yyyy-MM-dd') === dateStr;
      });
      
      setMatches(filtered);
      
      // Set initial filtered matches
      setFilteredMatches(filtered);
      
      // Identify popular matches from major leagues
      const popular = filtered.filter(match => isPopularLeague(match.title));
      setPopularMatches(popular);
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

  // Handle date navigation
  const navigateDate = (days: number) => {
    setCurrentDate(prev => startOfDay(addDays(prev, days)));
  };

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
        match.teams?.home?.name.toLowerCase().includes(lowercaseSearch) ||
        match.teams?.away?.name.toLowerCase().includes(lowercaseSearch);
    });
    
    setFilteredMatches(results);
  };

  return (
    <PageLayout searchTerm={searchTerm} onSearch={handleSearch}>
      <PageHeader 
        title="Schedule" 
        subtitle="Find upcoming matches and events" 
        currentDate={currentDate}
        showCalendar={false}
      />
      
      <div className="mb-6">
        <DatePagination 
          currentDate={currentDate} 
          setCurrentDate={setCurrentDate} 
          navigateDate={navigateDate} 
        />
      </div>
      
      <div className="mb-8">
        <SportsList 
          sports={sports}
          onSelectSport={handleSelectSport}
          selectedSport={selectedSport}
          isLoading={loadingSports}
        />
      </div>

      <PopularMatches 
        popularMatches={popularMatches}
        selectedSport={selectedSport}
      />

      {popularMatches.length > 0 && (
        <Separator className="my-8 bg-[#343a4d]" />
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
    </PageLayout>
  );
};

export default Schedule;
