import { useState, useEffect } from 'react';
import { Play, X, Users } from 'lucide-react';

const CDN_API = 'https://api.cdn-live.tv/api/v1/vip/damitv';
const SPORTSDB_API = 'https://www.thesportsdb.com/api/v1/json/751945';

// Logo cache
const logoCache: Record<string, string | null> = {};

const fetchTeamLogo = async (teamName: string): Promise<string | null> => {
  if (!teamName) return null;
  const key = teamName.toLowerCase().trim();
  if (logoCache[key] !== undefined) return logoCache[key];
  
  try {
    const res = await fetch(`${SPORTSDB_API}/searchteams.php?t=${encodeURIComponent(teamName)}`);
    const data = await res.json();
    logoCache[key] = data.teams?.[0]?.strBadge || null;
    return logoCache[key];
  } catch {
    logoCache[key] = null;
    return null;
  }
};

// Parse teams from title "Team A vs Team B"
const parseTeams = (title: string) => {
  const separators = [' vs ', ' VS ', ' v ', ' - ', ' @ '];
  for (const sep of separators) {
    if (title.includes(sep)) {
      const [home, away] = title.split(sep);
      return { home: home?.trim(), away: away?.trim() };
    }
  }
  return { home: title, away: '' };
};

interface Channel {
  name: string;
  url: string;
  image: string | null;
  viewers: number;
}

interface Match {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  time: string;
  isLive: boolean;
  channels: Channel[];
}

const FeaturedFootball = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStream, setActiveStream] = useState<{ matchId: string; channelUrl: string } | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch(`${CDN_API}/events/football/`);
        const data = await res.json();
        const events = data.events || data.matches || data || [];
        
        const parsed = events.map((e: any) => {
          const teams = parseTeams(e.title || '');
          return {
            id: e.id || Math.random().toString(),
            title: e.title || '',
            homeTeam: e.home_team || e.homeTeam || teams.home || 'TBD',
            awayTeam: e.away_team || e.awayTeam || teams.away || 'TBD',
            competition: e.competition || e.league || e.tournament || 'Football',
            time: e.time || e.start_time || '',
            isLive: e.is_live || e.live || e.status === 'live',
            channels: e.channels || [],
          };
        });
        
        // Filter: only show matches with valid teams
        const valid = parsed.filter((m: Match) => 
          m.homeTeam && m.awayTeam && 
          m.homeTeam !== 'TBD' && m.awayTeam !== 'TBD'
        );
        
        setMatches(valid);
      } catch (err) {
        console.error('Failed to fetch football:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          ⚽ Featured Football
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl h-48 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (matches.length === 0) {
    return (
      <section className="py-8">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          ⚽ Featured Football
        </h2>
        <p className="text-muted-foreground text-center py-8">No football matches available</p>
      </section>
    );
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        ⚽ Featured Football
        {matches.some(m => m.isLive) && (
          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full animate-pulse">
            LIVE
          </span>
        )}
      </h2>

      {/* Stream Modal */}
      {activeStream && (
        <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl">
            <button
              onClick={() => setActiveStream(null)}
              className="absolute -top-12 right-0 text-foreground hover:text-destructive transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="aspect-video bg-background rounded-xl overflow-hidden border border-border">
              <iframe
                src={activeStream.channelUrl}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            </div>
          </div>
        </div>
      )}

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onWatch={(channelUrl) => setActiveStream({ matchId: match.id, channelUrl })}
          />
        ))}
      </div>
    </section>
  );
};

// Match Card Component
const MatchCard = ({ match, onWatch }: { match: Match; onWatch: (url: string) => void }) => {
  const [homeLogo, setHomeLogo] = useState<string | null>(null);
  const [awayLogo, setAwayLogo] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamLogo(match.homeTeam).then(setHomeLogo);
    fetchTeamLogo(match.awayTeam).then(setAwayLogo);
  }, [match.homeTeam, match.awayTeam]);

  return (
    <div className="bg-card rounded-xl overflow-hidden hover:ring-2 hover:ring-primary transition-all">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50">
        <span className="text-muted-foreground text-xs truncate">{match.competition}</span>
        {match.isLive ? (
          <span className="flex items-center gap-1 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 bg-destructive-foreground rounded-full animate-pulse" />
            LIVE
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">{match.time}</span>
        )}
      </div>

      {/* Teams */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {homeLogo ? (
              <img src={homeLogo} alt="" className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-foreground font-bold">
                {match.homeTeam.charAt(0)}
              </div>
            )}
            <span className="text-foreground font-medium">{match.homeTeam}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {awayLogo ? (
              <img src={awayLogo} alt="" className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-foreground font-bold">
                {match.awayTeam.charAt(0)}
              </div>
            )}
            <span className="text-muted-foreground">{match.awayTeam}</span>
          </div>
        </div>
      </div>

      {/* Watch Buttons */}
      {match.channels && match.channels.length > 0 && (
        <div className="px-4 pb-4">
          <p className="text-muted-foreground text-xs mb-2">Watch on:</p>
          <div className="flex flex-wrap gap-2">
            {match.channels.slice(0, 3).map((channel, idx) => (
              <button
                key={idx}
                onClick={() => onWatch(channel.url)}
                className="flex items-center gap-2 bg-secondary hover:bg-primary text-foreground hover:text-primary-foreground text-xs px-3 py-2 rounded-lg transition-colors"
              >
                {channel.image && (
                  <img src={channel.image} alt="" className="w-4 h-4 object-contain" />
                )}
                <span>{channel.name}</span>
                {channel.viewers > 0 && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {channel.viewers}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fallback Watch Button */}
      {(!match.channels || match.channels.length === 0) && (
        <div className="px-4 pb-4">
          <button
            onClick={() => onWatch(`${CDN_API}/events/football/${match.id}/player/`)}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            Watch Now
          </button>
        </div>
      )}
    </div>
  );
};

export default FeaturedFootball;
