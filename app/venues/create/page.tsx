"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VenueForm from "@/app/components/venue-form";
import { toast } from "sonner";
import { API_CONFIG } from "@/app/api-config";

export default function CreateVenuePage() {
  const router = useRouter();
  const [isVenueManager, setIsVenueManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    async function checkVenueManagerStatus() {
      setDebugInfo("Starting venue manager check...");

      // Check if user is logged in
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      setDebugInfo((prev) => prev + `\nToken exists: ${!!token}`);
      setDebugInfo((prev) => prev + `\nUser data exists: ${!!userData}`);

      if (!userData || !token) {
        toast.error("Authentication required", {
          description: "You must be logged in to create venues",
        });
        router.push("/auth/login");
        return;
      }

      try {
        // First check localStorage
        const user = JSON.parse(userData);
        setDebugInfo((prev) => prev + `\nUser data from localStorage: ${JSON.stringify(user, null, 2)}`);
        setDebugInfo((prev) => prev + `\nVenue manager status from localStorage: ${user.venueManager}`);

        // Then verify with API to get the most accurate status
        setDebugInfo((prev) => prev + `\nFetching profile from API to verify venue manager status...`);

        const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/profiles/${user.name}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": API_CONFIG.API_KEY,
          },
        });

        if (!response.ok) {
          setDebugInfo((prev) => prev + `\nAPI profile fetch failed: ${response.status}`);

          // If API call fails, fall back to localStorage value
          if (!user.venueManager) {
            toast.error("Access denied", {
              description: "Only venue managers can create venues",
            });
            router.push("/profile");
            return;
          }
        } else {
          const profileData = await response.json();
          setDebugInfo((prev) => prev + `\nAPI profile data: ${JSON.stringify(profileData.data, null, 2)}`);

          // Use the venue manager status from the API
          const apiVenueManager = profileData.data.venueManager;
          setDebugInfo((prev) => prev + `\nVenue manager status from API: ${apiVenueManager}`);

          // Update localStorage if needed
          if (user.venueManager !== apiVenueManager) {
            setDebugInfo((prev) => prev + `\nUpdating localStorage with correct venue manager status`);
            user.venueManager = apiVenueManager;
            localStorage.setItem("user", JSON.stringify(user));
          }

          if (!apiVenueManager) {
            toast.error("Access denied", {
              description: "Only venue managers can create venues",
            });
            router.push("/profile");
            return;
          }
        }

        setIsVenueManager(true);
        setDebugInfo((prev) => prev + `\nVenue manager check passed!`);
      } catch (error) {
        console.error("Error checking venue manager status:", error);
        setDebugInfo((prev) => prev + `\nError: ${error instanceof Error ? error.message : "Unknown error"}`);

        toast.error("Authentication error", {
          description: "Please log in again",
        });
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    }

    checkVenueManagerStatus();
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isVenueManager) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <VenueForm mode="create" />

      {/* Debug information */}
      {debugInfo && (
        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h3 className="text-sm font-semibold mb-2">Debug Information</h3>
          <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-60">{debugInfo}</pre>
        </div>
      )}
    </div>
  );
}
