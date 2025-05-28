
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchMatches } from '@/api/sportsApi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SportsProps {
  onClose: () => void;
}

const Sports = ({ onClose }: SportsProps) => {
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const navigate = useNavigate();

  // Fetch matches for different sports
  const { data: footballMatches = [] } = useQuery({
    queryKey: ['matches', 'football'],
    queryFn: () => fetchMatches('football'),
  });

  const { data: basketballMatches = [] } = useQuery({
    queryKey: ['matches', 'basketball'],
    queryFn: () => fetchMatches('basketball'),
  });

  const { data: fightMatches = [] } = useQuery({
    queryKey: ['matches', 'fight'],
    queryFn: () => fetchMatches('fight'),
  });

  const { data: hockeyMatches = [] } = useQuery({
    queryKey: ['matches', 'hockey'],
    queryFn: () => fetchMatches('hockey'),
  });

  const { data: tennisMatches = [] } = useQuery({
    queryKey: ['matches', 'tennis'],
    queryFn: () => fetchMatches('tennis'),
  });

  const { data: baseballMatches = [] } = useQuery({
    queryKey: ['matches', 'baseball'],
    queryFn: () => fetchMatches('baseball'),
  });

  const { data: rugbyMatches = [] } = useQuery({
    queryKey: ['matches', 'rugby'],
    queryFn: () => fetchMatches('rugby'),
  });

  const { data: motorSportsMatches = [] } = useQuery({
    queryKey: ['matches', 'motor-sports'],
    queryFn: () => fetchMatches('motor-sports'),
  });

  // Combine all matches with their sport IDs
  const combinedMatches = [
    ...footballMatches.map(match => ({ ...match, sportId: 'football' })),
    ...basketballMatches.map(match => ({ ...match, sportId: 'basketball' })),
    ...fightMatches.map(match => ({ ...match, sportId: 'fight' })),
    ...hockeyMatches.map(match => ({ ...match, sportId: 'hockey' })),
    ...tennisMatches.map(match => ({ ...match, sportId: 'tennis' })),
    ...baseballMatches.map(match => ({ ...match, sportId: 'baseball' })),
    ...rugbyMatches.map(match => ({ ...match, sportId: 'rugby' })),
    ...motorSportsMatches.map(match => ({ ...match, sportId: 'motor-sports' })),
  ].filter((match, index, self) => index === self.findIndex(m => m.id === match.id));

  // Get available sports from all matches and put football first
  const availableSports = Array.from(new Set(combinedMatches.map(match => match.category?.toLowerCase() || match.sportId)))
    .sort((a, b) => {
      if (a === 'football') return -1;
      if (b === 'football') return 1;
      return a.localeCompare(b);
    });

  // Filter matches by selected sport
  const filteredMatches = selectedSport === 'all' 
    ? combinedMatches 
    : combinedMatches.filter(match => (match.category?.toLowerCase() || match.sportId) === selectedSport);

  // Get match count by sport
  const getMatchCountBySport = (sport: string) => {
    return combinedMatches.filter(match => (match.category?.toLowerCase() || match.sportId) === sport).length;
  };

  const formatDate = (timestamp: number | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isLive = (matchDate: number | string) => {
    const now = new Date();
    const date = typeof matchDate === 'string' ? new Date(matchDate).getTime() : matchDate;
    return Math.abs(now.getTime() - date) < 3 * 60 * 60 * 1000;
  };

  const getSportIcon = (sport: string) => {
    switch (sport.toLowerCase()) {
      case 'football':
      case 'soccer':
        return '⚽';
      case 'basketball':
        return '🏀';
      case 'fight':
      case 'boxing':
        return '🥊';
      case 'cricket':
        return '🏏';
      case 'tennis':
        return '🎾';
      case 'baseball':
        return '⚾';
      case 'rugby':
        return '🏉';
      case 'hockey':
        return '🏒';
      case 'motor-sports':
        return '🏎️';
      case 'volleyball':
        return '🏐';
      default:
        return '🏆';
    }
  };

  const handleMatchClick = (match: any) => {
    // Navigate to the actual match page where streams are handled
    const sportId = match.sportId || match.category?.toLowerCase() || 'football';
    navigate(`/match/${sportId}/${match.id}`);
    onClose(); // Close the sports modal
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800"
              onClick={onClose}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Sports</h1>
              <p className="text-gray-400">Browse all available matches by sport category</p>
            </div>
          </div>
        </div>

        {combinedMatches.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 mb-4">
              <Calendar className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Matches Available</h3>
            <p className="text-gray-400">Check back later for available matches</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Sports Filter */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Browse by Sport</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={selectedSport === 'all' ? 'default' : 'outline'}
                  className={`${
                    selectedSport === 'all' 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSelectedSport('all')}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  All Sports ({combinedMatches.length})
                </Button>
                {availableSports.map((sport) => (
                  <Button
                    key={sport}
                    variant={selectedSport === sport ? 'default' : 'outline'}
                    className={`${
                      selectedSport === sport 
                        ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                        : 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    onClick={() => setSelectedSport(sport)}
                  >
                    <span className="mr-2">{getSportIcon(sport)}</span>
                    {sport.charAt(0).toUpperCase() + sport.slice(1)} ({getMatchCountBySport(sport)})
                  </Button>
                ))}
              </div>
            </div>

            {/* Matches Grid */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {selectedSport === 'all' 
                  ? `All Matches (${filteredMatches.length})` 
                  : `${selectedSport.charAt(0).toUpperCase() + selectedSport.slice(1)} Matches (${filteredMatches.length})`
                }
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMatches.map((match) => (
                  <Card 
                    key={match.id}
                    className="bg-gray-900 border-gray-700 cursor-pointer transition-all hover:border-orange-500 hover:scale-105"
                    onClick={() => handleMatchClick(match)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          <span className="mr-1">{getSportIcon(match.category || match.sportId)}</span>
                          {match.category || match.sportId}
                        </Badge>
                        <div className="flex space-x-1">
                          {isLive(match.date) && (
                            <Badge className="bg-red-600 text-white text-xs px-2 py-1 flex items-center gap-1">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              LIVE
                            </Badge>
                          )}
                          {match.popular && (
                            <Badge className="bg-orange-600 text-white text-xs px-2 py-1">
                              Popular
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-white text-lg leading-tight">{match.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {match.teams ? (
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {match.teams.home?.badge && (
                              <img
                                src={`https://streamed.su/api/images/badge/${match.teams.home.badge}.webp`}
                                alt={match.teams.home?.name}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                            <span className="text-white font-medium text-sm">{match.teams.home?.name}</span>
                          </div>
                          
                          <span className="text-orange-500 font-bold text-xs">VS</span>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium text-sm">{match.teams.away?.name}</span>
                            {match.teams.away?.badge && (
                              <img
                                src={`https://streamed.su/api/images/badge/${match.teams.away.badge}.webp`}
                                alt={match.teams.away?.name}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                        </div>
                      ) : null}
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(match.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{match.sources?.length || 0} stream{(match.sources?.length || 0) !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredMatches.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No matches found for this sport category.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sports;
