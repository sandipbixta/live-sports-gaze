import React, { useState } from 'react';
import { Sport } from '../types/sports';
import { getSportThumbnail, getSportIcon } from '../services/sportsImageService';

interface SportsListProps {
  sports: Sport[];
  onSelectSport: (sportId: string) => void;
  selectedSport: string | null;
  isLoading: boolean;
}

const SportsList: React.FC<SportsListProps> = ({ sports, onSelectSport, selectedSport, isLoading }) => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (isLoading) {
    return (
      <div className="flex overflow-x-auto pb-3 gap-2 scrollbar-hide">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-10 w-28 bg-card animate-pulse rounded-lg flex-shrink-0"></div>
        ))}
      </div>
    );
  }

  const allItems = [
    { id: 'all', name: 'All Sports' },
    ...sports
  ];

  const handleImageError = (sportId: string) => {
    setImageErrors(prev => ({ ...prev, [sportId]: true }));
  };

  return (
    <div className="flex overflow-x-auto pb-3 gap-2 scrollbar-hide">
      {allItems.map((item) => {
        const sportImage = item.id !== 'all' ? getSportThumbnail(item.name || item.id) : null;
        const sportEmoji = getSportIcon(item.name || item.id);
        const showImage = sportImage && !imageErrors[item.id];

        return (
          <button
            key={item.id}
            onClick={() => onSelectSport(item.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap text-sm font-medium flex-shrink-0 ${
              selectedSport === item.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {item.id === 'all' ? (
              <span className="text-base">🏆</span>
            ) : showImage ? (
              <img
                src={sportImage}
                alt={item.name}
                className="w-5 h-5 rounded object-cover"
                onError={() => handleImageError(item.id)}
              />
            ) : (
              <span className="text-base">{sportEmoji}</span>
            )}
            <span>{item.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SportsList;
