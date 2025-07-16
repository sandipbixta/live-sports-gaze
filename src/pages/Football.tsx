
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageLayout from '../components/PageLayout';
import { Button } from '../components/ui/button';
import { Play, Calendar, Trophy } from 'lucide-react';

const Football = () => {
  const popularLeagues = [
    { name: 'Premier League', matches: 15, description: 'English Premier League live streams' },
    { name: 'Champions League', matches: 8, description: 'UEFA Champions League matches' },
    { name: 'La Liga', matches: 12, description: 'Spanish La Liga live streams' },
    { name: 'Serie A', matches: 10, description: 'Italian Serie A matches' },
    { name: 'Bundesliga', matches: 9, description: 'German Bundesliga live streams' },
    { name: 'World Cup', matches: 6, description: 'FIFA World Cup matches' }
  ];

  return (
    <PageLayout>
      <Helmet>
        <title>Free Football Streaming - Live Premier League, Champions League | DamiTV</title>
        <meta name="description" content="Watch live football streams free. Premier League, Champions League, La Liga, Serie A, Bundesliga matches. No registration required. HD quality streams." />
        <meta name="keywords" content="free football streaming, live football, Premier League stream, Champions League live, football matches online, watch football free" />
        <link rel="canonical" href="https://damitv.pro/football" />
      </Helmet>

      <div className="py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">Free Football Streaming</h1>
          <p className="text-xl mb-6">Watch live football matches from top leagues worldwide. Premier League, Champions League, and more - all free!</p>
          <div className="flex gap-4">
            <Link to="/live">
              <Button className="bg-white text-green-600 hover:bg-gray-100">
                <Play className="mr-2 h-5 w-5" />
                Watch Live Now
              </Button>
            </Link>
            <Link to="/schedule">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
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
            Popular Football Leagues
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularLeagues.map((league) => (
              <div key={league.name} className="bg-[#242836] rounded-lg p-6 border border-[#343a4d] hover:border-[#9b87f5] transition-colors">
                <h3 className="text-xl font-bold text-white mb-2">{league.name}</h3>
                <p className="text-gray-300 mb-4">{league.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#9b87f5]">{league.matches} live matches</span>
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
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">HD Quality Streams</h3>
            <p className="text-gray-300">Crystal clear HD streaming for the best viewing experience</p>
          </div>
          <div className="bg-[#242836] rounded-lg p-6 text-center border border-[#343a4d]">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Schedule</h3>
            <p className="text-gray-300">Never miss a match with our comprehensive schedule</p>
          </div>
          <div className="bg-[#242836] rounded-lg p-6 text-center border border-[#343a4d]">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">All Major Leagues</h3>
            <p className="text-gray-300">Coverage of Premier League, Champions League, and more</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-[#242836] rounded-xl p-8 text-center border border-[#343a4d]">
          <h2 className="text-2xl font-bold text-white mb-4">Start Watching Football Now</h2>
          <p className="text-gray-300 mb-6">Join thousands of football fans streaming live matches for free. No registration required!</p>
          <Link to="/live">
            <Button size="lg" className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white">
              <Play className="mr-2 h-5 w-5" />
              Watch Live Football
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};

export default Football;
