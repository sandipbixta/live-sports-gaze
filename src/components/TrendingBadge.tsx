
import React from 'react';

interface TrendingBadgeProps {
  isHot?: boolean;
  className?: string;
}

const TrendingBadge: React.FC<TrendingBadgeProps> = ({ isHot = false, className = "" }) => {
  if (!isHot) return null;

  return (
    <div className={`inline-flex items-center bg-red-600 text-white text-xs px-1.5 py-0.5 rounded ${className}`}>
      <span className="font-medium">HOT</span>
    </div>
  );
};

export default TrendingBadge;
