
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageLayout from '../components/PageLayout';
import { Button } from '../components/ui/button';
import { Play, Calendar, Trophy } from 'lucide-react';

const Basketball = () => {
  const popularLeagues = [
    { name: 'NBA', matches: 12, description: 'National Basketball Association live games' },
    { name: 'EuroLeague', matches: 8, description: 'European Basketball League matches' },
    { name: 'NCAA', matches: 15, description: 'College Basketball live streams' },
    { name: 'WNBA', matches: 6, description: 'Women\'s National Basketball Association' },
    { name: 'FIBA World Cup', matches: 4, description: 'International Basketball Championship' },
    { name: 'Olympics', matches: 3, description: 'Olympic Basketball Tournament' }
  ];

  return (
    <PageLayout>
      <Helmet>
        <title>Free Basketball Streaming - Live NBA, EuroLeague Games | DamiTV</title>
        <meta name="description" content="Watch live basketball streams free. NBA, EuroLeague, NCAA basketball games online. No registration required. HD quality basketball streaming." />
        <meta name="keywords" content="free basketball streaming, live NBA, basketball games online, watch basketball free, NBA streams, EuroLeague live" />
        <link rel="canonical" href="https://damitv.pro/basketball" />
      </Helmet>

      <div className="py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">Free Basketball Streaming</h1>
          <p className="text-xl mb-6">Watch live NBA games, EuroLeague, and college basketball. All your favorite teams and players - streaming free!</p>
          <div className="flex gap-4">
            <Link to="/live">
              <Button className="bg-white text-orange-600 hover:bg-gray-100">
                <Play className="mr-2 h-5 w-5" />
                Watch Live Now
              </Button>
            </Link>
            <Link to="/schedule">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600">
                <Calendar className="mr-2 h-5 w-5" />
                View Schedule
              </Button>
            </Link>
          </div>
        </div>

        {/* Popular Leagues */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
            Popular Basketball Leagues
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularLeagues.map((league) => (
              <div key={league.name} className="bg-[#242836] rounded-lg p-6 border border-[#343a4d] hover:border-[#9b87f5] transition-colors">
                <h3 className="text-xl font-bold text-white mb-2">{league.name}</h3>
                <p className="text-gray-300 mb-4">{league.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#9b87f5]">{league.matches} live games</span>
                  <Link to="/live">
                    <Button size="sm" variant="outline" className="text-white border-[#343a4d] hover:bg-[#343a4d]">
                      Watch Live
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#242836] rounded-lg p-6 text-center border border-[#343a4d]">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live NBA Games</h3>
            <p className="text-gray-300">Stream all NBA games live in high definition quality</p>
          </div>
          <div className="bg-[#242836] rounded-lg p-6 text-center border border-[#343a4d]">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Game Schedule</h3>
            <p className="text-gray-300">Complete schedule of upcoming basketball games</p>
          </div>
          <div className="bg-[#242836] rounded-lg p-6 text-center border border-[#343a4d]">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multiple Leagues</h3>
            <p className="text-gray-300">NBA, EuroLeague, NCAA and international tournaments</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-[#242836] rounded-xl p-8 text-center border border-[#343a4d]">
          <h2 className="text-2xl font-bold text-white mb-4">Start Watching Basketball Now</h2>
          <p className="text-gray-300 mb-6">Join basketball fans worldwide streaming live games for free. No subscription needed!</p>
          <Link to="/live">
            <Button size="lg" className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white">
              <Play className="mr-2 h-5 w-5" />
              Watch Live Basketball
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default Basketball;
