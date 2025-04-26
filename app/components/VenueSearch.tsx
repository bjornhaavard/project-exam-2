"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Props for the VenueSearch component
 * @interface VenueSearchProps
 */
interface VenueSearchProps {
  /**
   * Callback function triggered when search is performed
   * @param {string} query - The search query text (may include location information)
   */
  onSearch: (query: string) => void;
}

/**
 * VenueSearch component
 *
 * A search form that allows users to search venues by name, description, and location
 * using a single input field.
 *
 * @param {VenueSearchProps} props - Component props
 * @returns {React.JSX.Element} The search form component
 */
export default function VenueSearch({ onSearch }: VenueSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * State for the search query
   */
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * State to track if search is in progress
   */
  const [isSearching, setIsSearching] = useState(false);

  // Initialize search query from URL on component mount
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
    if (query) {
      onSearch(query);
    }
  }, [searchParams, onSearch]);

  /**
   * Handles form submission for search
   * @param {React.FormEvent} e - Form event
   */
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

  /**
   * Clears the search query
   */
  const handleClear = () => {
    setSearchQuery("");
    router.push("/");
    onSearch("");
  };

  /**
   * Handles input change with auto-clear functionality
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
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
          <Input type="text" placeholder="Search venues by name, description, or location" value={searchQuery} onChange={handleInputChange} className="pl-10 w-full" />
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
      {searchQuery && (
        <div className="mt-2 text-sm text-gray-500">
          <p>Tip: Include location terms like &quot;city&quot; or &quot;country&quot; to find venues in specific areas.</p>
        </div>
      )}
    </div>
  );
}
