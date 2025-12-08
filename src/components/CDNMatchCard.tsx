import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tv, Users } from 'lucide-react';
import { CDNMatch } from '@/types/cdnMatch';
import { Link } from 'react-router-dom';

interface CDNMatchCardProps {
  match: CDNMatch;
  sport?: string;
}

const CDNMatchCard: React.FC<CDNMatchCardProps> = ({ match, sport = 'Soccer' }) => {
  const isLive = match.status === 'live';
  const totalViewers = match.channels.reduce((sum, ch) => sum + parseInt(ch.viewers || '0'), 0);

  return (
    <Link to={`/cdn-match/${match.gameID}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border-border hover:border-primary/50 group">
        {/* Header with tournament and country */}
        <div className="bg-muted/50 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={match.countryIMG} 
              alt={match.country} 
              className="w-5 h-4 object-cover rounded-sm"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
              {match.tournament}
            </span>
          </div>
          {isLive && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5 animate-pulse">
              LIVE
            </Badge>
          )}
        </div>

        {/* Teams */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            {/* Home Team */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <img 
                src={match.homeTeamIMG} 
                alt={match.homeTeam}
                className="w-10 h-10 object-contain"
                onError={(e) => { 
                  e.currentTarget.src = 'https://via.placeholder.com/40?text=T';
                }}
              />
              <span className="text-xs font-medium text-center line-clamp-2 text-foreground">
                {match.homeTeam}
              </span>
            </div>

            {/* VS / Time */}
            <div className="flex flex-col items-center px-2">
              <span className="text-lg font-bold text-muted-foreground">VS</span>
              <span className="text-xs text-muted-foreground mt-1">{match.time}</span>
            </div>

            {/* Away Team */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <img 
                src={match.awayTeamIMG} 
                alt={match.awayTeam}
                className="w-10 h-10 object-contain"
                onError={(e) => { 
                  e.currentTarget.src = 'https://via.placeholder.com/40?text=T';
                }}
              />
              <span className="text-xs font-medium text-center line-clamp-2 text-foreground">
                {match.awayTeam}
              </span>
            </div>
          </div>
        </div>

        {/* Footer with channels info */}
        <div className="bg-muted/30 px-3 py-2 flex items-center justify-between border-t border-border">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Tv className="w-3.5 h-3.5" />
            <span className="text-xs">{match.channels.length} channels</span>
          </div>
          {totalViewers > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">{totalViewers}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};

export default CDNMatchCard;
