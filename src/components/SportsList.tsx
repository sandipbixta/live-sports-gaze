
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
        {/* Mobile: horizontal scroll */}
        <div className="flex overflow-x-auto pb-3 space-x-3 scrollbar-none lg:hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
        
        {/* Insert Football 2 after regular Football */}
        {sports.filter(sport => sport.name.toLowerCase() === 'football').map((sport) => (
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
            ⚽ {sport.name}
          </Button>
        ))}
        
        {/* Football 2 (Streamed API) */}
        <Button
          onClick={() => onSelectSport('football2')}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-sm flex-shrink-0 ${
            selectedSport === 'football2'
              ? 'bg-[#ff5a36] text-white shadow-lg shadow-[#ff5a36]/20'
              : 'bg-[#242836] text-white hover:bg-[#343a4d]'
          }`}
          variant={selectedSport === 'football2' ? "default" : "outline"}
        >
          ⚽ Football 2
        </Button>
        
        {/* Other sports excluding football */}
        {sports.filter(sport => sport.name.toLowerCase() !== 'football').map((sport) => (
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
            {sport.name === 'basketball' ? '🏀' : 
             sport.name === 'tennis' ? '🎾' : 
             sport.name === 'baseball' ? '⚾' : 
             sport.name === 'mma' ? '🥊' : 
             sport.name === 'boxing' ? '🥊' : 
             sport.name === 'american-football' ? '🏈' : 
             sport.name === 'afl' ? '🏈' : 
             sport.name === 'rugby' ? '🏉' : 
             sport.name === 'cricket' ? '🏏' : 
             sport.name === 'motorsport' ? '🏎️' : '📺'} {sport.name}
          </Button>
        ))}
      </div>

      {/* Desktop: grid */}
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
        
        {/* Insert Football 2 after regular Football */}
        {sports.filter(sport => sport.name.toLowerCase() === 'football').map((sport) => (
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
            ⚽ {sport.name}
          </Button>
        ))}
        
        {/* Football 2 (Streamed API) */}
        <Button
          onClick={() => onSelectSport('football2')}
          className={`px-3 py-1.5 rounded-lg transition-all text-sm truncate ${
            selectedSport === 'football2'
              ? 'bg-[#ff5a36] text-white shadow-lg shadow-[#ff5a36]/20'
              : 'bg-[#242836] text-white hover:bg-[#343a4d]'
          }`}
          variant={selectedSport === 'football2' ? "default" : "outline"}
        >
          ⚽ Football 2
        </Button>
        
        {/* Other sports excluding football */}
        {sports.filter(sport => sport.name.toLowerCase() !== 'football').map((sport) => (
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
            {sport.name === 'basketball' ? '🏀' : 
             sport.name === 'tennis' ? '🎾' : 
             sport.name === 'baseball' ? '⚾' : 
             sport.name === 'mma' ? '🥊' : 
             sport.name === 'boxing' ? '🥊' : 
             sport.name === 'american-football' ? '🏈' : 
             sport.name === 'afl' ? '🏈' : 
             sport.name === 'rugby' ? '🏉' : 
             sport.name === 'cricket' ? '🏏' : 
             sport.name === 'motorsport' ? '🏎️' : '📺'} {sport.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SportsList;
