
import React from 'react';
import { Link } from 'react-router-dom';
import { Match } from '../types/sports';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight } from 'lucide-react';

interface MatchesListProps {
  matches: Match[];
  sportId: string;
  isLoading: boolean;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, sportId, isLoading }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Live & Upcoming Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-[#242836] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Live & Upcoming Matches</h2>
        <Card className="bg-[#242836] border-[#343a4d]">
          <CardContent className="p-8 text-center">
            <p className="text-gray-400">No matches available for this sport right now.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Live & Upcoming Matches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => {
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
            <Link to={`/match/${sportId}/${match.id}`} key={match.id} className="group">
              <Card className="bg-[#242836] border-[#343a4d] h-full overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#9b87f5]/10 group-hover:border-[#9b87f5]/30 group-hover:-translate-y-1">
                <div className="h-32 bg-gradient-to-r from-[#151922] to-[#242836] relative flex items-center justify-center p-4">
                  <div className="flex items-center justify-center w-full">
                    <div className="flex flex-col items-center">
                      {homeBadge ? (
                        <img 
                          src={homeBadge} 
                          alt={home} 
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#343a4d] rounded-full flex items-center justify-center">
                          <span className="font-bold">{home.charAt(0)}</span>
                        </div>
                      )}
                      <span className="mt-2 font-semibold text-sm whitespace-nowrap text-center">{home}</span>
                    </div>
                    
                    <div className="mx-4">
                      <div className="w-10 h-10 rounded-full bg-[#343a4d] flex items-center justify-center">
                        <span className="font-bold text-gray-400">VS</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      {awayBadge ? (
                        <img 
                          src={awayBadge} 
                          alt={away} 
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#343a4d] rounded-full flex items-center justify-center">
                          <span className="font-bold">{away.charAt(0)}</span>
                        </div>
                      )}
                      <span className="mt-2 font-semibold text-sm whitespace-nowrap text-center">{away}</span>
                    </div>
                  </div>
                  
                  {hasStream && (
                    <Badge className="absolute top-3 left-3 bg-[#1EAEDB]">LIVE</Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2 line-clamp-1">{match.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">{formatDate(match.date)}</p>
                  
                  <div className="flex justify-between items-center mt-4">
                    {hasStream ? (
                      <Badge variant="outline" className="bg-transparent text-[#1EAEDB] border-[#1EAEDB] flex items-center gap-1">
                        Watch <ArrowRight className="h-3 w-3" />
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-transparent text-gray-400 border-gray-600">
                        Coming soon
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MatchesList;
