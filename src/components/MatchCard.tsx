import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Play, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Match } from '../types/sports';
import { isMatchLive } from '../utils/matchUtils';

interface MatchCardProps {
  match: Match;
  className?: string;
  sportId?: string;
  onClick?: () => void;
  preventNavigation?: boolean;
}

const fallbackBackgrounds = [
  "https://imgur.com/1xsz109.jpg",
  "https://imgur.com/sVc77ht.jpg", 
  "https://imgur.com/1Tw0JRU.jpg",
  "https://imgur.com/MtYQroI.jpg",
  "https://imgur.com/EsEKzFs.jpg",
  "https://imgur.com/XT3MN8i.jpg",
];

const damitvLogo = "https://damitv.pro/logo.png";

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  className = '',
  sportId,
  onClick,
  preventNavigation,
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'EEE, MMM d');
  };

  const hasStream = match.sources?.length > 0;
  const isLive = isMatchLive(match);

  // Get poster URL
  const poster = match.poster ? `https://streamed.pk${match.poster}` : undefined;
  
  // Get team badges  
  const homeBadge = match.teams?.home?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.home.badge}.webp`
    : null;
  const awayBadge = match.teams?.away?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.away.badge}.webp`
    : null;
  
  // Use the first available badge if no poster
  const badge = homeBadge || awayBadge;
  
  // Pick random background if no poster or badge
  const randomBg = fallbackBackgrounds[Math.abs(match.id?.toString().charCodeAt(0) || 0) % fallbackBackgrounds.length];

  let backgroundImage = poster || badge || randomBg;
  let isBadge = !poster && !!badge;
  let isFallback = !poster && !badge;

  const title = match.title || `${match.teams?.home?.name || ''} vs ${match.teams?.away?.name || ''}`;
  const date = match.date ? `${formatDate(match.date)} • ${formatTime(match.date)}` : 'Time TBD';
  const homeTeam = match.teams?.home?.name || '';
  const awayTeam = match.teams?.away?.name || '';

  const cardContent = (
    <div className={`cursor-pointer group ${className}`}>
      <div
        className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg flex items-end"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay if badge */}
        {isBadge && <div className="absolute inset-0 bg-black/40"></div>}

        {/* Overlay if fallback damitv logo */}
        {isFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <img
              src={damitvLogo}
              alt="Damitv Logo"
              className="w-24 h-24 opacity-90"
            />
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <Badge className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 font-medium animate-pulse">
            • LIVE
          </Badge>
        )}

        {/* Card content */}
        <div className="relative z-10 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-white text-lg font-bold line-clamp-1">{title}</h3>
          <p className="text-gray-200 text-sm">{date}</p>
          <p className="text-gray-100 text-sm">
            {homeTeam} vs {awayTeam}
          </p>
          <div className="flex items-center gap-1 text-gray-300 text-xs mt-1">
            <Play className="w-3 h-3" />
            <span>
              {hasStream
                ? `${match.sources.length} stream${match.sources.length > 1 ? 's' : ''}`
                : 'No streams'}
            </span>
            {hasStream && (
              <ChevronRight className="w-4 h-4 ml-auto group-hover:text-white transition-colors" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (preventNavigation || onClick) {
    return <div onClick={onClick}>{cardContent}</div>;
  }

  if (hasStream) {
    return (
      <Link to={`/match/${sportId || match.sportId}/${match.id}`}>{cardContent}</Link>
    );
  }

  return <>{cardContent}</>;
};

export default MatchCard;
