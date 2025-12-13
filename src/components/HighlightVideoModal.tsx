import React, { useState } from 'react';
import { X, Play, Calendar, Trophy, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import TeamLogo from './TeamLogo';

interface HighlightEvent {
  idEvent: string;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strThumb: string | null;
  strVideo: string | null;
  strLeague: string;
  dateEvent: string;
  leagueName?: string;
}

interface HighlightVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlight: HighlightEvent | null;
  allHighlights: HighlightEvent[];
  onSelectHighlight: (highlight: HighlightEvent) => void;
}

const HighlightVideoModal: React.FC<HighlightVideoModalProps> = ({
  isOpen,
  onClose,
  highlight,
  allHighlights,
  onSelectHighlight,
}) => {
  if (!highlight) return null;

  // Extract YouTube video ID from URL
  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const videoId = extractYoutubeId(highlight.strVideo || '');

  // Get recommended highlights (exclude current one, same league first)
  const getRecommendedHighlights = () => {
    const currentLeague = (highlight as any).leagueName || highlight.strLeague;
    
    // Filter out current highlight
    const otherHighlights = allHighlights.filter(h => h.idEvent !== highlight.idEvent);
    
    // Sort: same league first, then others
    const sorted = otherHighlights.sort((a, b) => {
      const aLeague = (a as any).leagueName || a.strLeague;
      const bLeague = (b as any).leagueName || b.strLeague;
      
      if (aLeague === currentLeague && bLeague !== currentLeague) return -1;
      if (bLeague === currentLeague && aLeague !== currentLeague) return 1;
      return 0;
    });
    
    return sorted.slice(0, 6);
  };

  const recommendedHighlights = getRecommendedHighlights();

  const getYoutubeThumbnail = (videoUrl: string): string | null => {
    const id = extractYoutubeId(videoUrl);
    if (id) {
      return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 bg-background border-border">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Main Video Section */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="aspect-video bg-black relative">
              {videoId ? (
                <>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                    title={highlight.strEvent}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {/* Fallback overlay for blocked videos */}
                  <div className="absolute bottom-4 right-4">
                    <a
                      href={highlight.strVideo || `https://www.youtube.com/watch?v=${videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Watch on YouTube
                    </a>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <p>Video not available</p>
                </div>
              )}
            </div>

            {/* Match Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">
                  {(highlight as any).leagueName || highlight.strLeague}
                </span>
                <span className="text-muted-foreground">•</span>
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(highlight.dateEvent).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {/* Teams and Score */}
              <div className="flex items-center justify-center gap-6 py-4">
                <div className="flex flex-col items-center gap-2">
                  <TeamLogo teamName={highlight.strHomeTeam} sport="football" size="lg" />
                  <span className="text-sm font-medium text-foreground text-center">
                    {highlight.strHomeTeam}
                  </span>
                </div>

                <div className="flex items-center gap-3 bg-card rounded-xl px-6 py-3">
                  <span className="text-3xl font-bold text-foreground">
                    {highlight.intHomeScore ?? '-'}
                  </span>
                  <span className="text-xl text-muted-foreground">-</span>
                  <span className="text-3xl font-bold text-foreground">
                    {highlight.intAwayScore ?? '-'}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <TeamLogo teamName={highlight.strAwayTeam} sport="football" size="lg" />
                  <span className="text-sm font-medium text-foreground text-center">
                    {highlight.strAwayTeam}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Highlights Sidebar */}
          <div className="lg:col-span-1 bg-card/50 border-l border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">More Highlights</h3>
            </div>

            <div className="p-2 space-y-2 max-h-[60vh] overflow-y-auto">
              {recommendedHighlights.map((rec) => {
                const hasVideo = rec.strVideo && rec.strVideo.trim() !== '';
                const thumbnail = rec.strThumb || getYoutubeThumbnail(rec.strVideo || '') || '/placeholder.svg';

                return (
                  <button
                    key={rec.idEvent}
                    onClick={() => hasVideo && onSelectHighlight(rec)}
                    disabled={!hasVideo}
                    className={`w-full flex gap-3 p-2 rounded-lg transition-colors text-left ${
                      hasVideo 
                        ? 'hover:bg-accent cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-32 flex-shrink-0 aspect-video rounded-md overflow-hidden">
                      <img
                        src={thumbnail}
                        alt={rec.strEvent}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      {hasVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-primary font-medium truncate">
                        {(rec as any).leagueName || rec.strLeague}
                      </p>
                      <p className="text-sm font-medium text-foreground line-clamp-2 mt-0.5">
                        {rec.strHomeTeam} vs {rec.strAwayTeam}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {rec.intHomeScore} - {rec.intAwayScore}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(rec.dateEvent).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {recommendedHighlights.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No more highlights available
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HighlightVideoModal;
