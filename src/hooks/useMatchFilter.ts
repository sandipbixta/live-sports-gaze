
import { useState, useEffect } from 'react';
import { Match } from '../types/sports';
import { useToast } from './use-toast';

interface UseMatchFilterProps {
  allMatches: Match[];
  liveMatches: Match[];
  upcomingMatches: Match[];
}

export const useMatchFilter = ({ allMatches, liveMatches, upcomingMatches }: UseMatchFilterProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>("all");
  const [activeSportFilter, setActiveSportFilter] = useState<string>("all");
  const [filteredMatches, setFilteredMatches] = useState<Match[]>(allMatches);

  // Update filtered matches when search query or active tab or sport filter changes
  useEffect(() => {
    let matchesToFilter = allMatches;
    
    // First filter by tab selection
    if (activeTab === "live") {
      matchesToFilter = liveMatches;
    } else if (activeTab === "upcoming") {
      matchesToFilter = upcomingMatches;
    }
    
    // Then filter by sport if not "all"
    if (activeSportFilter !== "all") {
      matchesToFilter = matchesToFilter.filter(match => match.sportId === activeSportFilter);
    }
    
    // Then filter by search query
    if (searchQuery.trim() === '') {
      setFilteredMatches(matchesToFilter);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = matchesToFilter.filter(match => 
        match.title.toLowerCase().includes(query) || 
        match.teams?.home?.name?.toLowerCase().includes(query) || 
        match.teams?.away?.name?.toLowerCase().includes(query)
      );
      setFilteredMatches(filtered);
    }
  }, [searchQuery, activeTab, activeSportFilter, allMatches, liveMatches, upcomingMatches]);

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Show a toast to confirm search
    if (searchQuery.trim() !== '') {
      toast({
        title: "Searching",
        description: `Finding matches for "${searchQuery}"`,
      });
    }
  };

  // Clear search query
  const handleSearchClear = () => setSearchQuery('');

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    activeSportFilter, 
    setActiveSportFilter,
    filteredMatches,
    setFilteredMatches,
    handleSearchSubmit,
    handleSearchClear
  };
};
