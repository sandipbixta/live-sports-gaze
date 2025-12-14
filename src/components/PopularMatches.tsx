import { Link } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import { usePopularMatches } from '@/hooks/usePopularMatches';
import MatchCard from './MatchCard';

const PopularMatches = () => {
  const { data: matches, isLoading } = usePopularMatches();

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-foreground">POPULAR</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl aspect-video animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!matches || matches.length === 0) return null;

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          <h2 className="text-2xl font-bold text-foreground">POPULAR</h2>
          <span className="text-muted-foreground text-sm ml-2">Top matches right now</span>
        </div>
        <Link 
          to="/live"
          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Matches Grid - Using existing MatchCard component */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {matches.slice(0, 12).map((match) => (
          <MatchCard 
            key={match.id} 
            match={match}
            sportId={match.category}
          />
        ))}
      </div>
    </section>
  );
};

export default PopularMatches;
