
import React from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../types/sports';

interface PopularGamesProps {
  popularMatches: Match[];
  selectedSport: string | null;
}

const PopularGames: React.FC<PopularGamesProps> = ({ popularMatches, selectedSport }) => {
  if (popularMatches.length === 0) {
    return null;
  }

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
          
          return (
            <Link to={`/match/${selectedSport}/${match.id}`} key={`popular-${match.id}`} className="group">
              <div className="bg-[#242836] border border-[#9b87f5]/30 rounded-xl p-4 h-full hover:shadow-lg hover:shadow-[#9b87f5]/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center mb-4">
                  <div className="flex flex-col items-center">
                    {homeBadge ? (
                      <img 
                        src={homeBadge} 
                        alt={home} 
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#343a4d] rounded-full flex items-center justify-center">
                        <span className="font-bold text-white">{home.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mx-4">
                    <span className="text-sm text-gray-300">vs</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    {awayBadge ? (
                      <img 
                        src={awayBadge} 
                        alt={away} 
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-[#343a4d] rounded-full flex items-center justify-center">
                        <span className="font-bold text-white">{away.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="font-bold text-center text-white">{match.title}</h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PopularGames;
