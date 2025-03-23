"use client";

import { useState } from "react";
import VenueList from "./components/VenueList";
import VenueSearch from "./components/VenueSearch";

export default function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <>
      <VenueSearch onSearch={handleSearch} />
      <VenueList searchQuery={searchQuery} />
    </>
  );
}
