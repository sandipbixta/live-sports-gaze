import React from 'react';
import { MessageCircle, ExternalLink, Zap } from 'lucide-react';
import { Button } from './ui/button';

interface TelegramBannerProps {
  className?: string;
}

const TelegramBanner: React.FC<TelegramBannerProps> = ({ className = "" }) => {
  const handleTelegramClick = () => {
    window.open('https://t.me/+S_YzycKP4PNkZDI0', '_blank', 'noopener,noreferrer');
  };

  const handleMiraFootballClick = () => {
    window.open('https://mirafootball.site/', '_blank', 'noopener,noreferrer');
  };

  const handleGoalKickClick = () => {
    window.open('https://goalkick.live/', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`w-full space-y-3 ${className}`}>
      {/* MiraFootball Promotion */}
      <Button
        onClick={handleMiraFootballClick}
        className="w-full bg-sports-primary hover:bg-sports-accent text-primary-foreground py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
        variant="default"
      >
        <div className="flex items-center justify-center gap-2 w-full">
          <Zap className="h-5 w-5" />
          <span className="font-medium">MiraFootball - Zero Buffer, Clean HD Streams</span>
          <ExternalLink className="h-4 w-4 opacity-80" />
        </div>
      </Button>

      {/* GoalKick Promotion */}
      <Button
        onClick={handleGoalKickClick}
        className="w-full bg-sports-secondary hover:bg-sports-accent text-primary-foreground py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
        variant="default"
      >
        <div className="flex items-center justify-center gap-2 w-full">
          <Zap className="h-5 w-5" />
          <span className="font-medium">GoalKick.live - Premium Sports Streaming</span>
          <ExternalLink className="h-4 w-4 opacity-80" />
        </div>
      </Button>

      {/* Telegram Banner */}
      <Button
        onClick={handleTelegramClick}
        className="w-full bg-primary hover:bg-accent text-primary-foreground py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
        variant="default"
      >
        <div className="flex items-center justify-center gap-2 w-full">
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Join Our Telegram Group for Latest Updates</span>
          <ExternalLink className="h-4 w-4 opacity-80" />
        </div>
      </Button>
    </div>
  );
};

export default TelegramBanner;