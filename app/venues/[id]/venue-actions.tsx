"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { API_CONFIG } from "@/app/api-config"
import ConfirmationDialog from "@/app/components/confirmation-dialog"

interface VenueActionsProps {
  venueId: string
}

interface UserVenue {
  id: string
  name: string
}

export default function VenueActions({ venueId }: VenueActionsProps) {
  const router = useRouter()
  const [isOwner, setIsOwner] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [venueName, setVenueName] = useState("")

  // Ownership check - optimized to reduce API calls
  useEffect(() => {
    let isMounted = true

    async function checkOwnership() {
      if (!isMounted) return
      setIsLoading(true)
      setIsOwner(null)

      try {
        // Check if user is logged in
        const token = localStorage.getItem("token")
        if (!token) {
          if (isMounted) {
            setIsOwner(false)
            setIsLoading(false)
          }
          return
        }

        // Check if user is a venue manager
        const userData = localStorage.getItem("user")
        if (!userData) {
          if (isMounted) {
            setIsOwner(false)
            setIsLoading(false)
          }
          return
        }

        try {
          const user = JSON.parse(userData)
          if (!user.venueManager) {
            if (isMounted) {
              setIsOwner(false)
              setIsLoading(false)
            }
            return
          }
<<<<<<< HEAD
        } catch {
          // No parameter needed here
=======
        } catch (_) {
>>>>>>> d76b4d3f5962a3b5a12d1683a6ebaf069a391295
          if (isMounted) {
            setIsOwner(false)
            setIsLoading(false)
          }
          return
        }

        // SINGLE API CALL: Fetch the venue with owner information
        // This replaces the multiple calls in the original code
        const venueResponse = await fetch(`${API_CONFIG.BASE_URL}/holidaze/venues/${venueId}?_owner=true`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": API_CONFIG.API_KEY,
          },
          cache: "no-store",
        })

        if (venueResponse.ok) {
          const venueData = await venueResponse.json()

          // Set venue name for UI
          if (venueData.data?.name && isMounted) {
            setVenueName(venueData.data.name)
          }

          // Check ownership by comparing profile data
          const profileData = localStorage.getItem("profile")
          if (profileData && venueData.data?.owner) {
            const profile = JSON.parse(profileData)
            const isOwner = profile.email === venueData.data.owner.email

            if (isMounted) {
              setIsOwner(isOwner)
              setIsLoading(false)
              return
            }
          }
        }

        // If we couldn't determine ownership from the venue data,
        // fall back to checking the user's profile
        if (isMounted) {
          const profileResponse = await fetch(`${API_CONFIG.BASE_URL}/holidaze/profiles/me?_venues=true`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Noroff-API-Key": API_CONFIG.API_KEY,
            },
            cache: "no-store",
          })

          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            const userVenues: UserVenue[] = profileData.data?.venues || []
            const isInVenuesList = userVenues.some((venue: UserVenue) => venue.id === venueId)

            if (isMounted) {
              setIsOwner(isInVenuesList)
              setIsLoading(false)
              return
            }
          }
        }

        // If we get here, we couldn't confirm ownership
        if (isMounted) {
          setIsOwner(false)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error in venue ownership check:", error)
        if (isMounted) {
          setIsOwner(false)
          setIsLoading(false)
        }
      }
    }

    checkOwnership()

    return () => {
      isMounted = false
    }
  }, [venueId])

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const token = localStorage.getItem("token")

      if (!token) {
        toast.error("Authentication required", {
          description: "You must be logged in to delete venues",
        })
        return
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/venues/${venueId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete venue")
      }

      toast.success("Venue deleted successfully", {
        description: "The venue has been permanently removed.",
      })

      router.push("/profile")
    } catch (error) {
      console.error("Error deleting venue:", error)
      toast.error("Failed to delete venue", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Don't render anything until we're certain
  if (isLoading || isOwner === null) {
    return null
  }

  // Only show the action buttons if the user is definitely the owner
  if (!isOwner) {
    return null
  }

  return (
    <div className="flex gap-2 mt-4">
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => router.push(`/venues/${venueId}/edit`)}
      >
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
        <Button
          variant="destructive"
          className="flex items-center gap-2"
          disabled={isDeleting}
          aria-label={`Delete venue: ${venueName || "this venue"}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          {isDeleting ? "Deleting..." : "Delete Venue"}
        </Button>
      </ConfirmationDialog>
    </div>
  )
}

