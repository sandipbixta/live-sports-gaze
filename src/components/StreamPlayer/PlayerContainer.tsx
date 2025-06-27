
import React from 'react';

interface PlayerContainerProps {
  children: React.ReactNode;
}

const PlayerContainer: React.FC<PlayerContainerProps> = ({ children }) => (
  <div 
    className="relative w-full bg-[#151922] rounded-none sm:rounded-lg overflow-hidden shadow-xl group"
    data-player-container
    style={{
      // Fullscreen styles
      'position': 'relative',
    }}
  >
    {children}
  </div>
);

export default PlayerContainer;
