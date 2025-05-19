
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Clock } from 'lucide-react';
import { Match } from '../../types/sports';
import LiveMatchesList from './LiveMatchesList';
import { Sport } from '../../types/sports';
import NoMatchesState from './NoMatchesState';
import { useIsMobile } from '../../hooks/use-mobile';
import MatchCard from '../MatchCard';

interface TabsFilterProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredMatches: Match[];
  liveMatches: Match[];
  upcomingMatches: Match[];
  activeSportFilter: string;
  sports: Sport[];
  searchQuery: string;
  onMatchSelect: (match: Match) => void;
  onSearchClear: () => void;
  onRefresh: () => void;
}

const TabsFilter: React.FC<TabsFilterProps> = ({
  activeTab,
  setActiveTab,
  filteredMatches,
  liveMatches,
  upcomingMatches,
  activeSportFilter,
  sports,
  searchQuery,
  onMatchSelect,
  onSearchClear,
  onRefresh
}) => {
  const isMobile = useIsMobile();

  return (
    <Tabs 
      defaultValue="all" 
      value={activeTab} 
      onValueChange={setActiveTab} 
      className="mb-8"
    >
      <div className="flex justify-between items-center mb-4">
        <TabsList className="bg-[#242836] border border-[#343a4d]">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-[#343a4d] data-[state=active]:text-white text-white"
          >
            All Matches
          </TabsTrigger>
          <TabsTrigger 
            value="live" 
            className="data-[state=active]:bg-[#343a4d] data-[state=active]:text-white text-white"
          >
            <span className="inline-block h-2 w-2 bg-[#fa2d04] rounded-full animate-pulse mr-1"></span>
            Live Now ({liveMatches.length})
          </TabsTrigger>
          <TabsTrigger 
            value="upcoming" 
            className="data-[state=active]:bg-[#343a4d] data-[state=active]:text-white text-white"
          >
            <Clock size={14} className="mr-1" />
            Upcoming ({upcomingMatches.length})
          </TabsTrigger>
        </TabsList>
        
        {searchQuery && (
          <div className="text-sm text-gray-300" aria-live="polite">
            {filteredMatches.length === 0 ? 'No matches found' : `Found ${filteredMatches.length} matches`}
          </div>
        )}
      </div>
      
      <TabsContent value="all" className="mt-0">
        {/* Live Matches Section */}
        {liveMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
              <span className="inline-block h-3 w-3 bg-[#fa2d04] rounded-full animate-pulse"></span>
              Live Matches
            </h2>
            {activeSportFilter === "all" ? 
              <LiveMatchesList 
                matches={liveMatches.filter(match => filteredMatches.some(fm => fm.id === match.id))} 
                sports={sports}
                onMatchSelect={onMatchSelect}
              /> :
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 live-matches-grid`}>
                {liveMatches
                  .filter(match => filteredMatches.some(fm => fm.id === match.id))
                  .map((match) => (
                    <div 
                      key={`live-${match.id}`} 
                      className="cursor-pointer"
                      onClick={() => onMatchSelect(match)}
                    >
                      <MatchCard 
                        match={match}
                        sportId={match.sportId || "1"}
                        onClick={() => onMatchSelect(match)}
                        preventNavigation={true}
                      />
                    </div>
                  ))
                }
              </div>
            }
          </div>
        )}
        
        {/* Upcoming Matches Section */}
        {upcomingMatches.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2">
              <Clock size={18} className="text-[#1EAEDB]" />
              Upcoming Matches
            </h2>
            {activeSportFilter === "all" ? 
              <LiveMatchesList 
                matches={upcomingMatches
                  .filter(match => filteredMatches.some(fm => fm.id === match.id))
                  .slice(0, 24)} 
                sports={sports}
                onMatchSelect={onMatchSelect}
              /> :
              <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 upcoming-matches-grid`}>
                {upcomingMatches
                  .filter(match => filteredMatches.some(fm => fm.id === match.id))
                  .slice(0, 12) // Limit to avoid too many cards
                  .map((match) => (
                    <div 
                      key={`upcoming-${match.id}`} 
                      className="cursor-pointer"
                      onClick={() => onMatchSelect(match)}
                    >
                      <MatchCard 
                        match={match}
                        sportId={match.sportId || "1"}
                        onClick={() => onMatchSelect(match)}
                        preventNavigation={true}
                      />
                    </div>
                  ))
                }
              </div>
            }
          </div>
        )}
        
        {/* No matches message */}
        {filteredMatches.length === 0 && (
          <NoMatchesState 
            searchQuery={searchQuery}
            onSearchClear={onSearchClear}
            onRefresh={onRefresh}
          />
        )}
      </TabsContent>
      
      <TabsContent value="live" className="mt-0">
        {filteredMatches.length > 0 ? (
          activeSportFilter === "all" ? 
            <LiveMatchesList 
              matches={filteredMatches} 
              sports={sports}
              onMatchSelect={onMatchSelect}
            /> :
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 live-matches-grid`}>
              {filteredMatches.map((match) => (
                <div 
                  key={`live-tab-${match.id}`} 
                  className="cursor-pointer"
                  onClick={() => onMatchSelect(match)}
                >
                  <MatchCard 
                    match={match}
                    sportId={match.sportId || "1"}
                    onClick={() => onMatchSelect(match)}
                    preventNavigation={true}
                  />
                </div>
              ))}
            </div>
        ) : (
          <NoMatchesState 
            searchQuery={searchQuery}
            onSearchClear={onSearchClear}
            onRefresh={onRefresh}
            icon="tv"
            message="No live matches currently available."
          />
        )}
      </TabsContent>
      
      <TabsContent value="upcoming" className="mt-0">
        {filteredMatches.length > 0 ? (
          activeSportFilter === "all" ? 
            <LiveMatchesList 
              matches={filteredMatches} 
              sports={sports}
              onMatchSelect={onMatchSelect}
            /> :
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'} gap-3 md:gap-4 upcoming-matches-grid`}>
              {filteredMatches.map((match) => (
                <div 
                  key={`upcoming-tab-${match.id}`} 
                  className="cursor-pointer"
                  onClick={() => onMatchSelect(match)}
                >
                  <MatchCard 
                    match={match}
                    sportId={match.sportId || "1"}
                    onClick={() => onMatchSelect(match)}
                    preventNavigation={true}
                  />
                </div>
              ))}
            </div>
        ) : (
          <NoMatchesState 
            searchQuery={searchQuery}
            onSearchClear={onSearchClear}
            onRefresh={onRefresh}
            icon="calendar"
            message="No upcoming matches scheduled."
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default TabsFilter;
