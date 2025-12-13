import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionHeader from './SectionHeader';
import TeamLogo from './TeamLogo';
import HighlightVideoModal from './HighlightVideoModal';

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
  strSport: string;
  leagueName?: string;
}

interface LeagueHighlights {
  leagueName: string;
  highlights: HighlightEvent[];
}

const SPORTS_DB_API_KEY = '751945';
const SPORTS_DB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

// Popular leagues across all sports
const POPULAR_LEAGUES = [
  // Football
  { id: '4328', name: 'Premier League', sport: 'Soccer' },
  { id: '4335', name: 'La Liga', sport: 'Soccer' },
  { id: '4331', name: 'Bundesliga', sport: 'Soccer' },
  { id: '4332', name: 'Serie A', sport: 'Soccer' },
  { id: '4480', name: 'Champions League', sport: 'Soccer' },
  // Basketball
  { id: '4387', name: 'NBA', sport: 'Basketball' },
  // American Football
  { id: '4391', name: 'NFL', sport: 'American Football' },
  // Cricket
  { id: '4424', name: 'IPL', sport: 'Cricket' },
  // Ice Hockey
  { id: '4380', name: 'NHL', sport: 'Ice Hockey' },
  // Fighting
  { id: '4443', name: 'UFC', sport: 'Fighting' },
  // Motorsport
  { id: '4370', name: 'Formula 1', sport: 'Motorsport' },
  // Tennis
  { id: '4464', name: 'ATP Tour', sport: 'Tennis' },
];

const HighlightsSection: React.FC = () => {
  const [leagueHighlights, setLeagueHighlights] = useState<LeagueHighlights[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -420, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 420, behavior: 'smooth' });
    }
  };

  const fetchHighlights = useCallback(async () => {
    setLoading(true);
    const allHighlights: LeagueHighlights[] = [];

    try {
      for (const league of POPULAR_LEAGUES) {
        try {
          const url = `${SPORTS_DB_BASE_URL}/${SPORTS_DB_API_KEY}/eventspastleague.php?id=${league.id}`;
          const response = await fetch(url);
          
          if (!response.ok) continue;
          
          const data = await response.json();
          const events = data.events || [];
          
          // Get past matches - prioritize those with video highlights
          const eventsWithVideo = events.filter((event: HighlightEvent) => 
            event.strVideo && event.strVideo.trim() !== ''
          ).slice(0, 5);

          // If no videos available, show recent matches anyway
          const eventsToShow = eventsWithVideo.length > 0 
            ? eventsWithVideo 
            : events.slice(0, 5);

          if (eventsToShow.length > 0) {
            allHighlights.push({
              leagueName: league.name,
              highlights: eventsToShow.map((e: HighlightEvent) => ({ ...e, strSport: league.sport }))
            });
          }
        } catch (err) {
          console.error(`Error fetching highlights for ${league.name}:`, err);
        }
      }

      setLeagueHighlights(allHighlights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching highlights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHighlights();
    
    // Refresh every hour
    const interval = setInterval(fetchHighlights, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchHighlights]);

  const handleRefresh = () => {
    fetchHighlights();
  };

  // Get filtered highlights based on selected league
  const filteredHighlights = selectedLeague
    ? leagueHighlights.filter(lh => lh.leagueName === selectedLeague)
    : leagueHighlights;

  // Flatten all highlights for display
  const allHighlightsFlat = filteredHighlights.flatMap(lh => 
    lh.highlights.map(h => ({ ...h, leagueName: lh.leagueName }))
  );

  // All highlights for recommendations (not filtered)
  const allHighlightsForRecommendations = leagueHighlights.flatMap(lh => 
    lh.highlights.map(h => ({ ...h, leagueName: lh.leagueName }))
  );

  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const getYoutubeThumbnail = (videoUrl: string): string | null => {
    const videoId = extractYoutubeId(videoUrl);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    return null;
  };

  const handleCardClick = (highlight: HighlightEvent, hasVideo: boolean) => {
    if (hasVideo) {
      setSelectedHighlight(highlight);
      setIsModalOpen(true);
    }
  };

  const handleSelectHighlight = (highlight: HighlightEvent) => {
    setSelectedHighlight(highlight);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <SectionHeader title="Match Highlights" />
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* League filter pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedLeague(null)}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
            selectedLeague === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-card text-muted-foreground hover:bg-accent'
          }`}
        >
          All Leagues
        </button>
        {leagueHighlights.map(lh => (
          <button
            key={lh.leagueName}
            onClick={() => setSelectedLeague(lh.leagueName)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedLeague === lh.leagueName
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-accent'
            }`}
          >
            {lh.leagueName}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl animate-pulse flex-shrink-0 w-[200px]">
              <div className="aspect-video bg-muted rounded-t-xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted" />
                  <div className="h-4 bg-muted rounded flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted" />
                  <div className="h-4 bg-muted rounded flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : allHighlightsFlat.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No highlights available at the moment. Check back later.
        </div>
      ) : (
        <div className="relative group/scroll">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background/90 border border-border rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-background"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          
          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-background/90 border border-border rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/scroll:opacity-100 transition-opacity hover:bg-background"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
          
          <div ref={scrollContainerRef} className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
          {allHighlightsFlat.map((highlight) => {
            const thumbnail = highlight.strThumb || getYoutubeThumbnail(highlight.strVideo || '') || '/placeholder.svg';
            const hasVideo = highlight.strVideo && highlight.strVideo.trim() !== '';
            
            return (
              <div
                key={highlight.idEvent}
                onClick={() => handleCardClick(highlight, hasVideo)}
                className={`group flex-shrink-0 w-[200px] ${hasVideo ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="relative overflow-hidden rounded-xl bg-card transition-all duration-300 hover:opacity-90 h-full flex flex-col">
                  {/* Banner Image Section */}
                  <div className="relative aspect-video overflow-hidden rounded-t-xl flex-shrink-0">
                    <img
                      src={thumbnail}
                      alt={highlight.strEvent}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* HIGHLIGHTS Badge - Top left */}
                    <div className="absolute top-2 left-2 z-10">
                      <span className="bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" />
                        {hasVideo ? 'HIGHLIGHTS' : 'RESULT'}
                      </span>
                    </div>
                    
                    {/* Play button overlay */}
                    {hasVideo && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                          <Play className="w-6 h-6 text-primary-foreground fill-current ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-3 flex flex-col gap-2 flex-1 bg-card">
                    {/* Sport • League */}
                    <p className="text-xs text-muted-foreground truncate">
                      {highlight.strSport?.toLowerCase() || 'sports'} • {highlight.leagueName}
                    </p>
                    
                    {/* Home Team with Score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamLogo teamName={highlight.strHomeTeam} sport={highlight.strSport?.toLowerCase() || 'football'} size="sm" showFallbackIcon={false} />
                        <span className="text-sm font-medium truncate text-foreground">
                          {highlight.strHomeTeam}
                        </span>
                      </div>
                      <span className="text-foreground font-bold text-lg ml-2 min-w-[28px] text-right tabular-nums">
                        {highlight.intHomeScore ?? '-'}
                      </span>
                    </div>
                    
                    {/* Away Team with Score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <TeamLogo teamName={highlight.strAwayTeam} sport={highlight.strSport?.toLowerCase() || 'football'} size="sm" showFallbackIcon={false} />
                        <span className="text-sm font-medium truncate text-foreground">
                          {highlight.strAwayTeam}
                        </span>
                      </div>
                      <span className="text-foreground font-bold text-lg ml-2 min-w-[28px] text-right tabular-nums">
                        {highlight.intAwayScore ?? '-'}
                      </span>
                    </div>
                    
                    {/* Date */}
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-xs text-muted-foreground">
                        {new Date(highlight.dateEvent).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      {hasVideo && (
                        <span className="text-xs text-primary font-medium">Watch →</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Video Modal */}
      <HighlightVideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        highlight={selectedHighlight}
        allHighlights={allHighlightsForRecommendations}
        onSelectHighlight={handleSelectHighlight}
      />
    </div>
  );
};

export default HighlightsSection;
