import React from 'react';
import { Radio, Play, Users, Tv } from 'lucide-react';

interface QuickStatsProps {
  liveMatchesCount: number;
  channelsCount: number;
  viewersCount?: number;
}

const QuickStats: React.FC<QuickStatsProps> = ({
  liveMatchesCount,
  channelsCount,
  viewersCount = 0
}) => {
  const stats = [
    {
      icon: Play,
      value: liveMatchesCount,
      label: 'Live Now',
      color: 'text-live',
      bgColor: 'bg-live/10'
    },
    {
      icon: Tv,
      value: channelsCount,
      label: 'Channels',
      color: 'text-sports-upcoming',
      bgColor: 'bg-sports-upcoming/10'
    },
    {
      icon: Users,
      value: viewersCount > 1000 ? `${(viewersCount / 1000).toFixed(1)}K` : viewersCount,
      label: 'Watching',
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`flex items-center gap-3 p-4 rounded-xl ${stat.bgColor} border border-border`}
        >
          <div className={`p-2 rounded-lg ${stat.bgColor}`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;
