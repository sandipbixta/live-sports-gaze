
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useIsMobile } from '../hooks/use-mobile';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  className?: string;
  showButton?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  onSubmit,
  placeholder = "Search events...",
  className = "",
  showButton = false
}) => {
  const isMobile = useIsMobile();
  
  return (
    <form 
      className={`relative flex items-center ${className}`}
      onSubmit={onSubmit ? onSubmit : (e) => e.preventDefault()}
    >
      <Search className={`absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-400 pointer-events-none`} />
      <Input 
        type="text" 
        placeholder={isMobile ? "Search..." : placeholder} 
        className={`bg-[#242836] border border-[#343a4d] rounded-full ${isMobile ? 'h-8 py-1 pl-7 pr-2' : 'py-2 pl-10 pr-4'} text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-[#9b87f5] text-white flex-grow`}
        value={value}
        onChange={onChange}
      />
      {showButton && (
        <Button 
          type="submit" 
          className={`ml-2 bg-[#9b87f5] hover:bg-[#8a75e8] rounded-full ${isMobile ? 'h-8 w-8 p-0' : ''}`}
          aria-label="Search"
        >
          {isMobile ? (
            <Search className="h-3 w-3" />
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </>
          )}
        </Button>
      )}
    </form>
  );
};

export default SearchBar;
