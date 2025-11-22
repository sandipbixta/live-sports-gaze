import React from 'react';
import { ExternalLink, Zap, BookOpen } from 'lucide-react';
import { Button } from './ui/button';

interface TelegramBannerProps {
  className?: string;
}

const TelegramBanner: React.FC<TelegramBannerProps> = ({ className = "" }) => {
  const handleBlogClick = () => {
    window.open('https://www.damitvsports.com/', '_blank', 'noopener,noreferrer');
  };

  const handleMiraFootballClick = () => {
    window.open('https://mirafootball.site/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* MiraFootball Promotion */}
      <Button
        onClick={handleMiraFootballClick}
        className="w-full bg-sports-primary hover:bg-sports-accent text-white py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
        variant="default"
      >
        <div className="flex items-center justify-center gap-2 w-full">
          <Zap className="h-5 w-5" />
          <span className="font-medium">MiraFootball - Zero Buffer, Clean HD Streams</span>
          <ExternalLink className="h-4 w-4 opacity-80" />
        </div>
      </Button>

      {/* Blog Banner */}
      <Button
        onClick={handleBlogClick}
        className="w-full bg-gradient-to-r from-sports-primary to-sports-accent hover:from-sports-accent hover:to-sports-primary text-white py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
        variant="default"
      >
        <div className="flex items-center justify-center gap-2 w-full">
          <BookOpen className="h-5 w-5" />
          <span className="font-medium">🔥 Discover Exclusive Sports News & Match Insights!</span>
          <ExternalLink className="h-4 w-4 opacity-80" />
        </div>
      </Button>
    </div>
  );
};

export default TelegramBanner;