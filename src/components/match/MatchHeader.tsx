
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Match } from '@/types/sports';

interface MatchHeaderProps {
  match: Match;
  streamAvailable: boolean;
}

const MatchHeader = ({ match, streamAvailable }: MatchHeaderProps) => {
  const home = match.teams?.home?.name || 'Home Team';
  const away = match.teams?.away?.name || 'Away Team';
  const homeBadge = match.teams?.home?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.home.badge}.webp` 
    : '';
  const awayBadge = match.teams?.away?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.away.badge}.webp` 
    : '';
    
  return (
    <>
      {/* Header with navigation */}
      <header className="bg-sports-darker shadow-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center">
            <Link to="/" className="text-gray-300 hover:text-white mr-4">
              <Button variant="ghost" size="sm">
                <ChevronRight className="rotate-180 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">{match.title}</h1>
          </div>
        </div>
      </header>
      
      {/* Match banner */}
      <div className="bg-gradient-to-r from-[#151922] to-[#242836] py-10 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-20">
            <div className="flex flex-col items-center text-center">
              {homeBadge ? (
                <img 
                  src={homeBadge} 
                  alt={home} 
                  className="w-24 h-24 mb-3 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-[#343a4d] rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-white">{home.charAt(0)}</span>
                </div>
              )}
              <h2 className="text-xl font-bold text-white">{home}</h2>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-white mb-3">VS</div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <span>{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-sm mt-1">
                <span>{new Date(match.date).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center">
              {awayBadge ? (
                <img 
                  src={awayBadge} 
                  alt={away} 
                  className="w-24 h-24 mb-3 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-24 h-24 bg-[#343a4d] rounded-full flex items-center justify-center mb-3">
                  <span className="text-3xl font-bold text-white">{away.charAt(0)}</span>
                </div>
              )}
              <h2 className="text-xl font-bold text-white">{away}</h2>
            </div>
          </div>
          
          {streamAvailable && (
            <div className="flex justify-center mt-8">
              <Badge variant="live" className="px-3 py-1 text-base">LIVE NOW</Badge>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MatchHeader;
