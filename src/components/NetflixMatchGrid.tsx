import React from 'react';
import { Match } from '@/types/sports';
import NetflixMatchCard from './NetflixMatchCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface NetflixMatchGridProps {
  matches: Match[];
  sportId: string;
  title?: string;
}

const NetflixMatchGrid: React.FC<NetflixMatchGridProps> = ({ matches, sportId, title }) => {
  const isMobile = useIsMobile();

  if (matches.length === 0) return null;

  return (
    <div className="mb-8">
      {title && (
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 md:px-0">
          {title}
        </h2>
      )}
      
      {isMobile ? (
        // Horizontal scroll on mobile
        <ScrollArea className="w-full">
          <div className="flex gap-4 px-4 pb-4">
            {matches.map((match) => (
              <div key={match.id} className="w-[280px] flex-shrink-0">
                <NetflixMatchCard match={match} sportId={sportId} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : (
        // Grid on desktop
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 md:px-0">
          {matches.map((match) => (
            <NetflixMatchCard key={match.id} match={match} sportId={sportId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NetflixMatchGrid;
