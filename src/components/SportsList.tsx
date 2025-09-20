
import React from 'react';
import { Link } from 'react-router-dom';
import { Sport } from '../types/sports';
import { Button } from './ui/button';
import { Tv2, Zap } from 'lucide-react';

interface SportsListProps {
  sports: Sport[];
  onSelectSport: (sportId: string) => void;
  selectedSport: string | null;
  isLoading: boolean;
}

const SportsList: React.FC<SportsListProps> = ({ sports, onSelectSport, selectedSport, isLoading }) => {
  // Create the ordered sports list with Football 1 and Football 2
  const createOrderedSports = () => {
    const orderedSports: (Sport | { id: string; name: string; path?: string; icon?: any })[] = [];
    
    // Add All Sports first
    orderedSports.push({ id: 'all', name: 'All Sports' });
    
    // Add Football 1 and Football 2
    orderedSports.push({ id: 'football1', name: 'Football 1', path: '/football1', icon: Tv2 });
    orderedSports.push({ id: 'football2', name: 'Football 2', path: '/football2', icon: Zap });
    
    // Define the desired order for regular sports
    const sportOrder = ['afl', 'american-football', 'baseball', 'cricket', 'fight', 'motor-sports', 'rugby', 'tennis', 'other'];
    
    // Add regular sports in the specified order
    sportOrder.forEach(sportId => {
      const sport = sports.find(s => s.id === sportId);
      if (sport) {
        orderedSports.push(sport);
      }
    });
    
    // Add any remaining sports that weren't in the predefined order
    sports.forEach(sport => {
      if (!sportOrder.includes(sport.id) && !orderedSports.find(s => s.id === sport.id)) {
        orderedSports.push(sport);
      }
    });
    
    return orderedSports;
  };

  const orderedSports = createOrderedSports();

  if (isLoading) {
    return (
      <div>
        {/* Mobile: horizontal scroll */}
        <div className="flex overflow-x-auto pb-3 space-x-3 scrollbar-none lg:hidden">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="w-32 h-8 bg-[#242836] animate-pulse rounded-lg flex-shrink-0"></div>
          ))}
        </div>
        {/* Desktop: grid */}
        <div className="hidden lg:grid lg:grid-cols-10 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="h-8 bg-[#242836] animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const renderSportButton = (sport: any, isMobile: boolean = false) => {
    const isSelected = selectedSport === sport.id;
    const baseClasses = `px-3 py-1.5 rounded-lg transition-all text-sm ${
      isMobile ? 'whitespace-nowrap flex-shrink-0' : 'truncate'
    } ${
      isSelected
        ? 'bg-[#ff5a36] text-white shadow-lg shadow-[#ff5a36]/20'
        : 'bg-[#242836] text-white hover:bg-[#343a4d]'
    }`;

    // Handle Football 1 and Football 2 (with paths)
    if (sport.path) {
      const IconComponent = sport.icon;
      return (
        <Link key={sport.id} to={sport.path}>
          <Button
            className={`${baseClasses} flex items-center gap-2`}
            variant="outline"
          >
            {IconComponent && <IconComponent className="h-4 w-4" />}
            {isMobile ? sport.name : <span className="truncate">{sport.name}</span>}
          </Button>
        </Link>
      );
    }

    // Handle regular sports and All Sports
    return (
      <Button
        key={sport.id}
        onClick={() => onSelectSport(sport.id)}
        className={baseClasses}
        variant={isSelected ? "default" : "outline"}
      >
        {isMobile ? sport.name : <span className="truncate">{sport.name}</span>}
      </Button>
    );
  };

  return (
    <div>
      {/* Mobile: horizontal scroll */}
      <div className="flex overflow-x-auto pb-3 space-x-3 scrollbar-none lg:hidden">
        {orderedSports.map((sport) => renderSportButton(sport, true))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden lg:grid lg:grid-cols-10 gap-2">
        {orderedSports.map((sport) => renderSportButton(sport, false))}
      </div>
    </div>
  );
};

export default SportsList;
