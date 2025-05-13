
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Match as MatchType, Stream } from '../types/sports';
import { fetchMatch, fetchStream } from '../api/sportsApi';
import StreamPlayer from '../components/StreamPlayer';
import { Button } from '../components/ui/button';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';

const Match = () => {
  const { toast } = useToast();
  const { sportId, matchId } = useParams();
  const [match, setMatch] = useState<MatchType | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStream, setLoadingStream] = useState(false);
  
  useEffect(() => {
    const loadMatch = async () => {
      if (!sportId || !matchId) return;
      
      setIsLoading(true);
      try {
        const matchData = await fetchMatch(sportId, matchId);
        setMatch(matchData);
        
        // Auto-load stream if available
        if (matchData?.sources?.length > 0) {
          setLoadingStream(true);
          const { source, id } = matchData.sources[0];
          
          try {
            const streamData = await fetchStream(source, id);
            setStream(streamData);
          } catch (error) {
            toast({
              title: "Error",
              description: "Failed to load stream data.",
              variant: "destructive",
            });
          } finally {
            setLoadingStream(false);
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load match data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMatch();
  }, [sportId, matchId, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="container py-10">
          <div className="flex items-center mb-6">
            <Link to="/" className="text-gray-300 hover:text-white mr-2">
              <Button variant="ghost">
                <ChevronRight className="rotate-180 mr-1" />
                Back to Sports
              </Button>
            </Link>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 w-1/2 rounded"></div>
            <div className="h-72 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="container py-10">
          <div className="flex items-center mb-6">
            <Link to="/" className="text-gray-300 hover:text-white mr-2">
              <Button variant="ghost">
                <ChevronRight className="rotate-180 mr-1" />
                Back to Sports
              </Button>
            </Link>
          </div>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-gray-300">Match Not Found</h2>
              <p className="mt-2 text-gray-400">The match you're looking for doesn't exist or has ended.</p>
              <Button className="mt-6" asChild>
                <Link to="/">Return to Homepage</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const home = match.teams?.home?.name || 'Home Team';
  const away = match.teams?.away?.name || 'Away Team';
  const homeBadge = match.teams?.home?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.home.badge}.webp` 
    : '';
  const awayBadge = match.teams?.away?.badge 
    ? `https://streamed.su/api/images/badge/${match.teams.away.badge}.webp` 
    : '';

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Link to="/" className="text-gray-300 hover:text-white mr-2">
            <Button variant="ghost">
              <ChevronRight className="rotate-180 mr-1" />
              Back to Sports
            </Button>
          </Link>
          <span className="text-gray-500 mx-2">/</span>
          <h1 className="text-xl font-bold">{match.title}</h1>
        </div>

        {/* Match details */}
        <div className="mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-6 py-4">
                <div className="flex flex-col items-center">
                  {homeBadge && (
                    <img 
                      src={homeBadge} 
                      alt={home} 
                      className="w-16 h-16 mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span className="font-bold text-lg">{home}</span>
                </div>
                
                <div className="text-2xl font-bold text-gray-300">vs</div>
                
                <div className="flex flex-col items-center">
                  {awayBadge && (
                    <img 
                      src={awayBadge} 
                      alt={away} 
                      className="w-16 h-16 mb-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <span className="font-bold text-lg">{away}</span>
                </div>
              </div>
              <div className="text-center text-gray-400 mt-2">
                {new Date(match.date).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stream player */}
        <div className="mb-6">
          <StreamPlayer
            stream={stream}
            isLoading={loadingStream}
          />
        </div>

        {/* Additional content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold mb-2">Match Stats</h3>
              <Separator className="my-2 bg-gray-700" />
              <p className="text-gray-400 text-sm">Statistics will appear here during the match.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold mb-2">Commentary</h3>
              <Separator className="my-2 bg-gray-700" />
              <p className="text-gray-400 text-sm">Live commentary will appear here during the match.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold mb-2">Related Matches</h3>
              <Separator className="my-2 bg-gray-700" />
              <ul className="space-y-2">
                <li className="text-sports-primary hover:underline cursor-pointer flex items-center">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  <span>More matches from this league</span>
                </li>
                <li className="text-sports-primary hover:underline cursor-pointer flex items-center">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  <span>Upcoming fixtures</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Match;
