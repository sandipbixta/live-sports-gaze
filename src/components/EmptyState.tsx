
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-3 text-white">Live & Upcoming Matches</h2>
      <div className="bg-[#242836] border-[#343a4d] rounded-xl p-4 text-center">
        <p className="text-gray-300 text-sm mb-3">No matches available for this sport right now.</p>
        <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-3">
          <p className="text-orange-200 text-sm">
            Having problems on this website? Visit our alternative site: 
            <a 
              href="https://www.mirafootball.site" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 font-medium ml-1 underline"
            >
              www.mirafootball.site
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
