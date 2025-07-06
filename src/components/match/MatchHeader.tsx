import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Match } from '@/types/sports';
import { useIsMobile } from '@/hooks/use-mobile';

interface MatchHeaderProps {
  match: Match;
  streamAvailable: boolean;
}

const MatchHeader = ({ match, streamAvailable }: MatchHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const home = match.teams?.home?.name || '';
  const away = match.teams?.away?.name || '';
  const hasTeams = !!home && !!away;
  const homeBadge = match.teams?.home?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.home.badge}.webp` 
    : '';
  const awayBadge = match.teams?.away?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.away.badge}.webp` 
    : '';
  
  const handleGoBack = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Header back button clicked on mobile:', isMobile);
    
    // Enhanced navigation with multiple fallbacks
    try {
      // First attempt: use React Router navigation
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/channels', { replace: true });
      }
    } catch (error) {
      console.error('React Router navigation failed:', error);
      // Fallback: use browser history
      try {
        window.history.back();
      } catch (historyError) {
        console.error('Browser history navigation failed:', historyError);
        // Final fallback: direct page navigation
        window.location.href = '/channels';
      }
    }
  };
    
  return (
    <>
      {/* Header with navigation */}
      <header className="bg-sports-darker shadow-md">
        <div className="container mx-auto py-2 sm:py-4 px-2 sm:px-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoBack}
              onTouchEnd={handleGoBack}
              className="text-gray-300 hover:text-white mr-2 sm:mr-4 touch-manipulation min-h-[44px] min-w-[44px]"
            >
              <ChevronLeft className="mr-1" />
              Back
            </Button>
            <h1 className="text-base sm:text-xl font-bold text-white truncate">{match.title}</h1>
          </div>
        </div>
      </header>
      
      {/* Match banner - Mobile Horizontal Layout / Desktop Vertical Layout */}
      <div className="bg-gradient-to-r from-[#151922] to-[#242836] py-4 sm:py-6 md:py-10 px-2 sm:px-4">
        <div className="container mx-auto">
          {isMobile ? (
            // Mobile horizontal layout
            <div className="flex flex-col items-center">
              {hasTeams ? (
                // Teams row - Only show if we have both teams
                <div className="flex items-center justify-center w-full mb-3 sm:mb-4">
                  {/* Home team */}
                  <div className="flex flex-col items-center text-center w-1/3">
                    {homeBadge ? (
                      <img 
                        src={homeBadge} 
                        alt={home} 
                        className="w-12 h-12 sm:w-16 sm:h-16 mb-1 sm:mb-2 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#343a4d] rounded-full flex items-center justify-center mb-1 sm:mb-2">
                        <span className="text-lg sm:text-xl font-bold text-white">{home.charAt(0)}</span>
                      </div>
                    )}
                    <h2 className="text-xs sm:text-sm font-bold text-white">{home}</h2>
                  </div>

                  {/* VS section */}
                  <div className="flex flex-col items-center w-1/3">
                    <div className="text-xl sm:text-2xl font-bold text-white mb-0 sm:mb-1">VS</div>
                    <div className="text-gray-400 text-[10px] sm:text-xs">
                      {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-gray-400 text-[10px] sm:text-xs">
                      {new Date(match.date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Away team */}
                  <div className="flex flex-col items-center text-center w-1/3">
                    {awayBadge ? (
                      <img 
                        src={awayBadge} 
                        alt={away} 
                        className="w-12 h-12 sm:w-16 sm:h-16 mb-1 sm:mb-2 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#343a4d] rounded-full flex items-center justify-center mb-1 sm:mb-2">
                        <span className="text-lg sm:text-xl font-bold text-white">{away.charAt(0)}</span>
                      </div>
                    )}
                    <h2 className="text-xs sm:text-sm font-bold text-white">{away}</h2>
                  </div>
                </div>
              ) : (
                // Non-team content (e.g., motorsports)
                <div className="flex flex-col items-center justify-center mb-3 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-white mb-1">{match.title}</h2>
                  <div className="text-gray-400 text-[10px] sm:text-xs">
                    {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(match.date).toLocaleDateString()}
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
          ) : (
            // Desktop layout 
            <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-16 lg:space-x-20">
              {hasTeams ? (
                // Team-based layout for desktop
                <>
                  <div className="flex flex-col items-center text-center">
                    {homeBadge ? (
                      <img 
                        src={homeBadge} 
                        alt={home} 
                        className="w-20 h-20 md:w-24 md:h-24 mb-2 md:mb-3 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-[#343a4d] rounded-full flex items-center justify-center mb-2 md:mb-3">
                        <span className="text-2xl md:text-3xl font-bold text-white">{home.charAt(0)}</span>
                      </div>
                    )}
                    <h2 className="text-lg md:text-xl font-bold text-white">{home}</h2>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3">VS</div>
                    <div className="flex items-center space-x-2 text-gray-400 text-xs md:text-sm">
                      <span>{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400 text-xs md:text-sm mt-1">
                      <span>{new Date(match.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    {awayBadge ? (
                      <img 
                        src={awayBadge} 
                        alt={away} 
                        className="w-20 h-20 md:w-24 md:h-24 mb-2 md:mb-3 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-[#343a4d] rounded-full flex items-center justify-center mb-2 md:mb-3">
                        <span className="text-2xl md:text-3xl font-bold text-white">{away.charAt(0)}</span>
                      </div>
                    )}
                    <h2 className="text-lg md:text-xl font-bold text-white">{away}</h2>
                  </div>
                </>
              ) : (
                // Non-team content for desktop (e.g., motorsports)
                <div className="flex flex-col items-center justify-center">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{match.title}</h2>
                  <div className="flex flex-col items-center space-y-1">
                    <div className="text-gray-400 text-sm md:text-base">
                      {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-gray-400 text-sm md:text-base">
                      {new Date(match.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Live badge for desktop */}
          {!isMobile && streamAvailable && (
            <div className="flex justify-center mt-6 md:mt-8">
              <Badge variant="live" className="px-3 py-1 text-sm md:text-base bg-[#ff5a36]">LIVE NOW</Badge>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MatchHeader;
