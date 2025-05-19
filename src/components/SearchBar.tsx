
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

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
  return (
    <form 
      className={`relative flex items-center ${className}`}
      onSubmit={onSubmit ? onSubmit : (e) => e.preventDefault()}
    >
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input 
        type="text" 
        placeholder={placeholder} 
        className="bg-[#242836] border border-[#343a4d] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#9b87f5] text-white flex-grow"
        value={value}
        onChange={onChange}
      />
      {showButton && (
        <Button 
          type="submit" 
          className="ml-2 bg-[#9b87f5] hover:bg-[#8a75e8] rounded-full"
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      )}
    </form>
  );
};

export default SearchBar;
