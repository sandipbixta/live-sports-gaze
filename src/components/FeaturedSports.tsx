import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tv2, Zap } from 'lucide-react';

interface FeaturedSportsProps {
  className?: string;
}

const FeaturedSports: React.FC<FeaturedSportsProps> = ({ className = "" }) => {
  const featuredSports = [
    {
      id: 'football1',
      name: 'Football 1',
      path: '/football1',
      icon: Tv2,
    },
    {
      id: 'football2', 
      name: 'Football 2',
      path: '/football2',
      icon: Zap,
    }
  ];

  return (
    <div className={className}>
      {/* Mobile: horizontal scroll */}
      <div className="flex overflow-x-auto pb-3 space-x-3 scrollbar-none lg:hidden">
        {featuredSports.map((sport) => {
          const IconComponent = sport.icon;
          return (
            <Link key={sport.id} to={sport.path}>
              <Button
                className="px-3 py-1.5 rounded-lg transition-all whitespace-nowrap text-sm flex-shrink-0 bg-[#9b87f5] text-white hover:bg-[#8a75e8] shadow-lg shadow-[#9b87f5]/20 flex items-center gap-2"
                variant="default"
              >
                <IconComponent className="h-4 w-4" />
                {sport.name}
              </Button>
            </Link>
          );
        })}
      </div>

      {/* Desktop: grid */}
      <div className="hidden lg:grid lg:grid-cols-10 gap-2">
        {featuredSports.map((sport) => {
          const IconComponent = sport.icon;
          return (
            <Link key={sport.id} to={sport.path}>
              <Button
                className="px-3 py-1.5 rounded-lg transition-all text-sm truncate bg-[#9b87f5] text-white hover:bg-[#8a75e8] shadow-lg shadow-[#9b87f5]/20 flex items-center gap-2"
                variant="default"
              >
                <IconComponent className="h-4 w-4" />
                <span className="truncate">{sport.name}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedSports;