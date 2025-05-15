
import React from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../types/sports';
import { AspectRatio } from './ui/aspect-ratio';

interface MatchCardProps {
  match: Match;
  sportId: string;
  isPriority?: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, sportId, isPriority = false }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const homeBadge = match.teams?.home?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.home.badge}.webp` 
    : '';
  const awayBadge = match.teams?.away?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.away.badge}.webp` 
    : '';
  const home = match.teams?.home?.name || 'Team A';
  const away = match.teams?.away?.name || 'Team B';
  const hasStream = match.sources?.length > 0;
  const hasTeamLogos = homeBadge && awayBadge;
  
  return (
    <Link to={`/match/${sportId}/${match.id}`} key={`${isPriority ? 'popular-' : ''}${match.id}`} className="group block">
      <div className="relative rounded-md overflow-hidden h-full transition-all duration-300 hover:shadow-md hover:shadow-[#9b87f5]/10 group-hover:-translate-y-1">
        <AspectRatio ratio={16/10} className="bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10"></div>
          
          {/* Match Time */}
          <div className="absolute top-1.5 left-2 z-20">
            <div className="bg-black/70 text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
              {formatTime(match.date)}
            </div>
          </div>
          
          {/* Streaming Badge */}
          {hasStream && (
            <div className="absolute top-1/3 left-2 z-20">
              <div className="flex items-center gap-1 bg-black/70 text-white px-1.5 py-0.5 rounded-full">
                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15L8 12M8 12L12 9M8 12H16M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[8px] font-medium">Watch Now</span>
              </div>
            </div>
          )}
          
          {/* Teams or DAMITV */}
          <div className="absolute bottom-0 inset-x-0 z-20 p-2 flex flex-col">
            {hasTeamLogos ? (
              <div className="flex items-center justify-center mb-1">
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={homeBadge} 
                      alt={home} 
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-[10px]">D</span></div>';
                      }}
                    />
                  </div>
                </div>
                <div className="mx-3 text-white text-sm font-medium">vs</div>
                <div className="flex items-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    <img 
                      src={awayBadge} 
                      alt={away} 
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-[10px]">D</span></div>';
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center mb-1">
                <div className="bg-[#343a4d] px-3 py-1 rounded-md">
                  <span className="font-bold text-white text-sm">DAMITV</span>
                </div>
              </div>
            )}
            <h3 className="font-semibold text-center text-white text-xs truncate px-1 mt-2">
              {match.title.length > 24 ? `${match.title.substring(0, 24)}...` : match.title}
            </h3>
            <p className="text-center text-gray-300 text-[10px] mt-0.5 truncate px-1">
              {match.title.split('-').pop()?.trim() || 'Football'}
            </p>
          </div>
        </AspectRatio>
      </div>
    </Link>
  );
};

export default MatchCard;
