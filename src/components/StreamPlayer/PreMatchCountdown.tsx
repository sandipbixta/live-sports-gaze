import React, { useState, useEffect } from 'react';
import { Match } from '../../types/sports';
import { ManualMatch } from '../../types/manualMatch';
import { sportsDbService } from '../../services/sportsDbService';

interface PreMatchCountdownProps {
  match: Match | ManualMatch;
  onMatchStart?: () => void;
}

const PreMatchCountdown: React.FC<PreMatchCountdownProps> = ({ match, onMatchStart }) => {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  // Parse team names from title as fallback (format: "Team A vs Team B")
  const parseTeamsFromTitle = (title: string): { home: string; away: string } => {
    const vsMatch = title.match(/^(.+?)\s+(?:vs?\.?|versus)\s+(.+)$/i);
    if (vsMatch) {
      return { home: vsMatch[1].trim(), away: vsMatch[2].trim() };
    }
    return { home: '', away: '' };
  };

  // Handle both Match and ManualMatch types with fallback to title parsing
  const rawHome = (match as Match).teams?.home?.name || (match as ManualMatch).teams?.home || '';
  const rawAway = (match as Match).teams?.away?.name || (match as ManualMatch).teams?.away || '';
  
  // Use parsed title names if team names are generic placeholders
  const isGenericName = (name: string) => ['home', 'away', 'tba', 'tbd', ''].includes(name.toLowerCase().trim());
  const parsedTeams = parseTeamsFromTitle(match.title || '');
  
  const home = isGenericName(rawHome) && parsedTeams.home ? parsedTeams.home : rawHome;
  const away = isGenericName(rawAway) && parsedTeams.away ? parsedTeams.away : rawAway;
  
  const matchDate = typeof match.date === 'string' ? new Date(match.date).getTime() : (match.date || 0);
  const tournament = (match as Match).tournament || (match as ManualMatch).title || '';

  // Fetch poster from SportsDB
  useEffect(() => {
    const fetchPoster = async () => {
      if (home && away) {
        try {
          const event = await sportsDbService.searchEvent(home, away);
          const poster = sportsDbService.getEventPoster(event, 'medium');
          if (poster) {
            setPosterUrl(poster);
          }
        } catch (error) {
          console.error('Error fetching poster:', error);
        }
      }
    };
    fetchPoster();
  }, [home, away]);

  // Update countdown every second
  useEffect(() => {
    if (!matchDate || matchDate <= Date.now()) {
      onMatchStart?.();
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const timeLeft = matchDate - now;

      if (timeLeft <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        onMatchStart?.();
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setCountdown({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [matchDate, onMatchStart]);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  // Get background - use poster or match poster
  const backgroundImage = posterUrl || (match as Match).poster || '';

  return (
    <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] lg:min-h-[500px] overflow-hidden rounded-lg">
      {/* Background Image */}
      {backgroundImage ? (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-yellow-700">
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start justify-end h-full p-6 md:p-8">
        {/* Tournament/League Logo area - Center */}
        {tournament && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-bold drop-shadow-lg">
              {tournament}
            </h2>
          </div>
        )}

        {/* Watch Live In label */}
        <p className="text-white/80 text-sm md:text-base mb-2">Watch Live In</p>

        {/* Countdown Timer */}
        <div className="flex items-center gap-1 md:gap-2 mb-4">
          <div className="bg-white text-black font-bold text-2xl md:text-4xl lg:text-5xl px-3 md:px-4 py-1 md:py-2 rounded">
            {formatNumber(countdown.hours)}
          </div>
          <span className="text-white font-bold text-2xl md:text-4xl lg:text-5xl">:</span>
          <div className="bg-white text-black font-bold text-2xl md:text-4xl lg:text-5xl px-3 md:px-4 py-1 md:py-2 rounded">
            {formatNumber(countdown.minutes)}
          </div>
          <span className="text-white font-bold text-2xl md:text-4xl lg:text-5xl">:</span>
          <div className="bg-white text-black font-bold text-2xl md:text-4xl lg:text-5xl px-3 md:px-4 py-1 md:py-2 rounded">
            {formatNumber(countdown.seconds)}
          </div>
        </div>

        {/* Team Names */}
        <div className="text-white">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">
            {home}
          </h3>
          <p className="text-lg md:text-xl lg:text-2xl font-medium text-white/90">
            <span className="text-sports-primary font-bold">Vs</span> {away}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PreMatchCountdown;
