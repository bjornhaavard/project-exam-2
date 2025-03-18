"use client";

import { useState } from "react";
import VenueList from "./components/VenueList";
import VenueSearch from "./components/VenueSearch";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Holidaze Venues</h1>
      <VenueSearch onSearch={handleSearch} />
      <VenueList searchQuery={searchQuery} />
    </main>
  );
}
