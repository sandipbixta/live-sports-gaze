import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import TopEmbedVerticalCard from './TopEmbedVerticalCard';
import { Separator } from './ui/separator';
import { fetchTopEmbedMatches, ProcessedTopEmbedMatch, isTopEmbedMatchLive } from '@/services/topEmbedApiService';

const TopEmbedMatches: React.FC = () => {
  const [matches, setMatches] = useState<ProcessedTopEmbedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const fetchedMatches = await fetchTopEmbedMatches();
        // Filter to show only live matches
        const liveMatches = fetchedMatches.filter(isTopEmbedMatchLive);
        setMatches(liveMatches);
        setError(null);
      } catch (err) {
        setError('Failed to load matches');
        console.error('Error loading TopEmbed matches:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadMatches, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleMatchClick = (match: ProcessedTopEmbedMatch) => {
    if (match.channels.length > 0) {
      // Open the first available channel
      window.open(match.channels[0], '_blank');
    }
  };

  if (loading) {
    return (
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Play className="h-6 w-6 text-[#ff5a36]" />
            Live Football Matches
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[280px] bg-slate-700/50 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || matches.length === 0) {
    return null;
  }

  // Remove duplicates based on match teams and time
  const uniqueMatches = matches.filter((match, index, self) => 
    index === self.findIndex(m => 
      m.teams.home === match.teams.home && 
      m.teams.away === match.teams.away && 
      Math.abs(m.date - match.date) < 60000 // Within 1 minute
    )
  );

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Play className="h-6 w-6 text-[#ff5a36]" />
          Live Football Matches
        </h2>
        <span className="text-sm bg-[#242836] border border-[#343a4d] rounded-lg px-3 py-1 text-white">
          {uniqueMatches.length} live
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {uniqueMatches.map((match) => (
          <TopEmbedVerticalCard
            key={match.id}
            match={match}
            onClick={() => handleMatchClick(match)}
          />
        ))}
      </div>
      <Separator className="my-8 bg-[#343a4d]" />
    </div>
  );
};

export default TopEmbedMatches;