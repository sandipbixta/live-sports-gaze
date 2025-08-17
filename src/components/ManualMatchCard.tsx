import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Play, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ManualMatch } from '../types/manualMatch';

interface ManualMatchCardProps {
  match: ManualMatch;
  className?: string;
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

const ManualMatchCard: React.FC<ManualMatchCardProps> = ({
  match,
  className = '',
  onClick,
  preventNavigation,
}) => {
  const hasStreams = match.links?.length > 0;

  // Get poster and badge
  const poster = match.image || undefined;
  const badge = undefined; // Manual matches don't have team badges
  
  // Pick random background if no poster
  const randomBg = fallbackBackgrounds[Math.abs(match.id?.toString().charCodeAt(0) || 0) % fallbackBackgrounds.length];

  let backgroundImage = poster || badge || randomBg;
  let isBadge = !poster && !!badge;
  let isFallback = !poster && !badge;

  const title = match.title;
  const date = match.date;
  const homeTeam = match.teams.home;
  const awayTeam = match.teams.away;

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

        {/* Available badge */}
        <Badge className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 font-medium">
          Available
        </Badge>

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
              {hasStreams
                ? `${match.links.length} stream${match.links.length > 1 ? 's' : ''}`
                : 'No streams'}
            </span>
            {hasStreams && (
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

  if (hasStreams) {
    return (
      <Link to={`/manual-match/${match.id}`}>{cardContent}</Link>
    );
  }

  return <>{cardContent}</>;
};

export default ManualMatchCard;