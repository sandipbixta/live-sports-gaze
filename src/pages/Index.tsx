
import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { Sport, Match } from '../types/sports';
import { fetchSports, fetchMatches } from '../api/sportsApi';
import SportsList from '../components/SportsList';
import MatchesList from '../components/MatchesList';
import { Separator } from '../components/ui/separator';

const Index = () => {
  const { toast } = useToast();
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Fetch sports on mount
  useEffect(() => {
    const loadSports = async () => {
      setLoadingSports(true);
      try {
        const sportsData = await fetchSports();
        setSports(sportsData);
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

  // Fetch matches when a sport is selected
  const handleSelectSport = async (sportId: string) => {
    setSelectedSport(sportId);
    setLoadingMatches(true);
    
    try {
      const matchesData = await fetchMatches(sportId);
      setMatches(matchesData);
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
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-950 text-white shadow-md">
        <div className="container py-6">
          <h1 className="text-3xl font-bold">Live Sports Streaming</h1>
          <p className="text-gray-400 mt-2">Watch your favorite sports events live</p>
        </div>
      </header>
      
      <main className="container py-6">
        <SportsList 
          sports={sports}
          onSelectSport={handleSelectSport}
          selectedSport={selectedSport}
          isLoading={loadingSports}
        />
        
        {(selectedSport || loadingMatches) && (
          <>
            <Separator className="my-4 bg-gray-800" />
            <MatchesList
              matches={matches}
              sportId={selectedSport || ""}
              isLoading={loadingMatches}
            />
          </>
        )}
      </main>
      
      <footer className="bg-gray-950 text-gray-400 py-6 mt-auto">
        <div className="container text-center">
          <p>© 2025 Live Sports Streaming - All rights reserved</p>
          <p className="text-sm text-gray-500 mt-2">
            This service is for demonstration purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
