
import React from 'react';
import { Match } from '@/types/sports';
import BannerMatchCard from './BannerMatchCard';

interface MatchBannerProps {
  match: Match;
  streamAvailable: boolean;
  isMobile: boolean;
}

const MatchBanner: React.FC<MatchBannerProps> = ({ match, streamAvailable, isMobile }) => {
  return (
    <div className="bg-gradient-to-r from-[#151922] to-[#242836] py-4 sm:py-6 md:py-10 px-2 sm:px-4">
      <div className="container mx-auto">
        <BannerMatchCard match={match} streamAvailable={streamAvailable} />
      </div>
    </div>
  );
};

export default MatchBanner;
