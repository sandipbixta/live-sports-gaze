
import React from 'react';
import { Flame } from 'lucide-react';

interface TrendingBadgeProps {
  isHot?: boolean;
  className?: string;
}

const TrendingBadge: React.FC<TrendingBadgeProps> = ({ isHot = false, className = "" }) => {
  if (!isHot) return null;

  return (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce ${className}`}>
      <Flame className="h-3 w-3 animate-pulse" />
      <span className="font-bold">HOT</span>
    </div>
  );
};

export default TrendingBadge;
