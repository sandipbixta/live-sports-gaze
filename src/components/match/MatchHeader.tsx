
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Match } from '@/types/sports';
import { useMatchNavigation } from '@/hooks/useMatchNavigation';
import MatchBanner from './MatchBanner';

interface MatchHeaderProps {
  match: Match;
  streamAvailable: boolean;
}

const MatchHeader = ({ match, streamAvailable }: MatchHeaderProps) => {
  const { handleGoBack, isMobile } = useMatchNavigation();
    
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
              className="text-gray-300 hover:text-white mr-2 sm:mr-4 touch-manipulation min-h-[44px] min-w-[44px]"
            >
              <ChevronLeft className="mr-1" />
              Back
            </Button>
            <h1 className="text-base sm:text-xl font-bold text-white truncate">{match.title}</h1>
          </div>
        </div>
      </header>
      
      {/* Match banner */}
      <MatchBanner 
        match={match} 
        streamAvailable={streamAvailable} 
        isMobile={isMobile} 
      />
    </>
  );
};

export default MatchHeader;
