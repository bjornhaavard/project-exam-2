"use client";

import { useState, useEffect } from "react";
import VenueList from "./components/VenueList";
import VenueSearch from "./components/VenueSearch";
import { useSearchParams } from "next/navigation";

export default function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isReady, setIsReady] = useState(false);
  const searchParams = useSearchParams();

  // Use useEffect to handle the search params and trigger loading state
  useEffect(() => {
    // Get search query from URL if it exists
    const query = searchParams.get("q") || "";
    setSearchQuery(query);

    // Set ready state after a small delay to ensure loading state is visible
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Don't render anything until ready, forcing Suspense to show the fallback
  if (!isReady) {
    // This empty return will trigger the Suspense fallback
    return null;
  }

  return (
    <>
      <VenueSearch onSearch={handleSearch} />
      <VenueList searchQuery={searchQuery} />
    </>
  );
}
