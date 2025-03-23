"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_CONFIG } from "@/app/api-config";

// Define a proper interface for user data
interface UserData {
  name: string;
  email: string;
  venueManager: boolean;
  avatar?: {
    url: string;
    alt: string;
  };
  banner?: {
    url: string;
    alt: string;
  };
}

// Define interface for API profile response
interface ApiProfileData {
  name: string;
  email: string;
  venueManager: boolean;
  avatar?: {
    url: string;
    alt: string;
  };
  banner?: {
    url: string;
    alt: string;
  };
  bio?: string;
  _count?: {
    venues: number;
    bookings: number;
  };
  [key: string]: unknown; // Allow for additional properties
}

export default function DebugProfile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [apiProfile, setApiProfile] = useState<ApiProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem("user");
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData) as UserData);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fetchProfileFromApi = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const token = localStorage.getItem("token");
      if (!token || !userData) {
        setStatusMessage("No token or user data found");
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/profiles/${userData.name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setApiProfile(data.data as ApiProfileData);
        setStatusMessage("Profile fetched successfully");
      } else {
        setStatusMessage(`Failed to fetch profile: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setStatusMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fixVenueManagerStatus = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const token = localStorage.getItem("token");
      if (!token || !userData) {
        setStatusMessage("No token or user data found");
        return;
      }

      // Fetch the latest profile data
      const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/profiles/${userData.name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
        },
      });

      if (!response.ok) {
        setStatusMessage(`Failed to fetch profile: ${response.status}`);
        return;
      }

      const data = await response.json();
      const apiVenueManager = data.data.venueManager;

      // Update localStorage with the correct venue manager status
      const updatedUserData = {
        ...userData,
        venueManager: apiVenueManager,
      };

      localStorage.setItem("user", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setApiProfile(data.data as ApiProfileData);

      setStatusMessage(`Venue manager status updated to: ${apiVenueManager}`);
    } catch (error) {
      console.error("Error fixing venue manager status:", error);
      setStatusMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={() => setShowDebug(!showDebug)} className="bg-gray-800 text-white hover:bg-gray-700">
        {showDebug ? "Hide Debug" : "Show Debug"}
      </Button>

      {showDebug && (
        <Card className="mt-2 w-96 bg-gray-800 text-white border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm">Profile Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <div className="space-y-2">
              <div>
                <span className="font-bold">Name:</span> {userData.name}
              </div>
              <div>
                <span className="font-bold">Email:</span> {userData.email}
              </div>
              <div>
                <span className="font-bold">Venue Manager (localStorage):</span>{" "}
                <span className={userData.venueManager ? "text-green-400" : "text-red-400"}>{userData.venueManager ? "Yes" : "No"}</span>
              </div>

              {apiProfile && (
                <div className="mt-4 border-t border-gray-700 pt-2">
                  <h4 className="font-bold mb-1">API Profile Data:</h4>
                  <div>
                    <span className="font-bold">Venue Manager (API):</span>{" "}
                    <span className={apiProfile.venueManager ? "text-green-400" : "text-red-400"}>{apiProfile.venueManager ? "Yes" : "No"}</span>
                  </div>
                  <pre className="mt-2 overflow-auto max-h-40 bg-gray-900 p-2 rounded text-green-300">{JSON.stringify(apiProfile, null, 2)}</pre>
                </div>
              )}

              {statusMessage && (
                <div className="mt-2 p-2 bg-gray-700 rounded">
                  <p>{statusMessage}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={fetchProfileFromApi} disabled={isLoading}>
                  {isLoading ? "Loading..." : "Fetch API Profile"}
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Clear Storage & Reload
                </Button>
              </div>

              <Button size="sm" variant="default" className="w-full bg-green-600 hover:bg-green-700" onClick={fixVenueManagerStatus} disabled={isLoading}>
                Fix Venue Manager Status
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
