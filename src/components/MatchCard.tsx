import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, Play } from 'lucide-react';
import { Match } from '../types/sports';
import { isMatchLive } from '../utils/matchUtils';

interface MatchCardProps {
  match: Match;
  sportId?: string;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, sportId }) => {
  const isLive = isMatchLive(match);

  // API Images
  const homeBadge = match.teams?.home?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.home.badge}.webp`
    : '';
  const awayBadge = match.teams?.away?.badge
    ? `https://streamed.pk/api/images/badge/${match.teams.away.badge}.webp`
    : '';
  const posterImage = match.poster
    ? `https://streamed.pk${match.poster}.webp`
    : (match.teams?.home?.badge && match.teams?.away?.badge
        ? `https://streamed.pk/api/images/poster/${match.teams.home.badge}/${match.teams.away.badge}.webp`
        : '/placeholder.svg');

  const matchTime = new Date(match.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const matchDate = format(new Date(match.date), 'EEE, MMM d');

  return (
    <Link
      to={`/match/${sportId || match.sportId}/${match.id}`}
      className="group block rounded-xl overflow-hidden shadow-lg hover:scale-[1.03] transition-transform bg-black relative"
    >
      {/* Poster Background */}
      <div className="relative aspect-[16/10] w-full">
        <img
          src={posterImage}
          alt={`${match.teams?.home?.name} vs ${match.teams?.away?.name}`}
          className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Live / Time Badge */}
        <div className="absolute top-3 left-3">
          {isLive ? (
            <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
              • LIVE
            </span>
          ) : (
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> {matchTime}
            </span>
          )}
        </div>

        {/* Teams & Title */}
        <div className="absolute bottom-4 left-0 w-full text-center px-3">
          <div className="flex justify-center items-center gap-4 mb-2">
            {homeBadge && (
              <img src={homeBadge} alt={match.teams?.home?.name} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            )}
            <span className="text-white font-bold text-lg">VS</span>
            {awayBadge && (
              <img src={awayBadge} alt={match.teams?.away?.name} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
            )}
          </div>
          <h3 className="text-white font-bold text-base md:text-lg">
            {match.teams?.home?.name} vs {match.teams?.away?.name}
          </h3>
          <p className="text-gray-300 text-xs">{matchDate}</p>
        </div>

        {/* Streams Count */}
        {match.sources?.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <Play className="w-3 h-3" /> {match.sources.length} stream{match.sources.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Link>
  );
};

export default MatchCard;
