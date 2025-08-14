import React, { useEffect, useState } from 'react';
import { Match, Sport } from '../types/sports';
import { fetchSports, fetchMatches } from '../api/sportsApi';
import { consolidateMatches, filterCleanMatches, isMatchLive } from '../utils/matchUtils';
import GradientMatchCard from './GradientMatchCard';
import { useToast } from '../hooks/use-toast';
import { Loader2 } from 'lucide-react';

const LiveMatchesSection: React.FC = () => {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAllLiveMatches = async () => {
      try {
        setLoading(true);
        
        // First fetch all sports
        const sports = await fetchSports();
        
        // Fetch matches for each sport and filter for live ones
        const allMatchesPromises = sports.map(async (sport: Sport) => {
          try {
            const matches = await fetchMatches(sport.id);
            const cleanMatches = filterCleanMatches(matches);
            const consolidatedMatches = consolidateMatches(cleanMatches);
            
            // Filter for live matches only
            return consolidatedMatches.filter((match: Match) => isMatchLive(match));
          } catch (error) {
            console.error(`Error fetching matches for ${sport.name}:`, error);
            return [];
          }
        });

        const allLiveMatchesArrays = await Promise.all(allMatchesPromises);
        const allLiveMatches = allLiveMatchesArrays.flat();
        
        // Sort by sport and start time
        const sortedLiveMatches = allLiveMatches.sort((a, b) => {
          // First sort by sport category for consistency
          if (a.category !== b.category) {
            return (a.category || '').localeCompare(b.category || '');
          }
          // Then by date
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        setLiveMatches(sortedLiveMatches);
      } catch (error) {
        console.error('Error fetching live matches:', error);
        toast({
          title: "Error",
          description: "Failed to load live matches.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllLiveMatches();
  }, [toast]);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
          <span className="inline-block h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
          Live Matches
        </h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <span className="ml-2 text-white">Loading live matches...</span>
        </div>
      </div>
    );
  }

  if (liveMatches.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
          <span className="inline-block h-3 w-3 bg-gray-500 rounded-full"></span>
          Live Matches
        </h2>
        <div className="bg-secondary/50 rounded-xl p-6 text-center">
          <p className="text-muted-foreground">No live matches available at the moment.</p>
          <p className="text-muted-foreground text-sm mt-1">Check back later for live sports!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
        <span className="inline-block h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
        Live Matches
        <span className="text-sm bg-secondary border border-border rounded-lg px-2 py-1 text-white">
          {liveMatches.length} live
        </span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {liveMatches.map((match, index) => (
          <GradientMatchCard 
            key={`live-${match.id}-${index}`}
            match={match}
            sportId={match.sportId}
            isPriority={true}
          />
        ))}
      </div>
    </div>
  );
};

export default LiveMatchesSection;