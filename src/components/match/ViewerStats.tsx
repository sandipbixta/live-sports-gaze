import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { Match } from '@/types/sports';
import { fetchMatchViewerCount, formatViewerCount, isMatchLive } from '@/services/viewerCountService';
import { cn } from '@/lib/utils';

interface ViewerStatsProps {
  match: Match;
  className?: string;
}

export const ViewerStats: React.FC<ViewerStatsProps> = ({ match, className }) => {
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [previousCount, setPreviousCount] = useState<number | null>(null);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');
  const [showRounded, setShowRounded] = useState(() => {
    const saved = localStorage.getItem('viewer-count-format');
    return saved === 'rounded';
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch viewer count periodically
  useEffect(() => {
    if (!isMatchLive(match)) {
      return;
    }

    const fetchCount = async () => {
      try {
        const count = await fetchMatchViewerCount(match);
        
        if (count !== null) {
          // Trigger celebration for high viewer counts
          if (count > 10000 && viewerCount !== null && count > viewerCount) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
          }

          // Calculate trend
          if (previousCount !== null) {
            if (count > previousCount) {
              setTrend('up');
            } else if (count < previousCount) {
              setTrend('down');
            } else {
              setTrend('neutral');
            }
          }

          // Animate count change
          setIsAnimating(true);
          setPreviousCount(viewerCount);
          setViewerCount(count);
          setTimeout(() => setIsAnimating(false), 500);
        }
      } catch (error) {
        console.error('Error fetching viewer count:', error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [match.id, viewerCount, previousCount]);

  // Toggle format preference
  const toggleFormat = () => {
    const newFormat = !showRounded;
    setShowRounded(newFormat);
    localStorage.setItem('viewer-count-format', newFormat ? 'rounded' : 'exact');
  };

  if (!isMatchLive(match)) {
    return null;
  }

  if (viewerCount === null || viewerCount === 0) {
    return (
      <Card className={cn('p-4 bg-card border-border', className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-5 h-5" />
          <span className="text-sm">Viewer count unavailable</span>
        </div>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (trend === 'neutral') return null;
    const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
    const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';
    return <TrendIcon className={cn('w-5 h-5', trendColor)} />;
  };

  return (
    <Card className={cn('p-6 bg-card border-border relative overflow-hidden', className)}>
      {/* Confetti effect for high viewer counts */}
      {showConfetti && viewerCount > 10000 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-pulse" />
        </div>
      )}

      <div className="space-y-4">
        {/* Main viewer count display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-sports-primary/20">
              <Users className="w-6 h-6 text-sports-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Live Viewers</p>
              <div className="flex items-center gap-2">
                <span 
                  className={cn(
                    'text-3xl font-bold text-foreground transition-all duration-500',
                    isAnimating && 'scale-110'
                  )}
                >
                  {formatViewerCount(viewerCount, showRounded)}
                </span>
                {getTrendIcon()}
              </div>
            </div>
          </div>

          {/* Format toggle button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFormat}
            className="gap-2"
            title={showRounded ? 'Show exact count' : 'Show rounded count'}
          >
            {showRounded ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {showRounded ? 'Exact' : 'Round'}
          </Button>
        </div>

        {/* Trend indicator */}
        {trend !== 'neutral' && previousCount !== null && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              {trend === 'up' ? '↑' : '↓'}
              {' '}
              {Math.abs(viewerCount - previousCount).toLocaleString()}
              {' '}
              viewers in the last update
            </span>
          </div>
        )}

        {/* High viewership celebration */}
        {viewerCount > 10000 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <span className="text-2xl">🔥</span>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
              This is a trending match with high viewership!
            </p>
          </div>
        )}

        {/* Data source info */}
        <p className="text-xs text-muted-foreground">
          Live viewer count from stream data • Updates every 30 seconds
        </p>
      </div>
    </Card>
  );
};
