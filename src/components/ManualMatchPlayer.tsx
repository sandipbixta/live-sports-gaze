import React, { useState } from 'react';
import ManualMatchCard from './ManualMatchCard';
import { ManualMatch } from '../types/sports'; // Your type import
import ManualMatchPlayer from './ManualMatchPlayer'; // Your video player modal

const manualMatches: ManualMatch[] = [
  // your matches array here or import it
];

const ManualMatchesSection: React.FC = () => {
  const [selectedMatch, setSelectedMatch] = useState<ManualMatch | null>(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  const handleWatchNow = (match: ManualMatch) => {
    setSelectedMatch(match);
    setPlayerOpen(true);
  };

  const closePlayer = () => {
    setPlayerOpen(false);
    setSelectedMatch(null);
  };

  return (
    <div className="space-y-6">
      {manualMatches.map(match => (
        <ManualMatchCard key={match.id} match={match} onWatchNow={handleWatchNow} />
      ))}

      {selectedMatch && (
        <ManualMatchPlayer
          isOpen={playerOpen}
          onClose={closePlayer}
          streamUrl={selectedMatch.streamUrl}
          title={selectedMatch.title}
        />
      )}
    </div>
  );
};

export default ManualMatchesSection;
