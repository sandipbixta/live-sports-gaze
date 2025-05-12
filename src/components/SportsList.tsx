
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
      <div className="p-4">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-2 mt-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sports</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
        {sports.map((sport) => (
          <Button
            key={sport.id}
            onClick={() => onSelectSport(sport.id)}
            className={`h-14 transition-colors ${
              selectedSport === sport.id
                ? 'bg-sports-primary text-white'
                : 'bg-white hover:bg-gray-100 text-gray-800'
            } shadow-sm`}
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
