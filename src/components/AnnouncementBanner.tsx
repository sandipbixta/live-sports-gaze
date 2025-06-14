
import React from 'react';

const AnnouncementBanner: React.FC = () => {
  return (
    <div className="mb-6 bg-gradient-to-r from-[#ff5a36] to-[#e64d2e] rounded-lg p-1 overflow-hidden">
      <div className="bg-[#0A0F1C] rounded-md p-3">
        <div className="overflow-hidden whitespace-nowrap">
          <div className="animate-marquee inline-block text-white font-medium">
            🔴 IF YOU CAN'T FIND YOUR MATCH PLEASE VISIT THE LIVE SPORTS CHANNELS SECTION 📺
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
