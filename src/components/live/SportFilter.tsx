
import React from 'react';
import { Button } from '../ui/button';
import { CircleDot, Dribbble } from 'lucide-react';

interface SportFilterProps {
  allMatches: any[];
  activeSportFilter: string;
  setActiveSportFilter: (sportId: string) => void;
}

const SportFilter: React.FC<SportFilterProps> = ({
  allMatches,
  activeSportFilter,
  setActiveSportFilter
}) => {
  // Get unique sport IDs from matches
  const getUniqueSportIds = (): string[] => {
    const sportIds = new Set<string>();
    allMatches.forEach(match => {
      if (match.sportId) sportIds.add(match.sportId);
    });
    return Array.from(sportIds);
  };

  // Get sport icon by ID
  const getSportIcon = (sportId: string) => {
    switch(sportId) {
      case '1':
      case 'football':
        return <CircleDot size={16} />;
      case '2':
      case 'basketball':
        return <Dribbble size={16} />;
      default:
        return null;
    }
  };
  
  // Get sport name by ID
  const getSportName = (sportId: string): string => {
    // Default mappings for common sport IDs
    const sportMappings: Record<string, string> = {
      '1': 'Football',
      '2': 'Basketball',
      '3': 'Ice Hockey',
      '4': 'Tennis',
      'football': 'Football',
      'basketball': 'Basketball',
      'hockey': 'Ice Hockey'
    };
    
    return sportMappings[sportId] || 'Other Sports';
  };

  if (allMatches.length === 0) return null;

  return (
    <div className="mb-6 overflow-x-auto pb-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className={`${
            activeSportFilter === 'all' 
              ? 'bg-[#343a4d] border-[#fa2d04]' 
              : 'bg-[#242836] border-[#343a4d]'
          } whitespace-nowrap text-white`}
          onClick={() => setActiveSportFilter('all')}
        >
          All Sports
        </Button>
        {getUniqueSportIds().map(sportId => (
          <Button
            key={`filter-${sportId}`}
            variant="outline"
            size="sm"
            className={`${
              activeSportFilter === sportId 
                ? 'bg-[#343a4d] border-[#fa2d04]' 
                : 'bg-[#242836] border-[#343a4d]'
            } whitespace-nowrap flex items-center gap-1 text-white`}
            onClick={() => setActiveSportFilter(sportId)}
          >
            {getSportIcon(sportId)}
            {getSportName(sportId)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SportFilter;
