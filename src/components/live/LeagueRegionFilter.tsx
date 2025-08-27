import React from 'react';
import { Button } from '../ui/button';
import { Match } from '../../types/sports';
import { Globe, Flag } from 'lucide-react';

interface LeagueRegionFilterProps {
  allMatches: Match[];
  activeRegionFilter: string;
  onRegionFilterChange: (region: string) => void;
}

const LeagueRegionFilter: React.FC<LeagueRegionFilterProps> = ({
  allMatches,
  activeRegionFilter,
  onRegionFilterChange
}) => {
  // Helper function to identify European leagues
  const isEuropeanLeague = (title: string): boolean => {
    const lowerTitle = title.toLowerCase();
    
    const europeanKeywords = [
      // Top 5 European leagues
      'premier league', 'epl', 'english premier league',
      'la liga', 'spanish league', 'spanish football',
      'serie a', 'italian league', 'calcio',
      'bundesliga', 'german league', 'german football', 
      'ligue 1', 'french league', 'french football',
      
      // UEFA competitions
      'champions league', 'ucl', 'uefa champions league',
      'europa league', 'uel', 'uefa europa',
      'conference league', 'uecl', 'uefa conference',
      'uefa', 'euro', 'nations league', 'uefa nations league',
      'uefa super cup', 'supercup', 'super cup',
      
      // Major European clubs
      'manchester united', 'liverpool', 'manchester city', 'chelsea', 'arsenal', 'tottenham',
      'barcelona', 'real madrid', 'atletico madrid',
      'juventus', 'ac milan', 'inter milan', 'napoli', 'roma',
      'bayern munich', 'dortmund', 'rb leipzig',
      'psg', 'paris saint-germain', 'marseille', 'lyon',
      
      // European national teams
      'spain', 'france', 'england', 'germany', 'italy', 'portugal', 'netherlands',
      'belgium', 'croatia', 'poland', 'ukraine', 'denmark', 'switzerland'
    ];
    
    return europeanKeywords.some(keyword => lowerTitle.includes(keyword));
  };

  // Helper function to identify USA leagues
  const isUSALeague = (title: string): boolean => {
    const lowerTitle = title.toLowerCase();
    
    const usaKeywords = [
      // MLS teams and league
      'mls', 'major league soccer',
      'inter miami', 'miami', 'seattle sounders', 'sounders',
      'atlanta united', 'lafc', 'los angeles fc', 'la galaxy',
      'new york city fc', 'nycfc', 'new york red bulls',
      'toronto fc', 'portland timbers', 'chicago fire',
      'philadelphia union', 'columbus crew', 'fc dallas',
      'vancouver whitecaps', 'montreal impact', 'cf montreal',
      'orlando city', 'minnesota united', 'colorado rapids',
      'sporting kansas city', 'real salt lake', 'houston dynamo',
      'san jose earthquakes', 'dc united',
      
      // US National team
      'usa', 'united states', 'usmnt', 'uswnt',
      'america', 'american',
      
      // Other US leagues/competitions
      'us open cup', 'concacaf', 'gold cup'
    ];
    
    return usaKeywords.some(keyword => lowerTitle.includes(keyword));
  };

  // Count matches by region
  const getMatchCounts = () => {
    const footballMatches = allMatches.filter(match => 
      match.sportId === 'football' || match.category === 'football'
    );
    
    const europeanCount = footballMatches.filter(match => isEuropeanLeague(match.title)).length;
    const usaCount = footballMatches.filter(match => isUSALeague(match.title)).length;
    const totalFootball = footballMatches.length;
    
    return { europeanCount, usaCount, totalFootball };
  };

  const { europeanCount, usaCount, totalFootball } = getMatchCounts();

  // Only show if there are football matches
  if (totalFootball === 0) return null;

  return (
    <div className="mb-4 overflow-x-auto pb-2">
      <div className="flex items-center gap-2 mb-2">
        <Globe size={16} className="text-[#9b87f5]" />
        <span className="text-sm font-medium text-gray-300">Football Regions:</span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className={`${
            activeRegionFilter === 'all' 
              ? 'bg-[#343a4d] border-[#ff5a36]' 
              : 'bg-[#242836] border-[#343a4d]'
          } whitespace-nowrap`}
          onClick={() => onRegionFilterChange('all')}
        >
          All Football ({totalFootball})
        </Button>
        
        {europeanCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className={`${
              activeRegionFilter === 'european' 
                ? 'bg-[#343a4d] border-[#ff5a36]' 
                : 'bg-[#242836] border-[#343a4d]'
            } whitespace-nowrap flex items-center gap-1`}
            onClick={() => onRegionFilterChange('european')}
          >
            <Flag size={14} />
            European ({europeanCount})
          </Button>
        )}
        
        {usaCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className={`${
              activeRegionFilter === 'usa' 
                ? 'bg-[#343a4d] border-[#ff5a36]' 
                : 'bg-[#242836] border-[#343a4d]'
            } whitespace-nowrap flex items-center gap-1`}
            onClick={() => onRegionFilterChange('usa')}
          >
            <Flag size={14} />
            USA ({usaCount})
          </Button>
        )}
      </div>
    </div>
  );
};

export default LeagueRegionFilter;
