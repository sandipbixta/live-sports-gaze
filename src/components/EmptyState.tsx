
import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-3 text-white">Live & Upcoming Matches</h2>
      <div className="bg-[#242836] border-[#343a4d] rounded-xl p-4 text-center">
        <p className="text-gray-300 text-sm">No matches available for this sport right now.</p>
      </div>
    </div>
  );
};

export default EmptyState;
