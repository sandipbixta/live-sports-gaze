import React, { useState, useEffect, useCallback } from 'react';
import { Play, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SectionHeader from './SectionHeader';

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
          
          // Filter events that have video highlights
          const eventsWithVideo = events.filter((event: HighlightEvent) => 
            event.strVideo && event.strVideo.trim() !== ''
          ).slice(0, 5); // Get max 5 highlights per league

          if (eventsWithVideo.length > 0) {
            allHighlights.push({
              leagueName: league.name,
              highlights: eventsWithVideo
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
            <div key={i} className="bg-card rounded-lg animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
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
            
            return (
              <a
                key={highlight.idEvent}
                href={highlight.strVideo || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <div className="relative aspect-video">
                  <img
                    src={thumbnail}
                    alt={highlight.strEvent}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary-foreground fill-current" />
                    </div>
                  </div>
                  <Badge className="absolute top-2 left-2 bg-black/70 text-white text-[10px]">
                    {(highlight as any).leagueName}
                  </Badge>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                    {highlight.strHomeTeam} vs {highlight.strAwayTeam}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {highlight.intHomeScore} - {highlight.intAwayScore}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(highlight.dateEvent).toLocaleDateString()}
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
