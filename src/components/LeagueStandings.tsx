import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface LeagueStandingsProps {
  leagueId: number;
  leagueName: string;
}

// Map of league names to FootyStats league IDs
export const LEAGUE_IDS: Record<string, number> = {
  'premier league': 93,
  'english premier league': 93,
  'epl': 93,
  // Add more leagues as needed
  // 'la liga': 87,
  // 'serie a': 94,
  // 'bundesliga': 82,
  // 'ligue 1': 91,
};

const LeagueStandings: React.FC<LeagueStandingsProps> = ({ leagueId, leagueName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Only load the script once
    if (scriptLoadedRef.current) return;

    const loadStandingsScript = () => {
      // Create the container div
      const standingsDiv = document.createElement('div');
      standingsDiv.id = 'fs-standings';
      
      if (containerRef.current) {
        containerRef.current.appendChild(standingsDiv);
      }

      // Load the FootyStats embed script
      const script = document.createElement('script');
      script.innerHTML = `
        (function (w,d,s,o,f,js,fjs) {
          w['fsStandingsEmbed']=o;w[o] = w[o] || function () {
            (w[o].q = w[o].q || []).push(arguments)
          };
          js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
          js.id = o; js.src = f; js.async = 1; fjs.parentNode.insertBefore(js, fjs);
        }(window, document, 'script', 'mw', 'https://cdn.footystats.org/embeds/standings.js'));
        mw('params', { leagueID: ${leagueId} });
      `;
      
      if (containerRef.current) {
        containerRef.current.appendChild(script);
        scriptLoadedRef.current = true;
      }
    };

    loadStandingsScript();

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      scriptLoadedRef.current = false;
    };
  }, [leagueId]);

  return (
    <Card className="bg-sports-darker border-sports-border p-4 mt-6">
      <h2 className="text-xl font-bold text-white mb-4">{leagueName} Standings</h2>
      <div ref={containerRef} className="standings-container" />
    </Card>
  );
};

export default LeagueStandings;
