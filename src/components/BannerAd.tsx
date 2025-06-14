
import React, { useState } from "react";

const BANNER_LINK = "https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37";

const BannerAd: React.FC = () => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="w-full bg-white dark:bg-black border-b border-black dark:border-white shadow-md flex items-center justify-center px-2 py-2 z-30">
      <div className="flex items-center justify-between w-full max-w-3xl mx-auto relative">
        <a
          href={BANNER_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2"
        >
          <span className="text-sm font-semibold text-[#2C2E34] dark:text-white whitespace-nowrap">
            🎯 Special Offer — Tap to Access!
          </span>
          <span className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md py-2 px-3 text-center font-semibold text-xs sm:text-sm hover:from-blue-600 hover:to-purple-700 transition-all">
            Exclusive Offers - Click Here!
          </span>
        </a>
        <button
          aria-label="Close Banner Ad"
          className="absolute top-1 right-1 text-black dark:text-white text-lg font-bold px-2 hover:text-red-500 rounded"
          onClick={() => setClosed(true)}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default BannerAd;
