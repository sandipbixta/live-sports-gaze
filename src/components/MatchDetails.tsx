import React from 'react';
import { Match } from '@/types/sports';
import { ManualMatch } from '@/types/manualMatch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface MatchDetailsProps {
  match?: Match | ManualMatch | null;
  isLive?: boolean;
  showCompact?: boolean;
  className?: string;
}

const MatchDetails: React.FC<MatchDetailsProps> = ({ 
  match, 
  isLive = false, 
  showCompact = false,
  className = ""
}) => {
  if (!match) return null;

  // Handle different match types
  const isManualMatch = 'links' in match;
  const matchTitle = isManualMatch ? match.title : match.title;
  const matchDate = isManualMatch ? new Date(match.date) : new Date(match.date);
  const matchTeams = isManualMatch ? match.teams : match.teams;
  const matchCategory = isManualMatch ? match.seo?.category : match.category;

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm');
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  // Helper functions to handle team data safely
  const getTeamName = (team: string | { name: string; logo?: string } | undefined): string => {
    if (!team) return '';
    return typeof team === 'string' ? team : team.name;
  };

  const getTeamLogo = (team: string | { name: string; logo?: string } | undefined): string | undefined => {
    if (!team || typeof team === 'string') return undefined;
    return team.logo;
  };

  const getTeamInitial = (team: string | { name: string; logo?: string } | undefined): string => {
    const name = getTeamName(team);
    return name.charAt(0).toUpperCase();
  };

  if (showCompact) {
    return (
      <div className={`bg-muted/50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-foreground truncate">{matchTitle}</h3>
          {isLive && (
            <Badge variant="destructive" className="ml-2 animate-pulse">
              • LIVE
            </Badge>
          )}
        </div>
        
        {matchTeams && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Users className="h-3 w-3" />
            <span>{getTeamName(matchTeams.home)} vs {getTeamName(matchTeams.away)}</span>
          </div>
        )}
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(matchDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTime(matchDate)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-xl p-4 border border-border ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground mb-1">{matchTitle}</h2>
          {matchCategory && (
            <div className="flex items-center gap-1 mb-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground capitalize">{matchCategory}</span>
            </div>
          )}
        </div>
        
        {isLive && (
          <Badge variant="destructive" className="animate-pulse">
            • LIVE NOW
          </Badge>
        )}
      </div>

      {/* Teams Section */}
      {matchTeams && (
        <div className="mb-4">
          <div className="flex items-center justify-center gap-6 py-4 bg-muted/30 rounded-lg">
            <div className="text-center flex-1">
              <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                {getTeamLogo(matchTeams.home) ? (
                  <img 
                    src={getTeamLogo(matchTeams.home)} 
                    alt={getTeamName(matchTeams.home)}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-sm font-bold text-primary">
                    {getTeamInitial(matchTeams.home)}
                  </span>
                )}
              </div>
              <p className="font-semibold text-sm text-foreground">
                {getTeamName(matchTeams.home)}
              </p>
              <p className="text-xs text-muted-foreground">Home</p>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-muted-foreground">VS</div>
            </div>
            
            <div className="text-center flex-1">
              <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                {getTeamLogo(matchTeams.away) ? (
                  <img 
                    src={getTeamLogo(matchTeams.away)} 
                    alt={getTeamName(matchTeams.away)}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-sm font-bold text-primary">
                    {getTeamInitial(matchTeams.away)}
                  </span>
                )}
              </div>
              <p className="font-semibold text-sm text-foreground">
                {getTeamName(matchTeams.away)}
              </p>
              <p className="text-xs text-muted-foreground">Away</p>
            </div>
          </div>
        </div>
      )}

      {/* Match Info */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm font-medium text-foreground">{formatDate(matchDate)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-sm font-medium text-foreground">{formatTime(matchDate)}</p>
          </div>
        </div>
      </div>

      {/* Additional info for manual matches */}
      {isManualMatch && match.seo?.description && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">{match.seo.description}</p>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;