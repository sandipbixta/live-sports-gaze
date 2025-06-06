
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { Match } from '@/types/sports';
import { isTrendingMatch } from '@/utils/popularLeagues';
import { TrendingUp, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TrendingGamesSidebarProps {
  matches: Match[];
  sportId: string;
}

const TrendingGamesSidebar: React.FC<TrendingGamesSidebarProps> = ({ matches, sportId }) => {
  // Helper function to remove duplicates more strictly
  const removeDuplicates = (matches: Match[]): Match[] => {
    const seen = new Set<string>();
    const uniqueMatches: Match[] = [];
    
    matches.forEach(match => {
      // Create a unique key based on teams and date
      const homeTeam = match.teams?.home?.name || '';
      const awayTeam = match.teams?.away?.name || '';
      const matchDate = new Date(match.date).toISOString().split('T')[0];
      
      // Use teams and date for uniqueness, fallback to title if no teams
      const uniqueKey = homeTeam && awayTeam 
        ? `${homeTeam}-vs-${awayTeam}-${matchDate}`.toLowerCase()
        : `${match.title}-${matchDate}`.toLowerCase();
      
      if (!seen.has(uniqueKey)) {
        seen.add(uniqueKey);
        uniqueMatches.push(match);
      }
    });
    
    return uniqueMatches;
  };

  // Filter and sort matches by trending score
  const trendingMatches = removeDuplicates(
    matches.filter(match => 
      !match.title.toLowerCase().includes('sky sports news') && 
      !match.id.includes('sky-sports-news') &&
      !match.title.toLowerCase().includes('advertisement') &&
      !match.title.toLowerCase().includes('ad break')
    )
  ).map(match => ({
    ...match,
    trendingData: isTrendingMatch(match.title)
  }))
  .filter(match => match.trendingData.score >= 5)
  .sort((a, b) => b.trendingData.score - a.trendingData.score)
  .slice(0, 8);

  // Helper function to determine if a match is live
  const isMatchLive = (match: Match): boolean => {
    const matchTime = new Date(match.date).getTime();
    const now = new Date().getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    
    return (
      match.sources && 
      match.sources.length > 0 && 
      Math.abs(matchTime - now) < twoHoursInMs
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (trendingMatches.length === 0) {
    return (
      <Sidebar side="right" className="w-80 border-l border-[#343a4d]">
        <SidebarContent className="bg-[#1a1f2e]">
          <SidebarGroup>
            <SidebarGroupLabel className="text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending Games
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="p-4 text-center text-gray-400 text-sm">
                No trending games available
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar side="right" className="w-80 border-l border-[#343a4d]">
      <SidebarContent className="bg-[#1a1f2e]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending Games
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {trendingMatches.map((match, index) => {
                const isLive = isMatchLive(match);
                return (
                  <SidebarMenuItem key={`sidebar-${match.id}-${index}`}>
                    <Link 
                      to={`/match/${sportId}/${match.id}`}
                      className="block p-3 hover:bg-[#242836] rounded-lg transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white text-sm font-medium line-clamp-2 flex-1">
                          {match.title}
                        </h4>
                        {isLive ? (
                          <Badge variant="live" className="ml-2 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            LIVE
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(match.date)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {match.trendingData.score >= 8 ? 
                            '🔥 Highly Trending' : 
                            match.trendingData.score >= 5 ? 
                            '📈 Trending' : 'Popular'}
                        </span>
                        <span className="text-xs text-[#ff5a36] font-medium">
                          Score: {match.trendingData.score}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default TrendingGamesSidebar;
