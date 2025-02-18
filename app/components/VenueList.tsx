"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Venue {
  id: string
  name: string
  description: string
  media: { url: string }[]
  price: number
  maxGuests: number
  rating: number
  created: string
  updated: string
  meta: {
    wifi: boolean
    parking: boolean
    breakfast: boolean
    pets: boolean
  }
  location: {
    address: string
    city: string
    zip: string
    country: string
    continent: string
    lat: number
    lng: number
  }
}

interface ApiResponse {
  data: Venue[]
  meta: {
    isSuccess: boolean
    count: number
    limit: number
    offset: number
  }
}

const API_BASE_URL = "https://v2.api.noroff.dev"

function getFullImageUrl(relativeUrl: string): string {
  if (relativeUrl.startsWith("http")) {
    return relativeUrl
  }
  return `${API_BASE_URL}${relativeUrl}`
}

export default function VenueList() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)

  useEffect(() => {
    async function fetchVenues() {
      try {
        const res = await fetch(`${API_BASE_URL}/holidaze/venues`)
        if (!res.ok) {
          throw new Error("Failed to fetch venues")
        }
        const data: ApiResponse = await res.json()
        setVenues(data.data)
      } catch (error) {
        console.error("Error fetching venues:", error)
      }
    }

    fetchVenues()
  }, [])

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue)
  }

  if (venues.length === 0) {
    return <div className="text-center text-gray-500">Loading venues...</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <Card key={venue.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">{venue.name}</CardTitle>
              <CardDescription>
                {venue.location.city}, {venue.location.country}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="relative w-full h-48 mb-4">
                <Image
                  src={venue.media[0]?.url ? getFullImageUrl(venue.media[0].url) : "/placeholder.svg"}
                  alt={venue.name}
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg"
                  }}
                />
              </div>
              <p className="text-sm line-clamp-3">{venue.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">${venue.price}</span>
                <span className="text-sm text-gray-500">per night</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm">{venue.rating.toFixed(1)}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-yellow-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </CardFooter>
            <CardFooter>
              <Button onClick={() => handleVenueClick(venue)} className="w-full">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {selectedVenue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">{selectedVenue.name}</h2>
            <p className="mb-4">{selectedVenue.description}</p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <strong>Location:</strong> {selectedVenue.location.city}, {selectedVenue.location.country}
              </div>
              <div>
                <strong>Price:</strong> ${selectedVenue.price} per night
              </div>
              <div>
                <strong>Max Guests:</strong> {selectedVenue.maxGuests}
              </div>
              <div>
                <strong>Rating:</strong> {selectedVenue.rating.toFixed(1)}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setSelectedVenue(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

