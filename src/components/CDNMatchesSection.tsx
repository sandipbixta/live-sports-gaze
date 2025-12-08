import React, { useState } from 'react';
import { CDNMatch } from '@/types/cdnMatch';
import CDNMatchCard from './CDNMatchCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CDNMatchesSectionProps {
  matches: CDNMatch[];
  sport?: string;
  title?: string;
  showAll?: boolean;
  maxItems?: number;
}

const CDNMatchesSection: React.FC<CDNMatchesSectionProps> = ({ 
  matches, 
  sport = 'Soccer',
  title = 'Live Matches',
  showAll = false,
  maxItems = 6
}) => {
  const [expanded, setExpanded] = useState(showAll);
  
  const liveMatches = matches.filter(m => m.status === 'live');
  const finishedMatches = matches.filter(m => m.status === 'finished');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming');

  const displayMatches = expanded ? matches : matches.slice(0, maxItems);

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <div className="flex gap-2">
            {liveMatches.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {liveMatches.length} LIVE
              </Badge>
            )}
            <Badge variant="secondary">
              {matches.length} matches
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayMatches.map((match) => (
          <CDNMatchCard key={match.gameID} match={match} sport={sport} />
        ))}
      </div>

      {matches.length > maxItems && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => setExpanded(!expanded)}
            className="gap-2"
          >
            {expanded ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Show All ({matches.length}) <ChevronDown className="w-4 h-4" /></>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CDNMatchesSection;
