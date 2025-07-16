
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

const TrendingSection = () => {
  const trendingTopics = [
    { title: "Premier League Live Streams", link: "/football", searches: "15.2K" },
    { title: "Champions League Today", link: "/live", searches: "12.8K" },
    { title: "NBA Live Games", link: "/basketball", searches: "9.4K" },
    { title: "World Cup 2024", link: "/live", searches: "8.7K" },
    { title: "Tennis Live Matches", link: "/live", searches: "6.3K" },
    { title: "Formula 1 Racing", link: "/live", searches: "5.9K" }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <TrendingUp className="mr-2 h-6 w-6 text-[#ff5a36]" />
          Trending Now
        </h2>
        <span className="text-sm text-gray-400">Updated hourly</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingTopics.map((topic, index) => (
          <Link 
            key={topic.title}
            to={topic.link}
            className="group bg-[#242836] rounded-lg p-4 border border-[#343a4d] hover:border-[#9b87f5] transition-all duration-200 hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <span className="text-[#ff5a36] font-bold text-lg mr-2">#{index + 1}</span>
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">HOT</span>
                </div>
                <h3 className="text-white font-medium group-hover:text-[#9b87f5] transition-colors">
                  {topic.title}
                </h3>
                <p className="text-gray-400 text-sm mt-1">{topic.searches} searches</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-[#9b87f5] transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrendingSection;
