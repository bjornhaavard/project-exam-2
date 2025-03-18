"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VenueSearchProps {
  onSearch: (query: string) => void;
}

export default function VenueSearch({ onSearch }: VenueSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Initialize search query from URL on component mount
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    if (query) {
      onSearch(query);
    }
  }, [searchParams, onSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    // Trim the search query and check if it's not empty
    const trimmedQuery = searchQuery.trim();

    // Update URL with search query
    if (trimmedQuery) {
      router.push(`/?q=${encodeURIComponent(trimmedQuery)}`);
    } else {
      router.push("/");
    }

    // Call the onSearch callback
    onSearch(trimmedQuery);
    setIsSearching(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    router.push("/");
    onSearch("");
  };

  // Handle input change with auto-clear functionality
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);

    // If the input becomes empty, automatically clear the search
    if (newValue === "") {
      router.push("/");
      onSearch("");
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Input type="text" placeholder="Search venues by name or description..." value={searchQuery} onChange={handleInputChange} className="pl-10 w-full" />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSearching} className="min-w-[100px]">
            {isSearching ? "Searching..." : "Search"}
          </Button>
          {searchQuery && (
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
