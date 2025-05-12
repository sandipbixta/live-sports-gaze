
import React from 'react';
import { Match } from '../types/sports';
import { Card, CardContent } from './ui/card';

interface MatchesListProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  isLoading: boolean;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, onSelectMatch, isLoading }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Matches</h2>
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No matches available for this sport right now.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Matches</h2>
      <div className="space-y-4">
        {matches.map((match) => {
          const homeBadge = match.teams?.home?.badge 
            ? `https://streamed.su/api/images/badge/${match.teams.home.badge}.webp` 
            : '';
          const awayBadge = match.teams?.away?.badge 
            ? `https://streamed.su/api/images/badge/${match.teams.away.badge}.webp` 
            : '';
          const home = match.teams?.home?.name || 'Team A';
          const away = match.teams?.away?.name || 'Team B';

          return (
            <Card 
              key={match.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectMatch(match)}
            >
              <CardContent className="p-4">
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center">
                    {homeBadge && (
                      <img 
                        src={homeBadge} 
                        alt={home} 
                        className="w-6 h-6 mr-2"
                        onError={(e) => {
                          // Handle image load error
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span className="font-medium">{home}</span>
                  </div>
                  
                  <span className="px-2 text-gray-500">vs</span>
                  
                  <div className="flex items-center">
                    {awayBadge && (
                      <img 
                        src={awayBadge} 
                        alt={away} 
                        className="w-6 h-6 mr-2"
                        onError={(e) => {
                          // Handle image load error
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <span className="font-medium">{away}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  <p className="font-medium">{match.title}</p>
                  <p>{formatDate(match.date)}</p>
                  {match.sources?.length > 0 ? (
                    <div className="mt-1 text-sports-primary">
                      Live Stream Available
                    </div>
                  ) : (
                    <div className="mt-1 text-gray-400">
                      No streams available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MatchesList;
