
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Keep for direct navigation if needed, or remove if only onSubmitSearch is used
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSubmitSearch?: (searchTerm: string) => void; // Callback for parent to handle search
  initialValue?: string; // Optional initial value for the input
  navigateToSearchPage?: boolean; // If true, will navigate to /search/[query]
}

export function SearchBar({ 
  onSubmitSearch, 
  initialValue = '', 
  navigateToSearchPage = true 
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();

  useEffect(() => {
    setQuery(initialValue); // Update query if initialValue prop changes
  }, [initialValue]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      if (onSubmitSearch) {
        onSubmitSearch(trimmedQuery);
      }
      if (navigateToSearchPage) {
        router.push(`/search/${encodeURIComponent(trimmedQuery)}`);
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full items-center space-x-1 sm:space-x-2">
      <Input
        type="text"
        placeholder="Search..." // Shortened placeholder
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-9 flex-grow text-xs sm:text-sm" // Adjusted height and text size
        aria-label="Search wallpapers"
      />
      <Button type="submit" size="icon" className="h-9 w-9 shrink-0" aria-label="Search">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
