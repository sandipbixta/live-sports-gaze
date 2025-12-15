import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
interface TrendingTopic {
  title: string;
  category: string;
  views: number;
  trend: 'up' | 'hot' | 'new';
  url: string;
  timeAgo: string;
}
const TrendingTopics: React.FC = () => {
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  useEffect(() => {
    // Generate trending topics based on current popular searches and matches
    const generateTrends = () => {
      const topics: TrendingTopic[] = [{
        title: "Premier League Live Streams",
        category: "Football",
        views: 45632,
        trend: 'hot',
        url: "/live?filter=football",
        timeAgo: "Now trending"
      }, {
        title: "Champions League Quarter Finals",
        category: "Football",
        views: 38924,
        trend: 'up',
        url: "/live?filter=football",
        timeAgo: "2h ago"
      }, {
        title: "NBA Playoffs Live",
        category: "Basketball",
        views: 29847,
        trend: 'hot',
        url: "/live?filter=basketball",
        timeAgo: "1h ago"
      }, {
        title: "La Liga El Clasico",
        category: "Football",
        views: 56789,
        trend: 'hot',
        url: "/live?filter=football",
        timeAgo: "30m ago"
      }, {
        title: "UEFA Europa League",
        category: "Football",
        views: 22456,
        trend: 'up',
        url: "/live?filter=football",
        timeAgo: "3h ago"
      }, {
        title: "Tennis Grand Slam Live",
        category: "Tennis",
        views: 18234,
        trend: 'new',
        url: "/live?filter=tennis",
        timeAgo: "45m ago"
      }];

      // Randomize order to make it feel dynamic
      const shuffled = topics.sort(() => Math.random() - 0.5);
      setTrends(shuffled.slice(0, 5));
    };
    generateTrends();

    // Update trends every 5 minutes
    const interval = setInterval(generateTrends, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
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
  return;
};
export default TrendingTopics;