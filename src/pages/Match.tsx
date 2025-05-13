
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

const Match = () => {
  const { toast } = useToast();
  const { sportId, matchId } = useParams();
  const [match, setMatch] = useState<MatchType | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStream, setLoadingStream] = useState(false);
  const [activeTab, setActiveTab] = useState('stream');
  
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
      <div className="min-h-screen bg-[#1A1F2C] text-gray-100">
        <div className="animate-pulse">
          <div className="h-96 bg-[#242836]"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-[#242836] w-1/3 rounded mb-4"></div>
            <div className="h-64 bg-[#242836] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#1A1F2C] text-gray-100">
        <div className="container mx-auto px-4 py-16">
          <Card className="bg-[#242836] border-[#343a4d]">
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

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-gray-100">
      {/* Header with navigation */}
      <header className="bg-[#151922] shadow-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center">
            <Link to="/" className="text-gray-300 hover:text-white mr-4">
              <Button variant="ghost" size="sm">
                <ChevronRight className="rotate-180 mr-1" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold">{match.title}</h1>
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
                    <span className="text-3xl font-bold">{home.charAt(0)}</span>
                  </div>
                )}
                <h2 className="text-xl font-bold">{home}</h2>
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
                    <span className="text-3xl font-bold">{away.charAt(0)}</span>
                  </div>
                )}
                <h2 className="text-xl font-bold">{away}</h2>
              </div>
            </div>
            
            {stream && (
              <div className="flex justify-center mt-8">
                <Badge className="bg-[#1EAEDB] px-3 py-1 text-base">LIVE NOW</Badge>
              </div>
            )}
          </div>
        </div>
        
        {/* Tabs navigation */}
        <div className="bg-[#242836] sticky top-0 z-10 border-b border-[#343a4d]">
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
                onClick={() => setActiveTab('stats')}
                className={`py-4 px-6 rounded-none ${activeTab === 'stats' ? 'border-b-2 border-[#9b87f5] text-white' : 'text-gray-400'}`}
              >
                Stats
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setActiveTab('lineups')}
                className={`py-4 px-6 rounded-none ${activeTab === 'lineups' ? 'border-b-2 border-[#9b87f5] text-white' : 'text-gray-400'}`}
              >
                Lineups
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
              
              {!stream && !loadingStream && (
                <Card className="bg-[#242836] border-[#343a4d] mt-6">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-400">Stream will be available closer to match time.</p>
                  </CardContent>
                </Card>
              )}
              
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">More {match.title} Content</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-[#242836] border-[#343a4d] hover:border-[#9b87f5]/30 transition-all">
                    <CardContent className="p-4">
                      <h4 className="font-bold">Pre-match Analysis</h4>
                      <p className="text-sm text-gray-400 mt-1">Expert insights and predictions</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#242836] border-[#343a4d] hover:border-[#9b87f5]/30 transition-all">
                    <CardContent className="p-4">
                      <h4 className="font-bold">Team News</h4>
                      <p className="text-sm text-gray-400 mt-1">Latest updates from both camps</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#242836] border-[#343a4d] hover:border-[#9b87f5]/30 transition-all">
                    <CardContent className="p-4">
                      <h4 className="font-bold">Head-to-Head</h4>
                      <p className="text-sm text-gray-400 mt-1">Previous encounters and stats</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#242836] border-[#343a4d] hover:border-[#9b87f5]/30 transition-all">
                    <CardContent className="p-4">
                      <h4 className="font-bold">Venue Info</h4>
                      <p className="text-sm text-gray-400 mt-1">Stadium details and conditions</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'stats' && (
            <Card className="bg-[#242836] border-[#343a4d]">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 text-center">Match Statistics</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>61%</span>
                      <span className="font-medium">Possession</span>
                      <span>39%</span>
                    </div>
                    <div className="flex h-2 overflow-hidden bg-[#343a4d] rounded">
                      <div className="bg-[#9b87f5]" style={{ width: '61%' }}></div>
                      <div className="bg-[#1EAEDB]" style={{ width: '39%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>8</span>
                      <span className="font-medium">Shots on Target</span>
                      <span>5</span>
                    </div>
                    <div className="flex h-2 overflow-hidden bg-[#343a4d] rounded">
                      <div className="bg-[#9b87f5]" style={{ width: '62%' }}></div>
                      <div className="bg-[#1EAEDB]" style={{ width: '38%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>4</span>
                      <span className="font-medium">Corners</span>
                      <span>7</span>
                    </div>
                    <div className="flex h-2 overflow-hidden bg-[#343a4d] rounded">
                      <div className="bg-[#9b87f5]" style={{ width: '36%' }}></div>
                      <div className="bg-[#1EAEDB]" style={{ width: '64%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>2</span>
                      <span className="font-medium">Yellow Cards</span>
                      <span>3</span>
                    </div>
                    <div className="flex h-2 overflow-hidden bg-[#343a4d] rounded">
                      <div className="bg-[#9b87f5]" style={{ width: '40%' }}></div>
                      <div className="bg-[#1EAEDB]" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <p className="text-center text-sm text-gray-400 mt-8">
                    Statistics are updated in real-time during the match
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'lineups' && (
            <Card className="bg-[#242836] border-[#343a4d]">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 text-center">Team Lineups</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold mb-4 flex items-center">
                      {homeBadge && (
                        <img src={homeBadge} alt={home} className="w-6 h-6 mr-2" onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} />
                      )}
                      {home} - Starting XI
                    </h4>
                    <div className="bg-[#1A1F2C] rounded-lg p-4 space-y-2">
                      <p className="text-gray-400">Lineup data will appear before match start</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-bold mb-4 flex items-center">
                      {awayBadge && (
                        <img src={awayBadge} alt={away} className="w-6 h-6 mr-2" onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }} />
                      )}
                      {away} - Starting XI
                    </h4>
                    <div className="bg-[#1A1F2C] rounded-lg p-4 space-y-2">
                      <p className="text-gray-400">Lineup data will appear before match start</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {activeTab === 'highlights' && (
            <Card className="bg-[#242836] border-[#343a4d]">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-6 text-center">Match Highlights</h3>
                <div className="text-center py-8">
                  <Film className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Highlights will be available after the match</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <footer className="bg-[#151922] text-gray-400 py-6 mt-10">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 SPORTSTREAM - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default Match;
