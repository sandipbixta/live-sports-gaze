
import React from 'react';
import { Sport } from '../types/sports';
import { Button } from './ui/button';

interface SportsListProps {
  sports: Sport[];
  onSelectSport: (sportId: string) => void;
  selectedSport: string | null;
  isLoading: boolean;
}

const SportsList: React.FC<SportsListProps> = ({ sports, onSelectSport, selectedSport, isLoading }) => {
  if (isLoading) {
    return (
      <div>
        <div className="flex overflow-x-auto pb-3 space-x-3 scrollbar-none">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-32 h-10 bg-[#242836] animate-pulse rounded-lg flex-shrink-0"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex overflow-x-auto pb-3 space-x-3 scrollbar-none">
        {sports.map((sport) => (
          <Button
            key={sport.id}
            onClick={() => onSelectSport(sport.id)}
            className={`px-6 py-2 rounded-lg transition-all whitespace-nowrap ${
              selectedSport === sport.id
                ? 'bg-[#fa2d04] text-white shadow-lg shadow-[#fa2d04]/20'
                : 'bg-[#242836] text-white hover:bg-[#343a4d]'
            }`}
            variant={selectedSport === sport.id ? "default" : "outline"}
          >
            {sport.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SportsList;
