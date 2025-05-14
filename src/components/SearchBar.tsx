
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Search events...",
  className = ""
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <Input 
        type="text" 
        placeholder={placeholder} 
        className="bg-[#242836] border border-[#343a4d] rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#9b87f5] w-full text-white"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;
