"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ImageGalleryModal from "./ImageGalleryModal";
import { API_CONFIG } from "@/app/api-config";

interface Venue {
  id: string;
  name: string;
  description: string;
  media: { url: string; alt: string }[];
  price: number;
  maxGuests: number;
  rating: number;
  created: string;
  updated: string;
  meta: {
    wifi: boolean;
    parking: boolean;
    breakfast: boolean;
    pets: boolean;
  };
  location: {
    address: string;
    city: string;
    zip: string;
    country: string;
    continent: string | null;
    lat: number;
    lng: number;
  };
  _count?: {
    bookings: number;
  };
}

interface ApiResponse {
  data: Venue[];
  meta: {
    isSuccess: boolean;
    count: number;
    limit: number;
    offset: number;
  };
}

const INITIAL_DISPLAY_COUNT = 20;
const LOAD_MORE_COUNT = 10;

interface VenueListProps {
  searchQuery?: string;
}

export default function VenueList({ searchQuery = "" }: VenueListProps) {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchResults, setIsSearchResults] = useState(false);

  // State for the image gallery modal
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [initialImageIndex, setInitialImageIndex] = useState(0);

  useEffect(() => {
    async function fetchVenues() {
      setIsLoading(true);
      setError(null);

      try {
        // Determine which API endpoint to use based on whether there's a search query
        const apiUrl = searchQuery ? `${API_CONFIG.BASE_URL}/holidaze/venues/search?q=${encodeURIComponent(searchQuery)}` : `${API_CONFIG.BASE_URL}/holidaze/venues?sort=created&sortOrder=desc`;

        console.log(`Fetching venues from: ${apiUrl}`);

        const res = await fetch(apiUrl, {
          headers: {
            "X-Noroff-API-Key": API_CONFIG.API_KEY,
          },
          // Use cache: 'no-store' to prevent caching issues
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch venues: ${res.status} ${res.statusText}`);
        }

        const data: ApiResponse = await res.json();

        // Log the media URLs from the first few venues for debugging
        if (data.data.length > 0) {
          console.log("Sample venue media from list:", JSON.stringify(data.data[0].media));
        }

        setVenues(data.data);
        setIsSearchResults(!!searchQuery);

        // Reset display count when search changes
        setDisplayCount(INITIAL_DISPLAY_COUNT);
      } catch (error) {
        console.error("Error fetching venues:", error);
        setError(error instanceof Error ? error.message : "Failed to load venues");
        setVenues([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVenues();
  }, [searchQuery]);

  const handleLoadMore = () => {
    setDisplayCount((prevCount) => prevCount + LOAD_MORE_COUNT);
  };

  // IMPORTANT: This is the second GET request that might be causing issues
  // It navigates to the venue detail page, which triggers another API call
  const handleViewDetails = (venueId: string) => {
    // Add a flag to localStorage to indicate we're coming from the list
    // This can help prevent unnecessary refetching on the detail page
    localStorage.setItem("venueListNavigation", "true");

    // Navigate to the venue detail page
    router.push(`/venues/${venueId}`);
  };

  // Function to open the image gallery
  const openGallery = (venue: Venue, imageIndex = 0) => {
    setSelectedVenue(venue);
    setInitialImageIndex(imageIndex);
    setGalleryOpen(true);
  };

  // Loading skeleton directly in the component
  if (isLoading) {
    return (
      <div>
        {/* Loading message */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="h-5 w-5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            <span className="text-gray-500 ml-2">Loading venues...</span>
          </div>
        </div>

        {/* Venue cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Image skeleton */}
                <div className="h-48 w-full bg-gray-200 animate-pulse"></div>

                {/* Content skeleton */}
                <div className="p-4">
                  <div className="h-6 w-3/4 mb-2 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-4 w-1/2 mb-4 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-24 w-full mb-4 bg-gray-200 animate-pulse rounded"></div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-5 w-24 bg-gray-200 animate-pulse rounded"></div>
                  </div>

                  <div className="h-10 w-full bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        {searchQuery ? (
          <>
            <h2 className="text-xl font-semibold mb-2">No results found</h2>
            <p className="text-gray-600 mb-4">No venues match your search for &quot;{searchQuery}&quot;</p>
            <Button variant="outline" onClick={() => router.push("/")}>
              View all venues
            </Button>
          </>
        ) : (
          <p className="text-gray-600">No venues available at the moment.</p>
        )}
      </div>
    );
  }

  const displayedVenues = venues.slice(0, displayCount);
  const hasMore = displayCount < venues.length;

  return (
    <div className="space-y-8">
      {isSearchResults && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Search results for &quot;{searchQuery}&quot;</h2>
          <p className="text-gray-600">
            Found {venues.length} {venues.length === 1 ? "venue" : "venues"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedVenues.map((venue) => (
          <Card key={venue.id} className="flex flex-col overflow-hidden">
            <CardHeader className="space-y-2 p-4">
              <div className="w-full overflow-hidden">
                <CardTitle className="text-xl line-clamp-2 min-h-[3.5rem] break-words overflow-hidden">{venue.name}</CardTitle>
              </div>
              <CardDescription className="line-clamp-1 overflow-hidden text-ellipsis">
                {venue.location.city}, {venue.location.country}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
              <div className="relative w-full h-48 mb-4 z-0 cursor-pointer overflow-hidden group" onClick={() => openGallery(venue, 0)}>
                <Image
                  src={venue.media[0]?.url || "/placeholder.svg"}
                  alt={venue.media[0]?.alt || venue.name}
                  width={500}
                  height={300}
                  className="rounded-md w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized={true}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
                {venue.media.length > 1 && <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">+{venue.media.length - 1} more</div>}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
              <p className="text-sm line-clamp-3 overflow-hidden">{venue.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 p-4">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">${venue.price}</span>
                  <span className="text-sm text-gray-500">per night</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm">{venue.rating.toFixed(1)}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <Button className="w-full gray-button" variant="outline" onClick={() => handleViewDetails(venue.id)}>
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4 pb-8">
          <Button onClick={handleLoadMore} variant="outline" className="min-w-[200px] gray-button">
            Show More Venues
          </Button>
        </div>
      )}

      {/* Image Gallery Modal */}
      {selectedVenue && <ImageGalleryModal images={selectedVenue.media} initialIndex={initialImageIndex} isOpen={galleryOpen} onClose={() => setGalleryOpen(false)} />}
    </div>
  );
}
