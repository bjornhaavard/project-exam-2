"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { API_CONFIG } from "@/app/api-config";
import type { Venue } from "@/app/types/venue";
import type { JSX } from "react/jsx-runtime";

interface VerifyVenueMediaProps {
  venueId: string;
}

interface ApiResponse {
  data: Venue;
  meta: {
    isSuccess: boolean;
  };
}

// Add this helper function to check if an image URL is likely to be a default image
const isLikelyDefaultImage = (url: string): boolean => {
  if (!url) return false;

  const defaultImagePatterns = ["placeholder", "default", "no-image", "noimage", "unsplash.com"];

  return defaultImagePatterns.some((pattern) => url.toLowerCase().includes(pattern));
};

// Add this function to suggest valid image URLs
const suggestValidImageUrls = (): JSX.Element => {
  return (
    <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
      <h4 className="font-bold">Suggested Image Sources:</h4>
      <ul className="list-disc ml-5 mt-2 text-sm">
        <li>Use images from Imgur (https://imgur.com)</li>
        <li>Use images from Cloudinary (https://cloudinary.com)</li>
        <li>Choose your own Unsplash images (https://unsplash.com)</li>
        <li>Make sure image URLs end with .jpg, .png, .webp, or .gif</li>
        <li>Ensure images are publicly accessible</li>
      </ul>
    </div>
  );
};

// Add a more detailed image validation section to help troubleshoot

// Add this function to test image loading
const testImageLoading = (url: string): JSX.Element => {
  return (
    <div className="mt-4 p-3 bg-gray-50 border rounded">
      <h4 className="font-bold">Image Load Test:</h4>
      <div className="mt-2 flex flex-col gap-2">
        <div>
          <p className="text-sm mb-1">1. Direct image tag:</p>
          <img
            src={url || "/placeholder.svg"}
            alt="Test image"
            className="h-24 w-auto object-cover rounded border"
            onLoad={() => console.log("Image loaded successfully via img tag:", url)}
            onError={(e) => {
              console.error("Image failed to load via img tag:", url);
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
              target.style.border = "1px solid red";
            }}
          />
        </div>
        <div>
          <p className="text-sm mb-1">2. Next.js Image component (would be in actual venue):</p>
          <div className="h-24 w-48 relative">
            <img
              src={url || "/placeholder.svg"}
              alt="Test image"
              className="h-full w-full object-cover rounded border"
              onLoad={() => console.log("Image loaded successfully via direct img:", url)}
              onError={(e) => {
                console.error("Image failed to load via direct img:", url);
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
                target.style.border = "1px solid red";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VerifyVenueMedia({ venueId }: VerifyVenueMediaProps) {
  const [venueData, setVenueData] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [defaultImageDetected, setDefaultImageDetected] = useState(false);

  // Common default image patterns to check for
  const defaultImagePatterns = ["placeholder", "default", "no-image", "noimage", "unsplash.com"];

  useEffect(() => {
    async function fetchVenueData() {
      try {
        setLoading(true);
        const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/venues/${venueId}`, {
          headers: {
            "X-Noroff-API-Key": API_CONFIG.API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch venue: ${response.status}`);
        }

        // Store the raw response text for debugging
        const responseText = await response.text();
        setRawResponse(responseText);

        // Parse the response
        const data: ApiResponse = JSON.parse(responseText);
        setVenueData(data.data);

        // Check if any media URLs match default image patterns
        if (data.data.media && data.data.media.length > 0) {
          const hasDefaultImage = data.data.media.some((item) => defaultImagePatterns.some((pattern) => item.url?.toLowerCase().includes(pattern)));
          setDefaultImageDetected(hasDefaultImage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch venue data");
      } finally {
        setLoading(false);
      }
    }

    if (venueId) {
      fetchVenueData();
    }
  }, [venueId]);

  if (loading) {
    return <div>Verifying venue media...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!venueData) {
    return <div>No venue data found</div>;
  }

  const hasMedia = venueData.media && venueData.media.length > 0;

  return (
    <div className="p-4 border rounded-md mt-4">
      <h3 className="font-bold mb-2">Venue Media Verification</h3>
      <div>
        <p>Venue ID: {venueData.id}</p>
        <p>Media Count: {hasMedia ? venueData.media.length : 0}</p>

        {defaultImageDetected && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 my-2">
            <p className="font-bold">⚠️ Default Image Detected</p>
            <p className="text-sm">One or more images appear to be default/placeholder images.</p>
          </div>
        )}

        {hasMedia ? (
          <div>
            <p className="text-green-600">✓ Media is present in the venue data</p>
            <div className="mt-2">
              {venueData.media.map((item, index) => {
                const isLikelyDefault = defaultImagePatterns.some((pattern) => item.url?.toLowerCase().includes(pattern));

                return (
                  <div key={index} className={`text-sm mb-4 p-2 rounded ${isLikelyDefault ? "bg-yellow-50" : ""}`}>
                    <div className="flex items-center">
                      <span className="font-bold mr-2">{index + 1}.</span>
                      {isLikelyDefault && <span className="text-yellow-600 text-xs mr-2">⚠️ Possible default image</span>}
                    </div>
                    <div className="mt-1">
                      <strong>URL:</strong> <span className="break-all">{item.url}</span>
                    </div>
                    <div>
                      <strong>Alt:</strong> {item.alt || "No alt text"}
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Image preview:</p>
                      <img
                        src={item.url || "/placeholder.svg"}
                        alt={item.alt || "Venue image"}
                        className="h-24 w-auto object-cover rounded border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                          target.style.border = "1px solid red";
                          target.title = "Failed to load image";
                        }}
                      />
                    </div>

                    {/* Add the image test for each item */}
                    {testImageLoading(item.url)}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-red-600">✗ No media found for this venue</p>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
        <h4 className="font-bold">Troubleshooting Tips:</h4>
        <ul className="list-disc ml-5 mt-2 text-sm">
          <li>Try using direct Unsplash URLs (e.g., https://images.unsplash.com/photo-xxx)</li>
          <li>Try using Imgur URLs (e.g., https://i.imgur.com/xxxxx.jpg)</li>
          <li>Check browser console for any CORS or loading errors</li>
          <li>Ensure image URLs are publicly accessible without authentication</li>
          <li>Try using smaller image files (under 1MB)</li>
        </ul>
      </div>

      <div className="mt-4 space-y-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Data
        </Button>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500">Raw API Response</summary>
          <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto max-h-60 rounded">{rawResponse}</pre>
        </details>
      </div>
    </div>
  );
}
