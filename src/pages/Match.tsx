import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { Match as MatchType, Stream } from '../types/sports';
import { fetchMatch, fetchStream } from '../api/sportsApi';
import StreamPlayer from '../components/StreamPlayer';
import { Button } from '../components/ui/button';
import { ArrowRight, ChevronRight, Clock, Calendar, Film, Video } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import PopularGames from '../components/PopularGames';

const Match = () => {
  const { toast } = useToast();
  const { sportId, matchId } = useParams();
  const [match, setMatch] = useState<MatchType | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStream, setLoadingStream] = useState(false);
  const [activeTab, setActiveTab] = useState('stream');
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [popularMatches, setPopularMatches] = useState<MatchType[]>([]);
  
  useEffect(() => {
    const loadMatch = async () => {
      if (!sportId || !matchId) return;
      
      setIsLoading(true);
      try {
        const matchData = await fetchMatch(sportId, matchId);
        setMatch(matchData);
        
        // Auto-load stream if available
        if (matchData?.sources?.length > 0) {
          const { source, id } = matchData.sources[0];
          setActiveSource(`${source}/${id}`);
          
          try {
            setLoadingStream(true);
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
        
        // Load popular matches (limited to 3)
        if (matchData?.related?.length > 0) {
          setPopularMatches(matchData.related.slice(0, 3));
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

  const handleSourceChange = async (source: string, id: string) => {
    setActiveSource(`${source}/${id}`);
    setLoadingStream(true);
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
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sports-dark text-sports-light">
        <div className="animate-pulse">
          <div className="h-96 bg-sports-card"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-sports-card w-1/3 rounded mb-4"></div>
            <div className="h-64 bg-sports-card rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-sports-dark text-sports-light">
        <div className="container mx-auto px-4 py-16">
          <Card className="bg-sports-card border-sports">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-gray-300">Match Not Found</h2>
              <p className="mt-2 text-gray-400">The match you're looking for doesn't exist or has ended.</p>
              <Button className="mt-6 bg-[#9b87f5] hover:bg-[#8a75e8]" asChild>
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
    
  // Function to generate stream ID from match ID if needed
  const getStreamId = () => {
    return match?.sources?.length > 0 ? match.sources[0].id : matchId;
  };
  
  const streamId = getStreamId();

  return (
    <div className="min-h-screen bg-sports-dark text-sports-light">
      {/* Header with navigation */}
      <header className="bg-sports-darker shadow-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center">
            <Link to="/" className="text-gray-300 hover:text-white mr-4">
              <Button variant="ghost" size="sm">
                <ChevronRight className="rotate-180 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-white">{match.title}</h1>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main>
        {/* Match banner */}
        <div className="bg-gradient-to-r from-[#151922] to-[#242836] py-10 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-20">
              <div className="flex flex-col items-center text-center">
                {homeBadge ? (
                  <img 
                    src={homeBadge} 
                    alt={home} 
                    className="w-24 h-24 mb-3 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-[#343a4d] rounded-full flex items-center justify-center mb-3">
                    <span className="text-3xl font-bold text-white">{home.charAt(0)}</span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-white">{home}</h2>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-white mb-3">VS</div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(match.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center text-center">
                {awayBadge ? (
                  <img 
                    src={awayBadge} 
                    alt={away} 
                    className="w-24 h-24 mb-3 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 bg-[#343a4d] rounded-full flex items-center justify-center mb-3">
                    <span className="text-3xl font-bold text-white">{away.charAt(0)}</span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-white">{away}</h2>
              </div>
            </div>
            
            {stream && (
              <div className="flex justify-center mt-8">
                <Badge variant="live" className="px-3 py-1 text-base">LIVE NOW</Badge>
              </div>
            )}
          </div>
        </div>
        
        {/* Tabs navigation */}
        <div className="bg-sports-card sticky top-0 z-10 border-b border-sports">
          <div className="container mx-auto">
            <div className="flex overflow-x-auto scrollbar-none">
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('stream')}
                className={`py-4 px-6 rounded-none ${activeTab === 'stream' ? 'border-b-2 border-[#9b87f5] text-white' : 'text-gray-400'}`}
              >
                <Video className="h-4 w-4 mr-2" /> Stream
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('highlights')}
                className={`py-4 px-6 rounded-none ${activeTab === 'highlights' ? 'border-b-2 border-[#9b87f5] text-white' : 'text-gray-400'}`}
              >
                <Film className="h-4 w-4 mr-2" /> Highlights
              </Button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          {activeTab === 'stream' && (
            <div>
              <StreamPlayer
                stream={stream}
                isLoading={loadingStream}
              />
              
              {/* Stream Sources */}
              <div className="mt-6">
                <h3 className="text-xl font-bold mb-4 text-white">Stream Sources</h3>
                <div className="flex flex-wrap gap-3">
                  {match.sources.map(({ source, id }) => (
                    <Badge
                      key={`${source}-${id}`}
                      variant="source"
                      className={`cursor-pointer text-sm py-2 px-4 ${
                        activeSource === `${source}/${id}` 
                          ? 'bg-[#343a4d] border-[#9b87f5]' 
                          : ''
                      }`}
                      onClick={() => handleSourceChange(source, id)}
                    >
                      {source.charAt(0).toUpperCase() + source.slice(1)}
                    </Badge>
                  ))}
                </div>
                
                {/* Additional Stream Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-4">
                  <Badge 
                    variant="source" 
                    className="cursor-pointer text-sm py-2 px-4"
                    onClick={() => handleSourceChange("alpha", streamId)}
                  >
                    Alpha
                  </Badge>
                  <Badge 
                    variant="source" 
                    className="cursor-pointer text-sm py-2 px-4"
                    onClick={() => handleSourceChange("bravo", streamId)}
                  >
                    Bravo
                  </Badge>
                  <Badge 
                    variant="source" 
                    className="cursor-pointer text-sm py-2 px-4"
                    onClick={() => handleSourceChange("charlie", streamId)}
                  >
                    Charlie
                  </Badge>
                  <Badge 
                    variant="source" 
                    className="cursor-pointer text-sm py-2 px-4"
                    onClick={() => handleSourceChange("delta", streamId)}
                  >
                    Delta
                  </Badge>
                  <Badge 
                    variant="source" 
                    className="cursor-pointer text-sm py-2 px-4"
                    onClick={() => handleSourceChange("echo", streamId)}
                  >
                    Echo
                  </Badge>
                  <Badge 
                    variant="source" 
                    className="cursor-pointer text-sm py-2 px-4"
                    onClick={() => handleSourceChange("foxtrot", streamId)}
                  >
                    Foxtrot
                  </Badge>
                </div>
              </div>
              
              {!stream && !loadingStream && (
                <Card className="bg-sports-card border-sports mt-6">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-400">Stream will be available closer to match time.</p>
                  </CardContent>
                </Card>
              )}
              
              {/* Popular Games Section - Replacing fake content sections */}
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 text-white">More {match.title.split('-')[0].trim()} Matches</h3>
                {popularMatches.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <PopularGames 
                      popularMatches={popularMatches} 
                      selectedSport={sportId || ''} 
                    />
                  </div>
                ) : (
                  <Card className="bg-sports-card border-sports">
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-400">No related matches available at this time.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'highlights' && (
            <Card className="bg-sports-card border-sports">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 text-center text-white">Match Highlights</h3>
                <div className="text-center py-8">
                  <Film className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Highlights will be available after the match</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <footer className="bg-sports-darker text-gray-400 py-6 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 SPORTSTREAM - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Match;
