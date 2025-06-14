
import React, { useState } from "react";

const BANNER_LINK = "https://monkeyhundredsarmed.com/zbt0wegpe?key=39548340a9430381e48a2856c8cf8d37";

const BannerAd: React.FC = () => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 pointer-events-none">
      <div
        className="bg-white dark:bg-black border border-black dark:border-white shadow-xl rounded-lg max-w-md w-full sm:max-w-lg mx-auto flex flex-col items-center py-4 px-4 relative pointer-events-auto"
        style={{
          top: "18vh",
          position: "relative",
        }}
      >
        <button
          aria-label="Close Banner Ad"
          className="absolute top-2 right-2 text-black dark:text-white text-lg font-bold px-2 hover:text-red-500 rounded"
          onClick={() => setClosed(true)}
        >
          ×
        </button>
        <a
          href={BANNER_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex flex-col items-center"
        >
          <span className="text-base font-semibold text-[#2C2E34] dark:text-white mb-1">
            🎯 Special Offer — Tap to Access!
          </span>
          <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg py-3 px-2 text-center font-semibold text-sm hover:from-blue-600 hover:to-purple-700 transition-all">
            Exclusive Offers - Click Here!
          </div>
        </a>
      </div>
    </div>
  );
};

export default BannerAd;
