import React from 'react';
import { Stream } from '../types/sports';
import { Match } from '../types/sports';
import { ManualMatch } from '../types/manualMatch';
import SimpleVideoPlayer from './StreamPlayer/SimpleVideoPlayer';
import StreamOptimizer from './StreamPlayer/StreamOptimizer';
import MatchDetails from './MatchDetails';
import { ViewerCount } from './ViewerCount';
import { useViewerTracking } from '@/hooks/useViewerTracking';

interface StreamPlayerProps {
  stream: Stream | null;
  isLoading: boolean;
  onRetry?: () => void;
  isManualChannel?: boolean;
  isTvChannel?: boolean;
  title?: string;
  isTheaterMode?: boolean;
  onTheaterModeToggle?: () => void;
  match?: Match | ManualMatch | null;
  showMatchDetails?: boolean;
}

const StreamPlayer: React.FC<StreamPlayerProps> = ({ 
  stream, 
  isLoading, 
  onRetry,
  isManualChannel = false,
  isTvChannel = false,
  title,
  isTheaterMode = false,
  onTheaterModeToggle,
  match = null,
  showMatchDetails = true
}) => {
  // Track viewer for this match
  useViewerTracking(match?.id);

  // Determine if match is live based on stream availability and match time
  const isLive = stream && match && (
    Date.now() - (typeof match.date === 'number' ? match.date : new Date(match.date).getTime()) > -30 * 60 * 1000 && // Started within last 30 minutes
    Date.now() - (typeof match.date === 'number' ? match.date : new Date(match.date).getTime()) < 3 * 60 * 60 * 1000   // Less than 3 hours old
  );

  return (
    <>
      <StreamOptimizer stream={stream} />
      <div className="relative">
        <SimpleVideoPlayer 
          stream={stream}
          isLoading={isLoading}
          onRetry={onRetry}
          isTheaterMode={isTheaterMode}
          onTheaterModeToggle={onTheaterModeToggle}
        />
        
        {/* Viewer Count Overlay - Bottom Right */}
        {match && !isTheaterMode && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg">
            <ViewerCount matchId={match.id} />
          </div>
        )}
      </div>
      
      {/* Match Details Below Player */}
      {showMatchDetails && match && !isTheaterMode && (
        <div className="mt-4 px-4">
          <MatchDetails 
            match={match}
            isLive={!!isLive}
            showCompact={false}
          />
        </div>
      )}
    </>
  );
};

export default StreamPlayer;