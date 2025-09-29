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
        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-green-500/20"
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
        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-orange-500/20"
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
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-500/20"
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