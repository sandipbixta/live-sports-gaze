
import React from 'react';
import { Button } from '../ui/button';
import SearchBar from '../SearchBar';
import { Tv, RefreshCcw } from 'lucide-react';

interface LiveHeaderProps {
  liveMatchesCount: number;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onRefresh: () => void;
}

const LiveHeader: React.FC<LiveHeaderProps> = ({
  liveMatchesCount,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onRefresh
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
      <h1 className="text-3xl font-bold text-white">Live &amp; Upcoming</h1>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onSubmit={onSearchSubmit}
          placeholder="Search games..."
          className="w-full sm:w-64"
          showButton={true}
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#242836] px-3 py-1.5 rounded-full">
            <Tv size={16} className="text-[#ff5a36] animate-pulse" />
            <span className="text-sm font-medium text-white" aria-live="polite">
              {liveMatchesCount} Live Now
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-[#242836] border-[#343a4d] hover:bg-[#2a2f3f]"
            onClick={onRefresh}
            aria-label="Refresh live matches"
          >
            <RefreshCcw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveHeader;
