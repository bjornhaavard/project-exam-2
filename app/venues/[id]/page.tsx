import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, Car, Coffee, Dog } from "lucide-react";

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
  data: Venue;
  meta: {
    isSuccess: boolean;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getVenue(id: string): Promise<Venue> {
  const res = await fetch(`https://v2.api.noroff.dev/holidaze/venues/${id}`);

  if (!res.ok) {
    notFound();
  }

  const data: ApiResponse = await res.json();
  return data.data;
}

export default async function VenuePage({ params }: PageProps) {
  // Await the params object before accessing its properties
  const { id } = await params;
  const venue = await getVenue(id);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">{venue.name}</CardTitle>
          <CardDescription className="text-lg">
            {venue.location.address}, {venue.location.city}, {venue.location.country}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Image */}
          <div className="relative w-full h-[400px]">
            <Image src={venue.media[0]?.url || "/placeholder.svg"} alt={venue.media[0]?.alt || venue.name} fill className="rounded-lg object-cover" unoptimized />
          </div>

          {/* Additional Images */}
          {venue.media.length > 1 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {venue.media.slice(1).map((image, index) => (
                <div key={index} className="relative h-24">
                  <Image src={image.url || "/placeholder.svg"} alt={image.alt || `${venue.name} image ${index + 2}`} fill className="rounded-md object-cover" unoptimized />
                </div>
              ))}
            </div>
          )}

          {/* Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">About this venue</h2>
              <p className="text-gray-600">{venue.description}</p>

              <div className="space-y-2">
                <h3 className="font-semibold">Amenities</h3>
                <div className="flex gap-4">
                  {venue.meta.wifi && (
                    <div className="flex items-center gap-1">
                      <Wifi className="h-5 w-5" />
                      <span>WiFi</span>
                    </div>
                  )}
                  {venue.meta.parking && (
                    <div className="flex items-center gap-1">
                      <Car className="h-5 w-5" />
                      <span>Parking</span>
                    </div>
                  )}
                  {venue.meta.breakfast && (
                    <div className="flex items-center gap-1">
                      <Coffee className="h-5 w-5" />
                      <span>Breakfast</span>
                    </div>
                  )}
                  {venue.meta.pets && (
                    <div className="flex items-center gap-1">
                      <Dog className="h-5 w-5" />
                      <span>Pets allowed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-3xl font-bold mb-2">${venue.price}</div>
                <p className="text-gray-600">per night</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Max guests</span>
                    <span>{venue.maxGuests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating</span>
                    <div className="flex items-center">
                      {venue.rating.toFixed(1)}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500 ml-1">
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {venue._count && (
                    <div className="flex justify-between">
                      <span>Total bookings</span>
                      <span>{venue._count.bookings}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
