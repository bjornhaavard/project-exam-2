"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { API_CONFIG } from "@/app/api-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, Plus, Eye } from "lucide-react";
import ConfirmationDialog from "@/app/components/confirmation-dialog";

interface Venue {
  id: string;
  name: string;
  description: string;
  media?: { url: string; alt: string }[];
  price: number;
  maxGuests: number;
  rating?: number;
  _count?: {
    bookings: number;
  };
}

interface VenueManagementProps {
  venues: Venue[];
  onVenueDeleted: (venueId: string) => void;
}

export default function VenueManagement({ venues, onVenueDeleted }: VenueManagementProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Function to navigate to venue details
  const navigateToVenue = (venueId: string) => {
    router.push(`/venues/${venueId}`);
  };

  // Function to navigate to edit venue page
  const navigateToEditVenue = (venueId: string) => {
    router.push(`/venues/${venueId}/edit`);
  };

  // Function to handle venue deletion
  const handleDeleteVenue = async (venueId: string) => {
    setIsDeleting(venueId);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required", {
          description: "You must be logged in to delete venues",
        });
        setIsDeleting(null);
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

      // Show success message
      toast.success("Venue deleted successfully", {
        description: "The venue has been removed from your profile.",
      });

      // Call the callback to update the parent component
      onVenueDeleted(venueId);
    } catch (error) {
      console.error("Error deleting venue:", error);
      toast.error("Failed to delete venue", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (venues.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">You don&apos;t have any venues yet.</p>
          <Button onClick={() => router.push("/venues/create")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create a Venue
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Venues</h2>
        <Button onClick={() => router.push("/venues/create")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Venue
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <Card key={venue.id} className="overflow-hidden">
            <div className="relative h-48 cursor-pointer" onClick={() => navigateToVenue(venue.id)}>
              {venue.media && venue.media.length > 0 ? (
                <Image src={venue.media[0].url || "/placeholder.svg"} alt={venue.media[0].alt || venue.name} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">No image available</div>
              )}
              {venue._count && venue._count.bookings > 0 && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {venue._count.bookings} {venue._count.bookings === 1 ? "booking" : "bookings"}
                </div>
              )}
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-xl cursor-pointer" onClick={() => navigateToVenue(venue.id)}>
                {venue.name}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-gray-600 line-clamp-2 mb-4">{venue.description}</p>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="font-bold">${venue.price}</span>
                  <span className="text-sm text-gray-500"> / night</span>
                </div>
                <div className="text-sm text-gray-500">Max guests: {venue.maxGuests}</div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigateToVenue(venue.id)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigateToEditVenue(venue.id)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>

                <ConfirmationDialog
                  title="Delete Venue"
                  description={`Are you sure you want to delete "${venue.name}"? This action cannot be undone and will remove all bookings associated with this venue.`}
                  confirmText="Delete"
                  cancelText="Cancel"
                  variant="destructive"
                  onConfirm={() => handleDeleteVenue(venue.id)}
                >
                  <Button variant="destructive" size="sm" className="flex-1" disabled={isDeleting === venue.id} aria-label={`Delete venue: ${venue.name}`}>
                    {isDeleting === venue.id ? (
                      "Deleting..."
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-1" aria-hidden="true" />
                        Delete
                      </>
                    )}
                  </Button>
                </ConfirmationDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
