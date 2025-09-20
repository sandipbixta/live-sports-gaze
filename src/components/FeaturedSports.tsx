import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tv2, TrendingUp, Zap } from 'lucide-react';

const FeaturedSports = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Featured Football Streaming</h2>
        <p className="text-gray-300">Access premium football matches from multiple sources</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Football 1 - PPV.to */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group">
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <Tv2 className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white group-hover:text-purple-300 transition-colors">
                    Football 1
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    PPV.to Premium Matches
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 text-sm">
              Access high-quality football streams from PPV.to with premium league coverage including Premier League, La Liga, and Champions League matches.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">Premier League</Badge>
              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">Champions League</Badge>
              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">La Liga</Badge>
            </div>
            <Link to="/football1">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium">
                <Tv2 className="h-4 w-4 mr-2" />
                Watch Football 1
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Football 2 - Streamed.pk */}
        <Card className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 group">
          <CardHeader className="relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg group-hover:bg-emerald-500/30 transition-colors">
                  <Zap className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-white group-hover:text-emerald-300 transition-colors">
                    Football 2
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Streamed.pk Live Matches
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <Zap className="h-3 w-3 mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 text-sm">
              Watch live football matches from Streamed.pk with extensive coverage of international leagues, cup competitions, and live sporting events.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-300">Serie A</Badge>
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-300">Bundesliga</Badge>
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-300">World Cup</Badge>
            </div>
            <Link to="/football2">
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium">
                <Zap className="h-4 w-4 mr-2" />
                Watch Football 2
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Choose your preferred streaming source for the best football watching experience
        </p>
      </div>
    </div>
  );
};

export default FeaturedSports;