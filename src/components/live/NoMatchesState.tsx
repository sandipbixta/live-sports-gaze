
import React from 'react';
import { Button } from '../ui/button';
import { Tv, RefreshCcw, Calendar, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NoMatchesStateProps {
  searchQuery?: string;
  onSearchClear?: () => void;
  onRefresh?: () => void;
  icon?: 'tv' | 'calendar' | 'search';
  message?: string;
}

const NoMatchesState: React.FC<NoMatchesStateProps> = ({
  searchQuery = '',
  onSearchClear,
  onRefresh,
  icon = 'tv',
  message
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'tv':
        return <Tv size={40} className="mx-auto mb-3 text-gray-400" />;
      case 'calendar':
        return <Calendar size={40} className="mx-auto mb-3 text-gray-400" />;
      case 'search':
      default:
        return <Search size={40} className="mx-auto mb-3 text-gray-400" />;
    }
  };

  return (
    <div className="w-full bg-[#242836] rounded-xl p-8 text-center">
      {searchQuery ? (
        <div>
          <Search size={40} className="mx-auto mb-3 text-gray-400" />
          <p className="text-gray-300 mb-3">No matches found for "{searchQuery}"</p>
          {onSearchClear && (
            <Button onClick={onSearchClear} size="sm" className="bg-[#fa2d04] hover:bg-[#e02703]">
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div>
          {getIcon()}
          <p className="text-gray-300 mb-3">{message || 'No matches currently available.'}</p>
          {onRefresh && (
            <Button onClick={onRefresh} size="sm" className="bg-[#fa2d04] hover:bg-[#e02703]">
              <RefreshCcw size={14} className="mr-1" />
              Refresh
            </Button>
          )}
          {icon === 'tv' && (
            <div className="mt-4">
              <Link to="/schedule">
                <Button variant="outline" className="bg-transparent border border-[#343a4d] text-white">
                  <Calendar size={16} className="mr-2" />
                  View Schedule
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoMatchesState;
