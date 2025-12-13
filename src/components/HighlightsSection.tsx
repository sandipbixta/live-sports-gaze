import React, { useState, useEffect, useCallback } from 'react';
import { Play, RefreshCw, Film, Calendar, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SectionHeader from './SectionHeader';
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
  strSport: string;
}

interface LeagueHighlights {
  leagueName: string;
  highlights: HighlightEvent[];
}

const SPORTS_DB_API_KEY = '751945';
const SPORTS_DB_BASE_URL = 'https://www.thesportsdb.com/api/v1/json';

// Popular leagues to fetch highlights for
const POPULAR_LEAGUES = [
  { id: '4328', name: 'Premier League' },
  { id: '4335', name: 'La Liga' },
  { id: '4331', name: 'Bundesliga' },
  { id: '4332', name: 'Serie A' },
  { id: '4334', name: 'Ligue 1' },
  { id: '4480', name: 'Champions League' },
];

const HighlightsSection: React.FC = () => {
  const [leagueHighlights, setLeagueHighlights] = useState<LeagueHighlights[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

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
              highlights: eventsToShow
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl animate-pulse">
              <div className="aspect-[4/3] bg-muted rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="flex justify-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="w-10 h-10 rounded-full bg-muted" />
                </div>
                <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : allHighlightsFlat.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No highlights available at the moment. Check back later.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {allHighlightsFlat.slice(0, 10).map((highlight) => {
            const thumbnail = highlight.strThumb || getYoutubeThumbnail(highlight.strVideo || '') || '/placeholder.svg';
            const hasVideo = highlight.strVideo && highlight.strVideo.trim() !== '';
            
            return (
              <a
                key={highlight.idEvent}
                href={highlight.strVideo || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-gradient-to-b from-card to-card/80 rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
              >
                {/* Thumbnail with overlay */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={thumbnail}
                    alt={highlight.strEvent}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-14 h-14 rounded-full ${hasVideo ? 'bg-primary' : 'bg-muted'} flex items-center justify-center shadow-lg transform transition-all duration-300 ${hasVideo ? 'group-hover:scale-110 group-hover:bg-primary/90' : ''}`}>
                      {hasVideo ? (
                        <Play className="w-7 h-7 text-primary-foreground fill-current ml-1" />
                      ) : (
                        <Film className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {/* League badge */}
                  <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-[10px] font-semibold shadow-md">
                    <Trophy className="w-3 h-3 mr-1" />
                    {(highlight as any).leagueName}
                  </Badge>
                  
                  {/* Highlights label */}
                  {hasVideo && (
                    <Badge className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-semibold animate-pulse">
                      HIGHLIGHTS
                    </Badge>
                  )}
                  
                  {/* Score overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex flex-col items-center">
                        <TeamLogo teamName={highlight.strHomeTeam} sport="football" size="sm" className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full p-1" />
                        <span className="text-white text-[10px] font-medium mt-1 truncate max-w-[60px]">
                          {highlight.strHomeTeam?.split(' ').slice(-1)[0]}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
                        <span className="text-white text-lg font-bold">{highlight.intHomeScore ?? '-'}</span>
                        <span className="text-white/60 text-sm">-</span>
                        <span className="text-white text-lg font-bold">{highlight.intAwayScore ?? '-'}</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <TeamLogo teamName={highlight.strAwayTeam} sport="football" size="sm" className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full p-1" />
                        <span className="text-white text-[10px] font-medium mt-1 truncate max-w-[60px]">
                          {highlight.strAwayTeam?.split(' ').slice(-1)[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom info */}
                <div className="p-3 bg-card">
                  <p className="text-xs font-medium text-foreground text-center line-clamp-1 mb-1">
                    {highlight.strHomeTeam} vs {highlight.strAwayTeam}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px]">
                      {new Date(highlight.dateEvent).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HighlightsSection;
