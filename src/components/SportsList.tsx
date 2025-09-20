
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
  // Featured sports that link to other pages
  const featuredSports = [
    { id: 'football1', name: 'Football 1', path: '/football1', icon: Tv2 },
    { id: 'football2', name: 'Football 2', path: '/football2', icon: Zap }
  ];

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

  return (
    <div>
      {/* Mobile: horizontal scroll */}
      <div className="flex overflow-x-auto pb-3 space-x-3 scrollbar-none lg:hidden">
        {/* All Sports button */}
        <Button
          onClick={() => onSelectSport('all')}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-sm flex-shrink-0 ${
            selectedSport === 'all'
              ? 'bg-[#ff5a36] text-white shadow-lg shadow-[#ff5a36]/20'
              : 'bg-[#242836] text-white hover:bg-[#343a4d]'
          }`}
          variant={selectedSport === 'all' ? "default" : "outline"}
        >
          All Sports
        </Button>
        
        {sports.map((sport) => (
          <Button
            key={sport.id}
            onClick={() => onSelectSport(sport.id)}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-sm flex-shrink-0 ${
              selectedSport === sport.id
                ? 'bg-[#ff5a36] text-white shadow-lg shadow-[#ff5a36]/20'
                : 'bg-[#242836] text-white hover:bg-[#343a4d]'
            }`}
            variant={selectedSport === sport.id ? "default" : "outline"}
          >
            {sport.name}
          </Button>
        ))}

        {/* Featured Sports */}
        {featuredSports.map((sport) => {
          const IconComponent = sport.icon;
          return (
            <Link key={sport.id} to={sport.path}>
              <Button
                className="px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-sm flex-shrink-0 bg-[#242836] text-white hover:bg-[#343a4d] flex items-center gap-2"
                variant="outline"
              >
                <IconComponent className="h-4 w-4" />
                {sport.name}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Desktop: grid  */}
      <div className="hidden lg:grid lg:grid-cols-10 gap-2">
        {/* All Sports button */}
        <Button
          onClick={() => onSelectSport('all')}
          className={`px-3 py-1.5 rounded-lg transition-all text-sm truncate ${
            selectedSport === 'all'
              ? 'bg-[#ff5a36] text-white shadow-lg shadow-[#ff5a36]/20'
              : 'bg-[#242836] text-white hover:bg-[#343a4d]'
          }`}
          variant={selectedSport === 'all' ? "default" : "outline"}
        >
          All Sports
        </Button>
        
        {sports.map((sport) => (
          <Button
            key={sport.id}
            onClick={() => onSelectSport(sport.id)}
            className={`px-3 py-1.5 rounded-lg transition-all text-sm truncate ${
              selectedSport === sport.id
                ? 'bg-[#ff5a36] text-white shadow-lg shadow-[#ff5a36]/20'
                : 'bg-[#242836] text-white hover:bg-[#343a4d]'
            }`}
            variant={selectedSport === sport.id ? "default" : "outline"}
          >
            {sport.name}
          </Button>
        ))}

        {/* Featured Sports */}
        {featuredSports.map((sport) => {
          const IconComponent = sport.icon;
          return (
            <Link key={sport.id} to={sport.path}>
              <Button
                className="px-3 py-1.5 rounded-lg transition-all text-sm truncate bg-[#242836] text-white hover:bg-[#343a4d] flex items-center gap-2"
                variant="outline"
              >
                <IconComponent className="h-4 w-4" />
                <span className="truncate">{sport.name}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SportsList;
