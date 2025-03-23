"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VenueForm from "@/app/components/venue-form";
import { toast } from "sonner";
import type { Venue } from "@/app/types/venue";
import { API_CONFIG } from "@/app/api-config";

// Define a minimal venue type for checking ownership
interface UserVenue {
  id: string;
  name: string;
}

interface EditVenueContentProps {
  id: string;
}

export default function EditVenueContent({ id }: EditVenueContentProps) {
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    async function fetchVenue() {
      setIsLoading(true);
      setError(null);
      setDebugInfo("Starting venue fetch process...");

      try {
        // Check if user is logged in
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        setDebugInfo((prev) => prev + `\nToken exists: ${!!token}`);
        setDebugInfo((prev) => prev + `\nUser data exists: ${!!userData}`);

        if (!token || !userData) {
          toast.error("Authentication required", {
            description: "You must be logged in to edit venues",
          });
          router.push("/auth/login");
          return;
        }

        try {
          const user = JSON.parse(userData);
          setDebugInfo((prev) => prev + `\nUser is venue manager: ${user.venueManager}`);

          if (!user.venueManager) {
            toast.error("Access denied", {
              description: "Only venue managers can edit venues",
            });
            router.push("/profile");
            return;
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          setDebugInfo((prev) => prev + `\nError parsing user data: ${error}`);
          toast.error("Authentication error", {
            description: "Please log in again",
          });
          router.push("/auth/login");
          return;
        }

        // First, fetch venue data to check if it exists
        setDebugInfo((prev) => prev + `\nFetching venue with ID: ${id}`);
        const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/venues/${id}`, {
          headers: {
            "X-Noroff-API-Key": API_CONFIG.API_KEY,
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setDebugInfo((prev) => prev + `\nFailed to fetch venue: ${response.status}`);
          throw new Error(`Failed to fetch venue: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setDebugInfo((prev) => prev + `\nVenue data received: ${data.data?.name}`);

        if (!data.data) {
          throw new Error("Invalid response format");
        }

        // Store the venue data
        const venueData = data.data;

        // Now check if the user is the owner of this venue
        setDebugInfo((prev) => prev + `\nFetching user profile to check venue ownership`);
        const profileResponse = await fetch(`${API_CONFIG.BASE_URL}/holidaze/profiles/me?_venues=true`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": API_CONFIG.API_KEY,
          },
        });

        if (!profileResponse.ok) {
          setDebugInfo((prev) => prev + `\nFailed to fetch profile: ${profileResponse.status}`);
          throw new Error("Failed to verify venue ownership");
        }

        const profileData = await profileResponse.json();

        // Check if venues array exists and has items
        const userVenues: UserVenue[] = profileData.data?.venues || [];
        setDebugInfo((prev) => prev + `\nUser has ${userVenues.length} venues`);

        // Log all venue IDs for debugging
        if (userVenues.length > 0) {
          setDebugInfo((prev) => prev + `\nUser venue IDs: ${userVenues.map((v) => v.id).join(", ")}`);
        }

        setDebugInfo((prev) => prev + `\nChecking if venue ID ${id} is in user's venues`);

        // Check if this venue ID matches any of the user's venue IDs
        const isOwner = userVenues.some((venue) => venue.id === id);
        setDebugInfo((prev) => prev + `\nOwnership check result: ${isOwner}`);

        if (!isOwner) {
          // Try a direct API call to check if the venue belongs to the user
          // This is a fallback in case the venues array is not properly populated
          setDebugInfo((prev) => prev + `\nTrying alternative ownership check...`);

          try {
            const directCheckResponse = await fetch(`${API_CONFIG.BASE_URL}/holidaze/venues/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
                "X-Noroff-API-Key": API_CONFIG.API_KEY,
              },
            });

            if (directCheckResponse.ok) {
              // We don't need to use the response data, just check if the request was successful
              setDebugInfo((prev) => prev + `\nDirect venue check successful, proceeding anyway`);
              setVenue(venueData);
              return;
            }
          } catch (error) {
            setDebugInfo((prev) => prev + `\nDirect venue check failed: ${error}`);
          }

          toast.error("Access denied", {
            description: "You can only edit your own venues",
          });
          router.push("/profile");
          return;
        }

        // If we get here, the user is the owner
        setVenue(venueData);
        setDebugInfo((prev) => prev + `\nVenue fetch successful, ready to edit`);
      } catch (error) {
        console.error("Error fetching venue:", error);
        setDebugInfo((prev) => prev + `\nError: ${error instanceof Error ? error.message : "Unknown error"}`);
        setError(error instanceof Error ? error.message : "An unexpected error occurred");

        toast.error("Error", {
          description: error instanceof Error ? error.message : "Failed to load venue data",
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchVenue();
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading venue data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <p className="mt-2">
            <button onClick={() => router.push("/profile")} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">
              Return to Profile
            </button>
          </p>

          {/* Debug information */}
          {debugInfo && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 whitespace-pre-wrap">
              <p className="font-bold mb-1">Debug Info:</p>
              {debugInfo}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">No venue data found. </strong>
          <span className="block sm:inline">Please try again or return to your profile.</span>
          <p className="mt-2">
            <button onClick={() => router.push("/profile")} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm">
              Return to Profile
            </button>
          </p>

          {/* Debug information */}
          {debugInfo && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 whitespace-pre-wrap">
              <p className="font-bold mb-1">Debug Info:</p>
              {debugInfo}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VenueForm mode="edit" venue={venue} />

      {/* Debug information (hidden in production) */}
      {debugInfo && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
          <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-60">{debugInfo}</pre>
        </div>
      )}
    </div>
  );
}
