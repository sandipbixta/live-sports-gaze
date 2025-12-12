import React from 'react';
import { Sport } from '../types/sports';
import { 
  Trophy, 
  Circle,
  Dribbble,
  Flame,
  Target,
  Bike,
  Car,
  Swords,
  Timer
} from 'lucide-react';

interface SportsPillNavProps {
  sports: Sport[];
  selectedSport: string;
  onSelectSport: (sportId: string) => void;
  showAllOption?: boolean;
}

const SportsPillNav: React.FC<SportsPillNavProps> = ({
  sports,
  selectedSport,
  onSelectSport,
  showAllOption = true
}) => {
  const getSportIcon = (sportId: string) => {
    const id = sportId.toLowerCase();
    
    if (id.includes('football') || id.includes('soccer')) return '⚽';
    if (id.includes('basketball') || id === 'nba') return '🏀';
    if (id.includes('nfl') || id.includes('american')) return '🏈';
    if (id.includes('nhl') || id.includes('hockey')) return '🏒';
    if (id.includes('tennis')) return '🎾';
    if (id.includes('cricket')) return '🏏';
    if (id.includes('baseball') || id.includes('mlb')) return '⚾';
    if (id.includes('rugby')) return '🏉';
    if (id.includes('golf')) return '⛳';
    if (id.includes('boxing') || id.includes('mma') || id.includes('ufc')) return '🥊';
    if (id.includes('f1') || id.includes('formula') || id.includes('motor') || id.includes('racing')) return '🏎️';
    if (id.includes('cycling')) return '🚴';
    
    return '🏆';
  };

  const allSportsOption = showAllOption ? [{ id: 'all', name: 'All Sports' }] : [];
  const sportsWithAll = [...allSportsOption, ...sports];

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
        {sportsWithAll.map((sport) => {
          const isSelected = selectedSport === sport.id;
          
          return (
            <button
              key={sport.id}
              onClick={() => onSelectSport(sport.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
                font-semibold text-sm transition-all duration-200
                ${isSelected 
                  ? 'bg-primary text-primary-foreground shadow-glow' 
                  : 'bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <span className="text-base">{sport.id === 'all' ? '🌍' : getSportIcon(sport.id)}</span>
              <span>{sport.name}</span>
            </button>
          );
        })}
      </div>
      
      {/* Fade indicators */}
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
};

export default SportsPillNav;
