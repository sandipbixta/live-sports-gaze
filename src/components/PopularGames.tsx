
import React from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../types/sports';
import { Star } from 'lucide-react';
import { AspectRatio } from './ui/aspect-ratio';

interface PopularGamesProps {
  popularMatches: Match[];
  selectedSport: string | null;
}

const PopularGames: React.FC<PopularGamesProps> = ({ popularMatches, selectedSport }) => {
  if (popularMatches.length === 0) {
    return null;
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-white">Popular Games</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularMatches.map((match) => {
          const homeBadge = match.teams?.home?.badge 
            ? `https://streamed.su/api/images/badge/${match.teams.home.badge}.webp` 
            : '';
          const awayBadge = match.teams?.away?.badge 
            ? `https://streamed.su/api/images/badge/${match.teams.away.badge}.webp` 
            : '';
          const home = match.teams?.home?.name || 'Team A';
          const away = match.teams?.away?.name || 'Team B';
          const hasStream = match.sources?.length > 0;
          
          return (
            <Link to={`/match/${selectedSport}/${match.id}`} key={`popular-${match.id}`} className="group block">
              <div className="relative rounded-xl overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:shadow-[#9b87f5]/10 group-hover:-translate-y-1">
                <AspectRatio ratio={16/10} className="bg-gradient-to-b from-gray-800 to-gray-900">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 z-10"></div>
                  
                  {/* Match Time */}
                  <div className="absolute top-3 left-4 z-20">
                    <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {formatTime(match.date)}
                    </div>
                  </div>
                  
                  {/* Favorite Button */}
                  <div className="absolute top-3 right-4 z-20">
                    <div className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-full">
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Streaming Badge */}
                  {hasStream && (
                    <div className="absolute top-1/3 left-4 z-20">
                      <div className="flex items-center gap-2 bg-black/70 text-white px-3 py-1 rounded-full">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15L8 12M8 12L12 9M8 12H16M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-xs font-medium">Streamed</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Teams */}
                  <div className="absolute bottom-0 inset-x-0 z-20 p-4 flex flex-col">
                    <div className="flex items-center justify-center mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                          {homeBadge ? (
                            <img 
                              src={homeBadge} 
                              alt={home} 
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-xs">D</span></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center">
                              <span className="font-bold text-white text-xs">D</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mx-3 text-white">vs</div>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                          {awayBadge ? (
                            <img 
                              src={awayBadge} 
                              alt={away} 
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-xs">D</span></div>';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center">
                              <span className="font-bold text-white text-xs">D</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <h3 className="font-semibold text-center text-white text-sm">{match.title}</h3>
                    <p className="text-center text-gray-300 text-xs mt-1">{match.title.split('-').pop()?.trim() || 'Football'}</p>
                  </div>
                </AspectRatio>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PopularGames;
