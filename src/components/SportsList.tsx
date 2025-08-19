
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
        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-8 bg-[#242836] animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-6 gap-2">
        {/* All Sports button */}
        <Button
          onClick={() => onSelectSport('all')}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-sm ${
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
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-sm ${
              selectedSport === sport.id
                ? 'bg-[#ff5a36] text-white shadow-lg shadow-[#ff5a36]/20'
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
