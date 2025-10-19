import React, { useEffect, useState, useRef } from 'react';
import { Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Match } from '@/types/sports';
import { fetchMatchViewerCount, formatViewerCount, isMatchLive } from '@/services/viewerCountService';
import { cn } from '@/lib/utils';

interface LiveViewerCountProps {
  match: Match;
  showTrend?: boolean;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}

export const LiveViewerCount: React.FC<LiveViewerCountProps> = ({
  match,
  showTrend = false,
  size = 'sm',
  rounded = false,
  className
}) => {
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [previousCount, setPreviousCount] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');
  const updateIntervalRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2',
    lg: 'text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  // Fetch viewer count with retry mechanism
  const fetchCount = async () => {
    try {
      const count = await fetchMatchViewerCount(match);
      
      if (count !== null) {
        // Update trend if showing trends
        if (showTrend && previousCount !== null) {
          if (count > previousCount) {
            setTrend('up');
          } else if (count < previousCount) {
            setTrend('down');
          } else {
            setTrend('neutral');
          }
        }
        
        setPreviousCount(viewerCount);
        setViewerCount(count);
        setIsVisible(true);
        retryCountRef.current = 0; // Reset retry count on success
      } else {
        // Retry logic with exponential backoff
        if (retryCountRef.current < 3) {
          retryCountRef.current++;
          const backoffDelay = Math.pow(2, retryCountRef.current) * 1000;
          setTimeout(fetchCount, backoffDelay);
        }
      }
    } catch (error) {
      console.error('Error fetching viewer count:', error);
    }
  };

  useEffect(() => {
    // Only fetch for live matches
    if (!isMatchLive(match)) {
      setIsVisible(false);
      return;
    }

    // Initial fetch
    fetchCount();

    // Update every 30 seconds for live matches
    updateIntervalRef.current = setInterval(fetchCount, 30000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [match.id]);

  // Fade-in animation
  useEffect(() => {
    if (viewerCount !== null) {
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [viewerCount]);

  // Don't show if no valid count or not live
  if (viewerCount === null || viewerCount === 0 || !isVisible) {
    return null;
  }

  const getTrendIcon = () => {
    if (!showTrend || trend === 'neutral') return null;
    
    const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
    const trendColor = trend === 'up' ? 'text-green-500' : 'text-red-500';
    
    return <TrendIcon className={cn(iconSizes[size], trendColor)} />;
  };

  return (
    <div 
      className={cn(
        'flex items-center font-semibold text-foreground transition-opacity duration-500',
        sizeClasses[size],
        isVisible ? 'animate-fade-in opacity-100' : 'opacity-0',
        className
      )}
      aria-label={`Current viewer count: ${viewerCount.toLocaleString()}`}
      title="Live viewer count from stream data"
    >
      <Users className={cn(iconSizes[size], 'text-sports-primary')} />
      <span>{formatViewerCount(viewerCount, rounded)}</span>
      <span className="hidden sm:inline text-muted-foreground">viewers</span>
      {getTrendIcon()}
    </div>
  );
};
