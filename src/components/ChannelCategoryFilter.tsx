
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tv, Trophy, Globe, Music, Film } from 'lucide-react';

interface ChannelCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts: Record<string, number>;
}

const categories = [
  { id: 'all', name: 'All Channels', icon: Globe },
  { id: 'sports', name: 'Sports', icon: Trophy },
  { id: 'news', name: 'News', icon: Tv },
  { id: 'entertainment', name: 'Entertainment', icon: Film },
  { id: 'music', name: 'Music', icon: Music },
];

const ChannelCategoryFilter: React.FC<ChannelCategoryFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange,
  categoryCounts 
}) => {
  return (
    <div className="bg-[#151922] rounded-xl p-4 border border-[#343a4d] mb-4">
      <h3 className="font-semibold text-white text-sm mb-3">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => {
          const Icon = category.icon;
          const count = categoryCounts[category.id] || 0;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className={`${
                isSelected 
                  ? 'bg-[#ff5a36] hover:bg-[#e64d2e] text-white' 
                  : 'bg-[#242836] border-[#343a4d] text-white hover:bg-[#343a4d]'
              } text-xs flex items-center gap-2`}
            >
              <Icon className="h-3 w-3" />
              {category.name}
              <Badge 
                variant="secondary" 
                className="ml-1 bg-[#343a4d] text-gray-300 text-xs px-1"
              >
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ChannelCategoryFilter;
