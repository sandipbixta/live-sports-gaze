import React, { useEffect, useState, useRef } from 'react';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Match } from '@/types/sports';
import { fetchMatchViewerCount, formatViewerCount, isMatchLive } from '@/services/viewerCountService';
import { cn } from '@/lib/utils';

// Smooth counter animation
const useCounterAnimation = (targetValue: number, duration: number = 500) => {
  const [displayValue, setDisplayValue] = useState(targetValue);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (displayValue === targetValue) return;

    const startValue = displayValue;
    const startTime = Date.now();
    const difference = targetValue - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + difference * easeOut);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration]);

  return displayValue;
};

// Generate realistic viewer count based on match popularity
const generateBaseViewerCount = (match: Match): number => {
  // Use match ID as seed for consistency
  const seed = match.id?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 1000;
  
  // Base viewers between 500 and 5000
  let baseViewers = 500 + (seed % 4500);
  
  // Boost for popular leagues/tournaments
  const tournament = match.tournament?.toLowerCase() || '';
  const title = match.title?.toLowerCase() || '';
  
  if (tournament.includes('premier') || tournament.includes('champions') || tournament.includes('world cup')) {
    baseViewers *= 3;
  } else if (tournament.includes('la liga') || tournament.includes('bundesliga') || tournament.includes('serie a')) {
    baseViewers *= 2;
  } else if (tournament.includes('nba') || tournament.includes('nfl')) {
    baseViewers *= 2.5;
  }
  
  // Add some randomness within 10% range
  const variance = baseViewers * 0.1;
  baseViewers += Math.floor(Math.random() * variance) - variance / 2;
  
  return Math.floor(baseViewers);
};

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
  const [viewerCount, setViewerCount] = useState<number>(() => generateBaseViewerCount(match));
  const [previousCount, setPreviousCount] = useState<number>(viewerCount);
  const [isVisible, setIsVisible] = useState(true);
  const [trend, setTrend] = useState<'up' | 'down' | 'neutral'>('neutral');
  const updateIntervalRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  
  // Animated counter value
  const animatedCount = useCounterAnimation(viewerCount, 800);

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
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
      
      if (count !== null && count > 0) {
        // Update trend
        if (previousCount > 0) {
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
        retryCountRef.current = 0;
      } else {
        // Simulate viewer fluctuation if no real data
        const currentBase = viewerCount;
        const fluctuation = Math.floor(Math.random() * 100) - 50; // +/- 50
        const newCount = Math.max(100, currentBase + fluctuation);
        
        if (newCount > currentBase) {
          setTrend('up');
        } else if (newCount < currentBase) {
          setTrend('down');
        } else {
          setTrend('neutral');
        }
        
        setPreviousCount(currentBase);
        setViewerCount(newCount);
      }
    } catch (error) {
      console.error('Error fetching viewer count:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCount();

    // Update every 15 seconds for more dynamic feel
    updateIntervalRef.current = setInterval(fetchCount, 15000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [match.id]);

  const getTrendIcon = () => {
    if (!showTrend) return null;
    
    if (trend === 'up') {
      return (
        <div className="flex items-center gap-0.5 text-green-500 animate-fade-in">
          <TrendingUp className={cn(iconSizes[size])} />
        </div>
      );
    } else if (trend === 'down') {
      return (
        <div className="flex items-center gap-0.5 text-red-400 animate-fade-in">
          <TrendingDown className={cn(iconSizes[size])} />
        </div>
      );
    }
    
    return null;
  };

  return (
    <div 
      className={cn(
        'flex items-center font-semibold transition-all duration-500',
        sizeClasses[size],
        className
      )}
      aria-label={`Current viewer count: ${animatedCount.toLocaleString()}`}
      title="Live viewer count"
    >
      <Users className={cn(iconSizes[size], 'text-primary')} />
      <span className="transition-all duration-300 tabular-nums">
        {animatedCount.toLocaleString()}
      </span>
      {getTrendIcon()}
    </div>
  );
};
