
import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/use-toast';
import { Sport, Match, Stream } from '../types/sports';
import { fetchSports, fetchMatches, fetchStream } from '../api/sportsApi';
import SportsList from '../components/SportsList';
import MatchesList from '../components/MatchesList';
import StreamPlayer from '../components/StreamPlayer';
import { Separator } from '../components/ui/separator';

const Index = () => {
  const { toast } = useToast();
  const [sports, setSports] = useState<Sport[]>([]);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  
  const [loadingSports, setLoadingSports] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);

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
    setSelectedMatch(null);
    setStream(null);
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

  // Load stream when a match is selected
  const handleSelectMatch = async (match: Match) => {
    setSelectedMatch(match);
    setStream(null);
    
    if (match.sources.length > 0) {
      setLoadingStream(true);
      const { source, id } = match.sources[0];
      
      try {
        const streamData = await fetchStream(source, id);
        setStream(streamData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load stream data.",
          variant: "destructive",
        });
      } finally {
        setLoadingStream(false);
      }
    } else {
      toast({
        title: "No Stream",
        description: "No streaming source available for this match.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-sports-dark text-white">
        <div className="container py-6">
          <h1 className="text-3xl font-bold">Live Sports Streaming</h1>
          <p className="text-gray-300 mt-2">Watch your favorite sports events live</p>
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
            <Separator className="my-4" />
            <MatchesList
              matches={matches}
              onSelectMatch={handleSelectMatch}
              isLoading={loadingMatches}
            />
          </>
        )}
        
        {(stream || loadingStream || (selectedMatch && selectedMatch.sources.length > 0)) && (
          <>
            <Separator className="my-4" />
            <StreamPlayer
              stream={stream}
              isLoading={loadingStream}
            />
          </>
        )}
      </main>
      
      <footer className="bg-sports-dark text-white py-6 mt-12">
        <div className="container text-center">
          <p>© 2025 Live Sports Streaming - All rights reserved</p>
          <p className="text-sm text-gray-400 mt-2">
            This service is for demonstration purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
