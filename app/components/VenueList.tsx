"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function VenueList() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVenues() {
      try {
        const res = await fetch("https://v2.api.noroff.dev/holidaze/venues");
        if (!res.ok) {
          throw new Error("Failed to fetch venues");
        }
        const data: ApiResponse = await res.json();
        setVenues(data.data);
      } catch (error) {
        console.error("Error fetching venues:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVenues();
  }, []);

  const handleLoadMore = () => {
    setDisplayCount((prevCount) => prevCount + LOAD_MORE_COUNT);
  };

  const handleViewDetails = (venueId: string) => {
    router.push(`/venues/${venueId}`);
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading venues...</div>;
  }

  const displayedVenues = venues.slice(0, displayCount);
  const hasMore = displayCount < venues.length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedVenues.map((venue) => (
          <Card key={venue.id} className="flex flex-col">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl line-clamp-2 min-h-[3.5rem]">{venue.name}</CardTitle>
              <CardDescription className="line-clamp-1">
                {venue.location.city}, {venue.location.country}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="relative w-full h-48 mb-4 z-0">
                <Image
                  src={venue.media[0]?.url || "/placeholder.svg"}
                  alt={venue.media[0]?.alt || venue.name}
                  width={500}
                  height={300}
                  className="rounded-md w-full h-48 object-cover"
                  unoptimized
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </div>
              <p className="text-sm line-clamp-3">{venue.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
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
    </div>
  );
}
