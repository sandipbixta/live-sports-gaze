
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Match } from '@/types/sports';
import TeamDisplay from './TeamDisplay';

interface MatchBannerProps {
  match: Match;
  streamAvailable: boolean;
  isMobile: boolean;
}

const MatchBanner: React.FC<MatchBannerProps> = ({ match, streamAvailable, isMobile }) => {
  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasTeams = !!home && !!away;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isMobile) {
    return (
      <div 
        className="bg-gradient-to-r from-[#151922] to-[#242836] py-4 sm:py-6 md:py-10 px-2 sm:px-4 relative"
        style={{
          backgroundImage: `linear-gradient(rgba(21, 25, 34, 0.8), rgba(36, 40, 54, 0.8)), url('/lovable-uploads/eea0415f-461e-4279-a1d2-06165804c368.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto">
          <div className="flex flex-col items-center">
            {hasTeams ? (
              // Teams row - Only show if we have both teams
              <div className="flex items-center justify-center w-full mb-3 sm:mb-4">
                {/* Home team */}
                <div className="w-1/3">
                  <TeamDisplay 
                    name={home} 
                    badge={match.teams?.home?.badge} 
                    size="small" 
                  />
                </div>

                {/* VS section */}
                <div className="flex flex-col items-center w-1/3">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-0 sm:mb-1">VS</div>
                  <div className="text-gray-400 text-[10px] sm:text-xs">
                    {formatTime(match.date)}
                  </div>
                  <div className="text-gray-400 text-[10px] sm:text-xs">
                    {formatDate(match.date)}
                  </div>
                </div>

                {/* Away team */}
                <div className="w-1/3">
                  <TeamDisplay 
                    name={away} 
                    badge={match.teams?.away?.badge} 
                    size="small" 
                  />
                </div>
              </div>
            ) : (
              // Non-team content (e.g., motorsports)
              <div className="flex flex-col items-center justify-center mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-bold text-white mb-1">{match.title}</h2>
                <div className="text-gray-400 text-[10px] sm:text-xs">
                  {formatTime(match.date)} - {formatDate(match.date)}
                </div>
              </div>
            )}
              
            {/* Live badge for mobile */}
            {streamAvailable && (
              <div className="mt-2 sm:mt-3">
                <Badge variant="live" className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm bg-[#fa2d04]">LIVE NOW</Badge>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div 
      className="bg-gradient-to-r from-[#151922] to-[#242836] py-4 sm:py-6 md:py-10 px-2 sm:px-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(21, 25, 34, 0.8), rgba(36, 40, 54, 0.8)), url('/lovable-uploads/eea0415f-461e-4279-a1d2-06165804c368.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-16 lg:space-x-20">
          {hasTeams ? (
            // Team-based layout for desktop
            <>
              <TeamDisplay 
                name={home} 
                badge={match.teams?.home?.badge} 
                size="large" 
              />
              
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3">VS</div>
                <div className="flex items-center space-x-2 text-gray-400 text-xs md:text-sm">
                  <span>{formatTime(match.date)}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-xs md:text-sm mt-1">
                  <span>{formatDate(match.date)}</span>
                </div>
              </div>
              
              <TeamDisplay 
                name={away} 
                badge={match.teams?.away?.badge} 
                size="large" 
              />
            </>
          ) : (
            // Non-team content for desktop (e.g., motorsports)
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{match.title}</h2>
              <div className="flex flex-col items-center space-y-1">
                <div className="text-gray-400 text-sm md:text-base">
                  {formatTime(match.date)}
                </div>
                <div className="text-gray-400 text-sm md:text-base">
                  {formatDate(match.date)}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Live badge for desktop */}
        {streamAvailable && (
          <div className="flex justify-center mt-6 md:mt-8">
            <Badge variant="live" className="px-3 py-1 text-sm md:text-base bg-[#ff5a36]">LIVE NOW</Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchBanner;
