"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VenueForm from "@/app/components/venue-form";
import { toast } from "sonner";
import { API_CONFIG } from "@/app/api-config";

/**
 * CreateVenuePage component
 *
 * This component handles the venue creation page, including:
 * - Authentication checks
 * - Venue manager permission verification
 * - Rendering the venue creation form
 *
 * @returns {React.JSX.Element | null} The venue creation page or loading state
 */
export default function CreateVenuePage() {
  const router = useRouter();
  /**
   * State to track if the user has venue manager permissions
   */
  const [isVenueManager, setIsVenueManager] = useState(false);
  /**
   * State to track loading status during permission checks
   */
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Verifies if the current user has venue manager permissions
     *
     * This function:
     * 1. Checks if the user is logged in
     * 2. Verifies venue manager status from localStorage
     * 3. Validates the status with the API
     * 4. Updates localStorage if needed
     * 5. Redirects unauthorized users
     *
     * @async
     * @returns {Promise<void>}
     */
    async function checkVenueManagerStatus() {
      // Check if user is logged in
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");

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

        // Then verify with API to get the most accurate status
        const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/profiles/${user.name}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": API_CONFIG.API_KEY,
          },
        });

        if (!response.ok) {
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

          // Use the venue manager status from the API
          const apiVenueManager = profileData.data.venueManager;

          // Update localStorage if needed
          if (user.venueManager !== apiVenueManager) {
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
      } catch {
        // Removed the unused error parameter
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

  /**
   * Render loading spinner while checking permissions
   */
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

  /**
   * Return null if user is not a venue manager
   * The useEffect will handle redirection
   */
  if (!isVenueManager) {
    return null; // Will redirect in useEffect
  }

  /**
   * Render the venue creation form for authorized users
   */
  return (
    <div className="container mx-auto px-4 py-8">
      <VenueForm mode="create" />
    </div>
  );
}
