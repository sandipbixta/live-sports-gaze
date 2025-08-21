
import { ChevronLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Match } from '@/types/sports';
import { useMatchNavigation } from '@/hooks/useMatchNavigation';
import { useNavigate } from 'react-router-dom';
import MatchBanner from './MatchBanner';

interface MatchHeaderProps {
  match: Match;
  streamAvailable: boolean;
  socialShare?: React.ReactNode;
}

const MatchHeader = ({ match, streamAvailable, socialShare }: MatchHeaderProps) => {
  const { handleGoBack, isMobile } = useMatchNavigation();
  const navigate = useNavigate();
    
  return (
    <>
      {/* Header with navigation only */}
      <header className="bg-sports-darker shadow-md">
        <div className="container mx-auto py-2 sm:py-4 px-2 sm:px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGoBack}
                className="text-gray-300 hover:text-white touch-manipulation min-h-[44px] min-w-[44px]"
              >
                <ChevronLeft className="mr-1" />
                Back
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="text-gray-300 hover:text-white touch-manipulation min-h-[44px] min-w-[44px]"
              >
                <Home className="mr-1" />
                Home
              </Button>
            </div>
            
            {socialShare && (
              <div className="flex items-center gap-2">
                {socialShare}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default MatchHeader;
