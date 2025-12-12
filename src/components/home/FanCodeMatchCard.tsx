import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import { CombinedMatch, fetchTeamLogo, getSportIcon } from '@/services/combinedSportsService';

interface Props {
  match: CombinedMatch;
}

const FanCodeMatchCard = ({ match }: Props) => {
  const [homeLogo, setHomeLogo] = useState<string | null>(match.homeBadge);
  const [awayLogo, setAwayLogo] = useState<string | null>(match.awayBadge);
  
  const sportIcon = getSportIcon(match.sport);

  // Fetch logos from TheSportsDB if not available
  useEffect(() => {
    if (!homeLogo && match.homeTeam) {
      fetchTeamLogo(match.homeTeam).then(logo => {
        if (logo) setHomeLogo(logo);
      });
    }
    if (!awayLogo && match.awayTeam) {
      fetchTeamLogo(match.awayTeam).then(logo => {
        if (logo) setAwayLogo(logo);
      });
    }
  }, [match.homeTeam, match.awayTeam, homeLogo, awayLogo]);

  const formatTime = () => {
    if (match.isLive) return null;
    const now = new Date();
    const matchDate = match.date;
    
    // Today
    if (matchDate.toDateString() === now.toDateString()) {
      return matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (matchDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return matchDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const TeamLogo = ({ logo, name }: { logo: string | null; name: string }) => (
    logo ? (
      <img 
        src={logo} 
        alt={name} 
        className="w-10 h-10 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
        }}
      />
    ) : null
  );

  const TeamFallback = ({ name }: { name: string }) => (
    <div className={`w-10 h-10 bg-muted rounded-full flex items-center justify-center ${homeLogo || awayLogo ? 'hidden' : ''}`}>
      <span className="text-xl">{sportIcon}</span>
    </div>
  );

  return (
    <Link
      to={`/match/${match.sport}/${match.id}`}
      className="group bg-card rounded-2xl overflow-hidden hover:bg-secondary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 border border-border/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">{sportIcon}</span>
          <span className="text-muted-foreground text-xs font-medium truncate max-w-[120px]">
            {match.competition || match.sport}
          </span>
        </div>
        {match.isLive ? (
          <span className="flex items-center gap-1.5 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-destructive-foreground rounded-full animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="flex items-center gap-1 text-muted-foreground text-xs">
            <Clock className="w-3 h-3" />
            {formatTime()}
          </span>
        )}
      </div>

      {/* Match Content */}
      <div className="p-4 space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <TeamLogo logo={homeLogo} name={match.homeTeam} />
              <TeamFallback name={match.homeTeam} />
            </div>
            <span className="text-foreground font-medium truncate">
              {match.homeTeam || 'TBD'}
            </span>
          </div>
          {match.isLive && match.score && (
            <span className="text-foreground text-xl font-bold ml-2 tabular-nums">
              {match.score.home}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <TeamLogo logo={awayLogo} name={match.awayTeam} />
              <TeamFallback name={match.awayTeam} />
            </div>
            <span className="text-foreground font-medium truncate">
              {match.awayTeam || 'TBD'}
            </span>
          </div>
          {match.isLive && match.score && (
            <span className="text-foreground text-xl font-bold ml-2 tabular-nums">
              {match.score.away}
            </span>
          )}
        </div>
      </div>

      {/* Watch Button (on hover) */}
      <div className="px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-orange-500 text-primary-foreground text-sm font-semibold py-2.5 rounded-xl">
          <Play className="w-4 h-4 fill-current" />
          Watch Now
        </div>
      </div>
    </Link>
  );
};

export default FanCodeMatchCard;
