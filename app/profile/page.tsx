"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_CONFIG } from "@/app/api-config";

interface User {
  name: string;
  email: string;
  avatar?: { url: string; alt: string };
  banner?: { url: string; alt: string };
  venueManager: boolean;
  venues?: { id: string; name: string; description: string; media?: { url: string; alt: string }[] }[];
  bookings?: {
    id: string;
    dateFrom: string;
    dateTo: string;
    guests: number;
    venue: { name: string; description: string; media?: { url: string; alt: string }[] };
  }[];
  _count?: {
    venues: number;
    bookings: number;
  };
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get token and user data from localStorage
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
          throw new Error("Not authenticated");
        }

        // Parse user data to get the username
        const parsedUserData = JSON.parse(userData);
        const username = parsedUserData.name;

        if (!username) {
          throw new Error("Username not found");
        }

        // Use the correct API URL structure with API key
        const apiUrl = `${API_CONFIG.BASE_URL}/holidaze/profiles/${username}?_bookings=true&_venues=true`;
        console.log("Fetching profile from:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Noroff-API-Key": API_CONFIG.API_KEY,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("API error response:", errorData);
          throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Profile data:", data);

        if (data && data.data) {
          setUser(data.data);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");

        // Only redirect to login if not authenticated
        if (error instanceof Error && error.message === "Not authenticated") {
          router.push("/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Loading your profile...</p>
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
            <button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">
              Try Again
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">No profile data found. </strong>
          <span className="block sm:inline">Please log in again.</span>
          <p className="mt-2">
            <button onClick={() => router.push("/auth/login")} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded text-sm">
              Go to Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Profile content - same as before */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Banner */}
        <div className="relative h-48 bg-gray-200">
          {user.banner ? (
            <Image src={user.banner.url || "/placeholder.svg"} alt={user.banner.alt || "Profile banner"} fill className="object-cover" />
          ) : (
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
          )}
        </div>

        {/* Profile info */}
        <div className="relative px-6 py-8">
          {/* Avatar */}
          <div className="absolute -top-16 left-6">
            <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-gray-300">
              {user.avatar ? (
                <Image src={user.avatar.url || "/placeholder.svg"} alt={user.avatar.alt || "Profile avatar"} width={128} height={128} className="object-cover h-full w-full" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-400 text-white text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</div>
              )}
            </div>
          </div>

          {/* User details */}
          <div className="mt-16">
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${user.venueManager ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                {user.venueManager ? "Venue Manager" : "Guest"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Venues Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">My Venues</h2>
        {user.venues && user.venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.venues.map((venue) => (
              <div key={venue.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-200 relative">
                  {venue.media && venue.media.length > 0 ? (
                    <Image src={venue.media[0].url || "/placeholder.svg"} alt={venue.media[0].alt || venue.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-500">No image available</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold">{venue.name}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-3">{venue.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">You don&apos;t have any venues yet.</p>
            {user.venueManager && (
              <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => router.push("/venues/create")}>
                Create a Venue
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bookings Section */}
      <div className="mt-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
        {user.bookings && user.bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.bookings.map((booking) => (
              <div key={booking.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-200 relative">
                  {booking.venue.media && booking.venue.media.length > 0 ? (
                    <Image src={booking.venue.media[0].url || "/placeholder.svg"} alt={booking.venue.media[0].alt || booking.venue.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-300 text-gray-500">No image available</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold">{booking.venue.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">From:</span> {new Date(booking.dateFrom).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">To:</span> {new Date(booking.dateTo).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Guests:</span> {booking.guests}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-500">You don&apos;t have any bookings yet.</p>
            <button className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => router.push("/")}>
              Browse Venues
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
