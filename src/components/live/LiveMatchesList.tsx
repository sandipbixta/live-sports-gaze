
import React from 'react';
import { Match, Sport } from '../../types/sports';
import MatchCard from '../MatchCard';
import { Badge } from '../ui/badge';
import { useIsMobile } from '../../hooks/use-mobile';
import { CircleDot, Dribbble } from 'lucide-react';

interface LiveMatchesListProps {
  matches: Match[];
  sports: Sport[];
  onMatchSelect: (match: Match) => void;
}

const LiveMatchesList: React.FC<LiveMatchesListProps> = ({ 
  matches, 
  sports, 
  onMatchSelect 
}) => {
  const isMobile = useIsMobile();

  // Get sport name by ID
  const getSportName = (sportId: string): string => {
    const sport = sports.find(s => s.id === sportId);
    if (sport) return sport.name;
    
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

  // Helper function to group matches by sport
  const groupMatchesBySport = (matches: Match[]) => {
    const groupedMatches: Record<string, Match[]> = {};
    
    matches.forEach(match => {
      const sportId = match.sportId || "unknown";
      if (!groupedMatches[sportId]) {
        groupedMatches[sportId] = [];
      }
      groupedMatches[sportId].push(match);
    });
    
    return groupedMatches;
  };

  if (matches.length === 0) return null;
  
  // Group matches by sport
  const groupedMatches = groupMatchesBySport(matches);
  const sportIds = Object.keys(groupedMatches);
  
  return (
    <>
      {sportIds.map(sportId => (
        <div key={`sport-${sportId}`} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {getSportIcon(sportId)}
            <h3 className="text-xl font-bold text-white">{getSportName(sportId)}</h3>
            <Badge variant="outline" className="ml-2 bg-[#242836] text-xs text-white">
              {groupedMatches[sportId].length} {groupedMatches[sportId].length === 1 ? 'match' : 'matches'}
            </Badge>
          </div>
          
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 live-matches-grid`}>
            {groupedMatches[sportId].map((match) => (
              <div 
                key={`${sportId}-${match.id}`} 
                className="cursor-pointer"
                onClick={() => onMatchSelect(match)}
              >
                <MatchCard 
                  match={match}
                  sportId={match.sportId || "1"}
                  onClick={() => onMatchSelect(match)}
                  preventNavigation={true}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
};

export default LiveMatchesList;
