import React from 'react';
import { Sport } from '../types/sports';

interface SportsListProps {
  sports: Sport[];
  onSelectSport: (sportId: string) => void;
  selectedSport: string | null;
  isLoading: boolean;
}

const SportsList: React.FC<SportsListProps> = ({ sports, onSelectSport, selectedSport, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex overflow-x-auto pb-3 gap-2 scrollbar-hide">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-9 w-24 bg-card animate-pulse rounded-lg flex-shrink-0"></div>
        ))}
      </div>
    );
  }

  const allItems = [
    { id: 'all', name: 'All Sports' },
    ...sports
  ];

  return (
    <div className="flex overflow-x-auto pb-3 gap-2 scrollbar-hide">
      {allItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelectSport(item.id)}
          className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm font-medium flex-shrink-0 ${
            selectedSport === item.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
};

export default SportsList;
