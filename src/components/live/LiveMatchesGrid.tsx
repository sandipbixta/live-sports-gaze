
import React from 'react';
import { Match } from '../../types/sports';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Eye } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LiveMatchesGridProps {
  matches: Match[];
  isLoading: boolean;
  onSelectMatch?: (match: Match) => void;
  title: string;
  isLive?: boolean;
  className?: string;
}

const LiveMatchesGrid: React.FC<LiveMatchesGridProps> = ({ 
  matches, 
  isLoading, 
  onSelectMatch,
  title,
  isLive = false,
  className
}) => {
  if (isLoading) {
    return (
      <div className={cn("w-full", className)}>
        <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-[#242836] rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <h2 className="text-2xl font-bold mb-6 text-white">{title}</h2>
        <div className="w-full bg-[#242836] rounded-xl p-6 text-center">
          <p className="text-gray-300">No {isLive ? 'live' : 'upcoming'} matches currently available.</p>
        </div>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={cn("bg-[#1A1F2C] border-[#343a4d]", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-white">
          {title}
          <div className={`h-1 w-20 ${isLive ? 'bg-[#fa2d04]' : 'bg-gray-400'} mt-2 rounded-full`}></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {matches.map((match) => {
            const hasStream = match.sources?.length > 0;
            const homeBadge = match.teams?.home?.badge 
              ? `https://streamed.su/api/images/badge/${match.teams.home.badge}.webp` 
              : '';
            const awayBadge = match.teams?.away?.badge 
              ? `https://streamed.su/api/images/badge/${match.teams.away.badge}.webp` 
              : '';
            const hasTeamLogos = homeBadge && awayBadge;
            
            return (
              <div 
                key={match.id} 
                className="relative bg-[#242836] border-[#343a4d] border rounded-xl overflow-hidden cursor-pointer hover:bg-[#2a2f3f] transition-all"
                onClick={() => onSelectMatch && onSelectMatch(match)}
              >
                {/* Match Time */}
                <div className="absolute top-2 left-2 z-10">
                  <div className="bg-black/70 text-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold">
                    {formatTime(match.date)}
                  </div>
                </div>
                
                {/* Live Badge */}
                {isLive && hasStream && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="flex items-center gap-1 bg-[#fa2d04] text-white px-2 py-0.5 rounded-md">
                      <Eye className="w-3 h-3" />
                      <span className="text-xs font-medium">WATCH LIVE</span>
                    </div>
                  </div>
                )}
                
                <div className="p-4 pt-8">
                  {hasTeamLogos ? (
                    <div className="flex flex-col items-center justify-center mb-1">
                      <div className="flex items-center justify-center mb-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                          <img 
                            src={homeBadge} 
                            alt={match.teams?.home?.name || ''} 
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-[10px]">D</span></div>';
                            }}
                          />
                        </div>
                        <div className="mx-2 text-white text-xs font-medium">vs</div>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                          <img 
                            src={awayBadge} 
                            alt={match.teams?.away?.name || ''} 
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="w-full h-full bg-[#343a4d] rounded-full flex items-center justify-center"><span class="font-bold text-white text-[10px]">D</span></div>';
                            }}
                          />
                        </div>
                      </div>
                      <h3 className="font-bold mb-1 text-center text-white text-sm">{match.title}</h3>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-[#343a4d] px-3 py-1 rounded-md mb-2">
                        <span className="font-bold text-white text-sm">DAMITV</span>
                      </div>
                      <h3 className="font-bold mb-1 text-center text-white text-sm">{match.title}</h3>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center mt-2">
                    <span className={`w-2 h-2 ${isLive ? 'bg-[#fa2d04]' : 'bg-gray-400'} rounded-full mr-2`}></span>
                    <p className="text-sm text-gray-300">{isLive ? 'Live Now' : 'Coming soon'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveMatchesGrid;
