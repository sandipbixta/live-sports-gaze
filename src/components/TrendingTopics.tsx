import React, { useMemo } from 'react';
import { TrendingUp, Clock, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Match } from '../types/sports';

interface TrendingTopic {
  title: string;
  category: string;
  trend: 'up' | 'hot' | 'new';
  url: string;
  timeAgo: string;
  sources: number;
}

interface TrendingTopicsProps {
  matches?: Match[];
}

const TrendingTopics: React.FC<TrendingTopicsProps> = ({ matches = [] }) => {
  const trends = useMemo(() => {
    if (!matches || matches.length === 0) {
      return [];
    }

    // Filter and process real matches
    const processedTrends: TrendingTopic[] = matches
      .filter(match => match.popular || (match.sources && match.sources.length > 1))
      .map(match => {
        const categoryMap: { [key: string]: string } = {
          'football': 'Football',
          'basketball': 'Basketball',
          'tennis': 'Tennis',
          'baseball': 'Baseball',
          'rugby': 'Rugby',
          'hockey': 'Hockey',
          'american-football': 'American Football',
          'fight': 'Fighting',
          'motor-sports': 'Motor Sports',
          'other': 'Sports'
        };

        const sourceCount = match.sources?.length || 1;
        const isRecent = match.date && (Date.now() - match.date) < 3600000; // Within 1 hour
        const isPopular = match.popular;
        const hasMultipleSources = sourceCount > 2;

        let trend: 'up' | 'hot' | 'new';
        let timeAgo: string;

        if (isRecent) {
          trend = 'new';
          timeAgo = 'Just started';
        } else if (hasMultipleSources) {
          trend = 'hot';
          timeAgo = 'Multiple streams';
        } else if (isPopular) {
          trend = 'up';
          timeAgo = 'Popular match';
        } else {
          trend = 'up';
          timeAgo = 'Live now';
        }

        return {
          title: match.title,
          category: categoryMap[match.category] || 'Sports',
          trend,
          url: `/match/${match.category}/${match.id}`,
          timeAgo,
          sources: sourceCount
        };
      })
      .sort((a, b) => b.sources - a.sources) // Sort by number of sources (popularity indicator)
      .slice(0, 5);

    return processedTrends;
  }, [matches]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'hot':
        return <Flame className="h-3 w-3 text-red-500" />;
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'new':
        return <Clock className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <Card className="bg-[#242836] border-[#343a4d]">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#9b87f5]" />
          Trending Now
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trends.map((topic, index) => (
            <Link 
              key={index}
              to={topic.url}
              className="block hover:bg-[#1A1F2C] p-2 rounded-lg transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getTrendIcon(topic.trend)}
                    <h4 className="text-sm font-medium text-white truncate">
                      {topic.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Badge 
                      variant="outline" 
                      className="text-xs px-1 py-0 bg-[#1A1F2C] border-[#343a4d] text-gray-300"
                    >
                      {topic.category}
                    </Badge>
                    <span>•</span>
                    <span>{topic.timeAgo}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-[#343a4d]">
          <Link 
            to="/live" 
            className="text-xs text-[#9b87f5] hover:text-[#8a75e8] font-medium"
          >
            View all live matches →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingTopics;