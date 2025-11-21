import { useEffect, useState } from "react";
import { apiSportsService, LiveMatch } from "@/services/apiSportsService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export const ApiSportsWidget = () => {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const matches = await apiSportsService.getLiveMatches();
        setLiveMatches(matches.slice(0, 10)); // Show first 10 matches
      } catch (err) {
        console.error('Error fetching live matches:', err);
        setError('Failed to load live matches');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveMatches();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiveMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (liveMatches.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">No live matches at the moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          Live Football Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {liveMatches.map((match) => (
          <div 
            key={match.fixture.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src={match.league.logo} 
                  alt={match.league.name}
                  className="w-5 h-5"
                />
                <span className="text-xs text-muted-foreground">
                  {match.league.name}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <img 
                    src={match.teams.home.logo} 
                    alt={match.teams.home.name}
                    className="w-6 h-6"
                  />
                  <span className="font-medium">{match.teams.home.name}</span>
                  <span className="ml-auto text-lg font-bold">
                    {match.goals.home ?? '-'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <img 
                    src={match.teams.away.logo} 
                    alt={match.teams.away.name}
                    className="w-6 h-6"
                  />
                  <span className="font-medium">{match.teams.away.name}</span>
                  <span className="ml-auto text-lg font-bold">
                    {match.goals.away ?? '-'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="ml-4 text-right">
              <Badge variant="destructive" className="mb-2">
                LIVE
              </Badge>
              {match.fixture.status.elapsed && (
                <div className="text-sm text-muted-foreground">
                  {match.fixture.status.elapsed}'
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
