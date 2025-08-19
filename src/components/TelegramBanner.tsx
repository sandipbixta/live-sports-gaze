import React from 'react';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface TelegramBannerProps {
  className?: string;
}

const TelegramBanner: React.FC<TelegramBannerProps> = ({ className = "" }) => {
  const handleTelegramClick = () => {
    window.open('https://t.me/+S_YzycKP4PNkZDI0', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`w-full ${className}`}>
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