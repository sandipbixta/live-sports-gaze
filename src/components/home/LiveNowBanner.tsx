import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { CombinedMatch, getLiveMatches, fetchTeamLogo, getSportIcon } from '@/services/combinedSportsService';

const LiveNowBanner = () => {
  const [liveMatches, setLiveMatches] = useState<CombinedMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [homeLogo, setHomeLogo] = useState<string | null>(null);
  const [awayLogo, setAwayLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const matches = await getLiveMatches();
        setLiveMatches(matches.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch live matches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentMatch = liveMatches[currentIndex];

  // Fetch logos for current match
  useEffect(() => {
    if (currentMatch) {
      setHomeLogo(currentMatch.homeBadge);
      setAwayLogo(currentMatch.awayBadge);
      
      if (!currentMatch.homeBadge && currentMatch.homeTeam) {
        fetchTeamLogo(currentMatch.homeTeam).then(setHomeLogo);
      }
      if (!currentMatch.awayBadge && currentMatch.awayTeam) {
        fetchTeamLogo(currentMatch.awayTeam).then(setAwayLogo);
      }
    }
  }, [currentMatch]);

  // Auto-rotate
  useEffect(() => {
    if (liveMatches.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(i => (i + 1) % liveMatches.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [liveMatches.length]);

  if (loading) {
    return (
      <div className="relative bg-gradient-to-r from-destructive/20 via-primary/20 to-orange-500/20 rounded-2xl overflow-hidden mb-8 animate-pulse">
        <div className="p-8 md:p-12 h-48" />
      </div>
    );
  }

  if (liveMatches.length === 0) return null;

  const sportIcon = currentMatch ? getSportIcon(currentMatch.sport) : '🏆';

  return (
    <div className="relative bg-gradient-to-r from-destructive/30 via-primary/20 to-orange-500/30 rounded-2xl overflow-hidden mb-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--foreground)) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      <div className="relative p-6 md:p-10">
        {/* Live Badge */}
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center gap-2 bg-destructive text-destructive-foreground text-sm font-bold px-4 py-1.5 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-destructive-foreground rounded-full" />
            LIVE NOW
          </span>
          <span className="text-muted-foreground text-sm">{liveMatches.length} matches live</span>
        </div>

        {currentMatch && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Match Info */}
            <div className="flex items-center gap-6 md:gap-10">
              {/* Home Team */}
              <div className="text-center">
                {homeLogo ? (
                  <img 
                    src={homeLogo} 
                    alt={currentMatch.homeTeam} 
                    className="w-16 h-16 md:w-20 md:h-20 object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary rounded-full flex items-center justify-center text-3xl mx-auto">
                    {sportIcon}
                  </div>
                )}
                <p className="text-foreground font-semibold mt-2 text-sm md:text-base max-w-[100px] truncate">
                  {currentMatch.homeTeam || 'Home'}
                </p>
                {currentMatch.score && (
                  <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                    {currentMatch.score.home}
                  </p>
                )}
              </div>

              <div className="text-muted-foreground text-xl md:text-2xl font-light">VS</div>

              {/* Away Team */}
              <div className="text-center">
                {awayLogo ? (
                  <img 
                    src={awayLogo} 
                    alt={currentMatch.awayTeam} 
                    className="w-16 h-16 md:w-20 md:h-20 object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary rounded-full flex items-center justify-center text-3xl mx-auto">
                    {sportIcon}
                  </div>
                )}
                <p className="text-foreground font-semibold mt-2 text-sm md:text-base max-w-[100px] truncate">
                  {currentMatch.awayTeam || 'Away'}
                </p>
                {currentMatch.score && (
                  <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
                    {currentMatch.score.away}
                  </p>
                )}
              </div>
            </div>

            {/* Watch Button */}
            <Link
              to={`/match/${currentMatch.sport}/${currentMatch.id}`}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 text-primary-foreground font-bold px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary/30 hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Live
            </Link>
          </div>
        )}

        {/* Competition */}
        {currentMatch && (
          <p className="text-muted-foreground text-sm mt-4">
            {currentMatch.competition || currentMatch.sport}
          </p>
        )}

        {/* Navigation Dots */}
        {liveMatches.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {liveMatches.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-primary w-6' : 'bg-muted-foreground/30 w-2'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {liveMatches.length > 1 && (
        <>
          <button
            onClick={() => setCurrentIndex(i => (i - 1 + liveMatches.length) % liveMatches.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 text-foreground p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentIndex(i => (i + 1) % liveMatches.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 text-foreground p-2 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default LiveNowBanner;
