import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Users, Clock } from 'lucide-react';
import { Match } from '../types/sports';
import { Badge } from './ui/badge';
import TeamLogo from './TeamLogo';
import { format } from 'date-fns';

interface LiveMatchCardProps {
  match: Match;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'featured';
}

const LiveMatchCard: React.FC<LiveMatchCardProps> = ({ 
  match, 
  onClick,
  variant = 'default'
}) => {
  const home = match.teams?.home?.name || 'TBA';
  const away = match.teams?.away?.name || 'TBA';
  const isLive = match.isLive || (match.date && match.date <= Date.now() && match.date > Date.now() - 3 * 60 * 60 * 1000);
  const hasStream = match.sources?.length > 0;
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return format(date, 'MMM d, HH:mm');
  };

  const getCountdown = (timestamp: number) => {
    const diff = timestamp - Date.now();
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const countdown = !isLive ? getCountdown(match.date) : null;

  const CardContent = (
    <div className={`
      group relative bg-card rounded-xl overflow-hidden border border-border
      hover:border-primary/40 transition-all duration-300 hover:shadow-lg
      ${variant === 'featured' ? 'aspect-[16/10]' : ''}
    `}>
      {/* Top bar with category and status */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
          {match.tournament || match.category || 'Sports'}
        </span>
        
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge className="bg-live text-white text-[10px] font-bold uppercase px-2 py-0.5">
              ● LIVE
            </Badge>
          ) : countdown ? (
            <Badge variant="outline" className="text-[10px] font-semibold border-primary/30 text-primary">
              <Clock className="w-3 h-3 mr-1" />
              {countdown}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">{formatTime(match.date)}</span>
          )}
        </div>
      </div>
      
      {/* Teams section */}
      <div className="p-4 space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <TeamLogo teamName={home} sport={match.category} size="sm" />
            <span className="font-semibold text-foreground truncate">{home}</span>
          </div>
          {isLive && match.score?.home !== undefined && (
            <span className="text-xl font-bold text-foreground tabular-nums">{match.score.home}</span>
          )}
        </div>
        
        {/* Away Team */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <TeamLogo teamName={away} sport={match.category} size="sm" />
            <span className="font-semibold text-foreground truncate">{away}</span>
          </div>
          {isLive && match.score?.away !== undefined && (
            <span className="text-xl font-bold text-foreground tabular-nums">{match.score.away}</span>
          )}
        </div>
      </div>
      
      {/* Footer with actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-t border-border/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          {match.viewerCount && match.viewerCount > 0 && (
            <>
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{match.viewerCount.toLocaleString()}</span>
            </>
          )}
          {match.progress && (
            <span className="text-xs font-medium text-primary">{match.progress}</span>
          )}
        </div>
        
        {hasStream && (
          <div className="flex items-center gap-1.5 text-primary group-hover:text-primary-glow transition-colors">
            <Play className="w-4 h-4 fill-current" />
            <span className="text-xs font-bold uppercase">{isLive ? 'Watch' : 'Stream'}</span>
          </div>
        )}
      </div>
      
      {/* Hover overlay for stream available */}
      {hasStream && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {CardContent}
      </div>
    );
  }

  if (hasStream) {
    return (
      <Link to={`/match/${match.sportId || match.category}/${match.id}`} className="block">
        {CardContent}
      </Link>
    );
  }

  return CardContent;
};

export default LiveMatchCard;
