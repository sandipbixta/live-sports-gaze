import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMatches } from '../api/sportsApi';
import { Match } from '../types/sports';
import { filterActiveMatches } from '../utils/matchUtils';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Users, Trophy } from 'lucide-react';
import { format } from 'date-fns';

interface LeagueGroup {
  name: string;
  matches: Match[];
  priority: number;
}

const TopFootballLeagues: React.FC = () => {
  const [leagues, setLeagues] = useState<LeagueGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Define top leagues with priority for ordering
  const topLeagues = [
    { name: 'Premier League', priority: 1, keywords: ['premier league', 'epl', 'manchester', 'liverpool', 'arsenal', 'chelsea'] },
    { name: 'Champions League', priority: 2, keywords: ['champions league', 'ucl', 'uefa champions'] },
    { name: 'La Liga', priority: 3, keywords: ['la liga', 'real madrid', 'barcelona', 'atletico madrid'] },
    { name: 'Serie A', priority: 4, keywords: ['serie a', 'juventus', 'milan', 'inter', 'napoli'] },
    { name: 'Bundesliga', priority: 5, keywords: ['bundesliga', 'bayern munich', 'dortmund', 'bayern'] },
    { name: 'Ligue 1', priority: 6, keywords: ['ligue 1', 'psg', 'paris saint', 'marseille'] },
    { name: 'Europa League', priority: 7, keywords: ['europa league', 'uefa europa'] },
    { name: 'World Cup', priority: 8, keywords: ['world cup', 'fifa world cup', 'qatar 2022'] },
    { name: 'Euro', priority: 9, keywords: ['euro 20', 'european championship', 'euros'] },
    { name: 'Copa America', priority: 10, keywords: ['copa america', 'conmebol'] }
  ];

  const classifyMatch = (match: Match): string | null => {
    const title = match.title.toLowerCase();
    
    for (const league of topLeagues) {
      if (league.keywords.some(keyword => title.includes(keyword.toLowerCase()))) {
        return league.name;
      }
    }
    
    return null;
  };

  const isMatchLive = (match: Match): boolean => {
    const now = Date.now();
    const matchTime = match.date;
    const matchEnd = (match as any).ppvData?.endsAt || matchTime + (3 * 60 * 60 * 1000); // Default 3 hours
    return matchTime <= now && now <= matchEnd;
  };

  useEffect(() => {
    const loadFootballLeagues = async () => {
      try {
        const footballMatches = await fetchMatches('football');
        const activeMatches = filterActiveMatches(footballMatches);
        
        // Group matches by league
        const leagueGroups: { [key: string]: Match[] } = {};
        
        activeMatches.forEach(match => {
          const leagueName = classifyMatch(match);
          if (leagueName) {
            if (!leagueGroups[leagueName]) {
              leagueGroups[leagueName] = [];
            }
            leagueGroups[leagueName].push(match);
          }
        });

        // Convert to array and sort by priority
        const leaguesList: LeagueGroup[] = Object.entries(leagueGroups)
          .map(([name, matches]) => ({
            name,
            matches: matches.slice(0, 3), // Limit to 3 matches per league
            priority: topLeagues.find(l => l.name === name)?.priority || 999
          }))
          .sort((a, b) => a.priority - b.priority)
          .slice(0, 6); // Show top 6 leagues

        setLeagues(leaguesList);
      } catch (error) {
        console.error('Error loading football leagues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFootballLeagues();
  }, []);

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Top Football Leagues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (leagues.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Top Football Leagues</h2>
        </div>
        <Link 
          to="/live?sport=football" 
          className="text-primary hover:text-primary/80 text-sm font-medium"
        >
          View All Football →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leagues.map((league) => (
          <Card key={league.name} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" />
                {league.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {league.matches.map((match, index) => (
                  <Link 
                    key={match.id}
                    to={`/match/${match.category}/${match.id}`}
                    className="block group"
                  >
                    <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {match.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(match.date), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {isMatchLive(match) && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                            LIVE
                          </Badge>
                        )}
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {match.sources.length}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {league.matches.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    No matches available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TopFootballLeagues;