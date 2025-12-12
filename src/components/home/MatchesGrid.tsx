import { TrendingUp } from 'lucide-react';
import { CombinedMatch } from '@/services/combinedSportsService';
import FanCodeMatchCard from './FanCodeMatchCard';

interface Props {
  matches: CombinedMatch[];
  loading: boolean;
}

const MatchesGrid = ({ matches, loading }: Props) => {
  const liveMatches = matches.filter(m => m.isLive);
  const upcomingMatches = matches.filter(m => !m.isLive);

  if (loading) {
    return (
      <div className="space-y-10">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <h2 className="text-xl font-bold text-foreground">Live Now</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        </section>
        
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Upcoming</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <h2 className="text-xl font-bold text-foreground">Live Now</h2>
            <span className="text-muted-foreground text-sm ml-2">
              {liveMatches.length} {liveMatches.length === 1 ? 'match' : 'matches'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {liveMatches.map(match => (
              <FanCodeMatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Matches Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Upcoming</h2>
          <span className="text-muted-foreground text-sm ml-2">
            {upcomingMatches.length} {upcomingMatches.length === 1 ? 'match' : 'matches'}
          </span>
        </div>
        
        {upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {upcomingMatches.map(match => (
              <FanCodeMatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl">
            <p className="text-muted-foreground">No upcoming matches in this category</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default MatchesGrid;
