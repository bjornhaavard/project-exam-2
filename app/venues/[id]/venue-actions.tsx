"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { API_CONFIG } from "@/app/api-config";
import ConfirmationDialog from "@/app/components/confirmation-dialog";

interface VenueActionsProps {
  venueId: string;
}

interface UserVenue {
  id: string;
  name: string;
  // Add other properties if needed, but id is the minimum required
}

export default function VenueActions({ venueId }: VenueActionsProps) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [venueName, setVenueName] = useState("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Ownership check
  useEffect(() => {
    let isMounted = true; // For cleanup

    async function checkOwnership() {
      if (!isMounted) return;

      setDebugInfo("Starting ownership check...");
      setIsLoading(true);
      setIsOwner(null); // Reset to null while checking

      try {
        // 1. Check if user is logged in
        const token = localStorage.getItem("token");
        if (!token) {
          setDebugInfo((prev) => prev + "\nNo token found, not logged in");
          if (isMounted) {
            setIsOwner(false);
            setIsLoading(false);
          }
          return;
        }

        // 2. Get venue name for UI purposes
        try {
          const venueResponse = await fetch(`${API_CONFIG.BASE_URL}/holidaze/venues/${venueId}`, {
            headers: {
              "X-Noroff-API-Key": API_CONFIG.API_KEY,
            },
          });

          if (venueResponse.ok) {
            const venueData = await venueResponse.json();
            if (venueData.data?.name && isMounted) {
              setVenueName(venueData.data.name);
              setDebugInfo((prev) => prev + `\nVenue name: ${venueData.data.name}`);
            }
          }
        } catch (error) {
          setDebugInfo((prev) => prev + `\nError fetching venue name: ${error}`);
          // Continue anyway, this is just for UI
        }

        // 3. Check if user is a venue manager
        const userData = localStorage.getItem("user");
        if (!userData) {
          setDebugInfo((prev) => prev + "\nNo user data found");
          if (isMounted) {
            setIsOwner(false);
            setIsLoading(false);
          }
          return;
        }

        try {
          const user = JSON.parse(userData);
          setDebugInfo((prev) => prev + `\nUser is venue manager: ${user.venueManager}`);

          // If not a venue manager, definitely not the owner
          if (!user.venueManager) {
            if (isMounted) {
              setIsOwner(false);
              setIsLoading(false);
            }
            return;
          }
        } catch (error) {
          setDebugInfo((prev) => prev + `\nError parsing user data: ${error}`);
          if (isMounted) {
            setIsOwner(false);
            setIsLoading(false);
          }
          return;
        }

        // 4. Try to fetch the user's profile with venues
        try {
          setDebugInfo((prev) => prev + `\nFetching user's profile with venues`);

          const profileResponse = await fetch(`${API_CONFIG.BASE_URL}/holidaze/profiles/me?_venues=true`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Noroff-API-Key": API_CONFIG.API_KEY,
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setDebugInfo((prev) => prev + `\nProfile data received: ${JSON.stringify(profileData.data ? { name: profileData.data.name } : "No data")}`);

            // Check if this venue is in the user's venues
            const userVenues: UserVenue[] = profileData.data?.venues || [];

            setDebugInfo((prev) => prev + `\nUser has ${userVenues.length} venues`);
            if (userVenues.length > 0) {
              setDebugInfo((prev) => prev + `\nUser venue IDs: ${userVenues.map((v: UserVenue) => v.id).join(", ")}`);
            }

            const isInVenuesList = userVenues.some((venue: UserVenue) => venue.id === venueId);
            setDebugInfo((prev) => prev + `\nVenue in user's venues list: ${isInVenuesList}`);

            if (isInVenuesList && isMounted) {
              setIsOwner(true);
              setIsLoading(false);
              return;
            }
          } else {
            setDebugInfo((prev) => prev + `\nFailed to fetch profile: ${profileResponse.status}`);
          }
        } catch (error) {
          setDebugInfo((prev) => prev + `\nError fetching profile: ${error}`);
        }

        // 5. If we couldn't verify through the venues list, try a direct check
        try {
          setDebugInfo((prev) => prev + `\nTrying direct venue access check`);

          const directResponse = await fetch(`${API_CONFIG.BASE_URL}/holidaze/venues/${venueId}`, {
            method: "PUT", // Try a PUT request with minimal data to check write access
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "X-Noroff-API-Key": API_CONFIG.API_KEY,
            },
            body: JSON.stringify({ meta: { wifi: true } }), // Minimal data to update
          });

          // If this succeeds, the user has write access to the venue
          const hasWriteAccess = directResponse.ok;
          setDebugInfo((prev) => prev + `\nDirect write access check: ${hasWriteAccess}`);

          if (hasWriteAccess && isMounted) {
            setIsOwner(true);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          setDebugInfo((prev) => prev + `\nError in direct access check: ${error}`);
        }

        // If we get here, we couldn't confirm ownership
        if (isMounted) {
          setIsOwner(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in venue ownership check:", error);
        setDebugInfo((prev) => prev + `\nUnhandled error: ${error}`);
        if (isMounted) {
          setIsOwner(false);
          setIsLoading(false);
        }
      }
    }

    checkOwnership();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [venueId]); // Only depend on venueId

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required", {
          description: "You must be logged in to delete venues",
        });
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/venues/${venueId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete venue");
      }

      toast.success("Venue deleted successfully", {
        description: "The venue has been permanently removed.",
      });

      router.push("/profile");
    } catch (error) {
      console.error("Error deleting venue:", error);
      toast.error("Failed to delete venue", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Don't render anything until we're certain
  if (isLoading || isOwner === null) {
    return null;
  }

  // Only show the action buttons if the user is definitely the owner
  if (!isOwner) {
    return null;
  }

  return (
    <div className="flex gap-2 mt-4">
      <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push(`/venues/${venueId}/edit`)}>
        <Edit className="h-4 w-4" />
        Edit Venue
      </Button>

      <ConfirmationDialog
        title="Delete Venue"
        description={`Are you sure you want to delete "${venueName || "this venue"}"? This action cannot be undone and will remove all bookings associated with this venue.`}
        confirmText="Delete Venue"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
      >
        <Button variant="destructive" className="flex items-center gap-2" disabled={isDeleting} aria-label={`Delete venue: ${venueName || "this venue"}`}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {isDeleting ? "Deleting..." : "Delete Venue"}
        </Button>
      </ConfirmationDialog>

      {/* Debug information */}
      {debugInfo && (
        <div className="fixed bottom-4 right-4 p-2 bg-gray-100 rounded text-xs font-mono text-gray-800 whitespace-pre-wrap max-w-xs max-h-60 overflow-auto z-50 border border-gray-300">
          <p className="font-bold mb-1">Debug Info:</p>
          {debugInfo}
        </div>
      )}
    </div>
  );
}
