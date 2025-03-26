"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Venue, CreateVenueData, UpdateVenueData } from "@/app/types/venue";
import { API_CONFIG } from "@/app/api-config";
import { Trash2 } from "lucide-react";

// Schema for venue form validation
const venueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  maxGuests: z.coerce.number().min(1, "Maximum guests must be at least 1"),
  rating: z.coerce.number().min(0).max(5).optional(),

  // Media fields
  mediaUrl1: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  mediaAlt1: z.string().max(120, "Alt text must be less than 120 characters").optional(),
  mediaUrl2: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  mediaAlt2: z.string().max(120, "Alt text must be less than 120 characters").optional(),
  mediaUrl3: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  mediaAlt3: z.string().max(120, "Alt text must be less than 120 characters").optional(),

  // Meta fields
  wifi: z.boolean().default(false),
  parking: z.boolean().default(false),
  breakfast: z.boolean().default(false),
  pets: z.boolean().default(false),

  // Location fields
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  continent: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
});

type VenueFormValues = z.infer<typeof venueSchema>;

interface VenueFormProps {
  venue?: Venue;
  mode: "create" | "edit";
}

export default function VenueForm({ venue, mode }: VenueFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize form with existing venue data if in edit mode
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: venue
      ? {
          name: venue.name,
          description: venue.description,
          price: venue.price,
          maxGuests: venue.maxGuests,
          rating: venue.rating,

          // Media fields - extract from array if available
          mediaUrl1: venue.media?.[0]?.url || "",
          mediaAlt1: venue.media?.[0]?.alt || "",
          mediaUrl2: venue.media?.[1]?.url || "",
          mediaAlt2: venue.media?.[1]?.alt || "",
          mediaUrl3: venue.media?.[2]?.url || "",
          mediaAlt3: venue.media?.[2]?.alt || "",

          // Meta fields
          wifi: venue.meta?.wifi || false,
          parking: venue.meta?.parking || false,
          breakfast: venue.meta?.breakfast || false,
          pets: venue.meta?.pets || false,

          // Location fields
          address: venue.location?.address || "",
          city: venue.location?.city || "",
          zip: venue.location?.zip || "",
          country: venue.location?.country || "",
          continent: venue.location?.continent || "",
          lat: venue.location?.lat || 0,
          lng: venue.location?.lng || 0,
        }
      : {
          name: "",
          description: "",
          price: 0,
          maxGuests: 1,
          rating: 0,

          // Media fields
          mediaUrl1: "",
          mediaAlt1: "",
          mediaUrl2: "",
          mediaAlt2: "",
          mediaUrl3: "",
          mediaAlt3: "",

          // Meta fields
          wifi: false,
          parking: false,
          breakfast: false,
          pets: false,

          // Location fields
          address: "",
          city: "",
          zip: "",
          country: "",
          continent: "",
          lat: 0,
          lng: 0,
        },
  });

  // Function to ensure URL is in the correct Unsplash format
  const formatUnsplashUrl = (url: string): string => {
    if (!url) return "";

    // If it's already an Unsplash URL with parameters, return as is
    if (url.includes("images.unsplash.com") && url.includes("crop=entropy")) {
      return url;
    }

    // If it's an Unsplash URL without parameters, add them
    if (url.includes("images.unsplash.com") && !url.includes("?")) {
      return `${url}?crop=entropy&fit=crop&h=900&q=80&w=1600`;
    }

    // If it's an Unsplash photo ID only
    if (url.match(/^[a-zA-Z0-9_-]+$/) && url.length > 10) {
      return `https://images.unsplash.com/photo-${url}?crop=entropy&fit=crop&h=900&q=80&w=1600`;
    }

    // Otherwise return as is (though it might not work)
    return url;
  };

  // Function to prepare form data for API
  const prepareFormData = (data: VenueFormValues): CreateVenueData | UpdateVenueData => {
    // Create an empty media array
    const media = [];

    // Only add media items with non-empty URLs
    if (data.mediaUrl1 && data.mediaUrl1.trim() !== "") {
      const formattedUrl = formatUnsplashUrl(data.mediaUrl1.trim());
      media.push({
        url: formattedUrl,
        alt: data.mediaAlt1 || data.name,
      });
      console.log("Added image 1:", formattedUrl);
    }

    if (data.mediaUrl2 && data.mediaUrl2.trim() !== "") {
      const formattedUrl = formatUnsplashUrl(data.mediaUrl2.trim());
      media.push({
        url: formattedUrl,
        alt: data.mediaAlt2 || data.name,
      });
      console.log("Added image 2:", formattedUrl);
    }

    if (data.mediaUrl3 && data.mediaUrl3.trim() !== "") {
      const formattedUrl = formatUnsplashUrl(data.mediaUrl3.trim());
      media.push({
        url: formattedUrl,
        alt: data.mediaAlt3 || data.name,
      });
      console.log("Added image 3:", formattedUrl);
    }

    // Log the media array for debugging
    console.log("Media array being sent:", JSON.stringify(media));

    // Return the formatted data
    return {
      name: data.name,
      description: data.description,
      media: media, // Always include the media array, even if empty
      price: data.price,
      maxGuests: data.maxGuests,
      rating: data.rating,
      meta: {
        wifi: data.wifi,
        parking: data.parking,
        breakfast: data.breakfast,
        pets: data.pets,
      },
      location: {
        address: data.address || "",
        city: data.city || "",
        zip: data.zip || "",
        country: data.country || "",
        continent: data.continent || "",
        lat: data.lat || 0,
        lng: data.lng || 0,
      },
    };
  };

  // Handle form submission
  async function onSubmit(data: VenueFormValues) {
    setIsLoading(true);
    console.log("Form submitted with values:", data);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required", {
          description: "You must be logged in to manage venues",
        });
        router.push("/auth/login");
        return;
      }

      const formattedData = prepareFormData(data);
      console.log("SENDING REQUEST:", JSON.stringify(formattedData));

      // Determine API endpoint and method based on mode
      const endpoint = mode === "create" ? `${API_CONFIG.BASE_URL}/holidaze/venues` : `${API_CONFIG.BASE_URL}/holidaze/venues/${venue?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

      console.log(`Making ${method} request to ${endpoint}`);

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
        },
        body: JSON.stringify(formattedData),
      });

      // Get the raw response text first for debugging
      const responseText = await response.text();
      console.log("Raw API response:", responseText);

      // Parse the response text back to JSON
      const responseData = responseText ? JSON.parse(responseText) : {};
      console.log("RECEIVED RESPONSE:", JSON.stringify(responseData));

      if (!response.ok) {
        throw new Error(responseData.errors?.[0]?.message || `Failed to ${mode} venue`);
      }

      // Check if the API changed our image URLs
      if (responseData.data && responseData.data.media && Array.isArray(responseData.data.media)) {
        console.log("API RESPONSE MEDIA:");
        responseData.data.media.forEach((item: { url?: string; alt?: string }, index: number) => {
          console.log(`Image ${index + 1}:`, item.url || "No URL");
          if (formattedData.media && Array.isArray(formattedData.media) && formattedData.media[index]) {
            const originalUrl = formattedData.media[index].url;
            const responseUrl = item.url || "";
            console.log(`Original: ${originalUrl}`);
            console.log(`Response: ${responseUrl}`);
            console.log(`MATCH: ${originalUrl === responseUrl}`);

            if (originalUrl !== responseUrl) {
              console.log("WARNING: API changed the image URL!");
            }
          }
        });
      }

      // Show success notification
      toast.success(mode === "create" ? "Venue created successfully!" : "Venue updated successfully!", {
        description: mode === "create" ? "Your new venue has been created and is now available for bookings." : "Your venue has been updated successfully.",
      });

      // Redirect to venue page or profile
      if (mode === "create") {
        router.push(`/venues/${responseData.data.id}`);
      } else {
        router.push("/profile");
      }
    } catch (error) {
      console.error("Error submitting venue:", error);
      toast.error(mode === "create" ? "Failed to create venue" : "Failed to update venue", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle venue deletion
  async function handleDeleteVenue() {
    if (!venue?.id) return;

    if (!confirm("Are you sure you want to delete this venue? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required", {
          description: "You must be logged in to delete venues",
        });
        router.push("/auth/login");
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/venues/${venue.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.errors?.[0]?.message || "Failed to delete venue");
      }

      // Show success notification
      toast.success("Venue deleted successfully", {
        description: "The venue has been permanently removed.",
      });

      // Redirect to profile
      router.push("/profile");
    } catch (error) {
      toast.error("Failed to delete venue", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  // Log if the venue already has media when editing
  if (mode === "edit" && venue?.media) {
    console.log("Original venue media:", JSON.stringify(venue.media));
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create a New Venue" : "Edit Venue"}</CardTitle>
        <CardDescription>{mode === "create" ? "Fill out the form below to create a new venue for guests to book." : "Update your venue's information below."}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Beach House Getaway" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your venue in detail..." className="min-h-32" {...field} />
                    </FormControl>
                    <FormDescription>Provide a detailed description of your venue, including amenities and special features.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Night (USD)*</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Guests*</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (0-5)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="5" step="0.1" {...field} />
                    </FormControl>
                    <FormDescription>Optional: Set an initial rating for your venue.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Media</h3>
              <p className="text-sm text-gray-500">Add up to 3 images of your venue. Use direct image URLs (ending with .jpg, .png, etc).</p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name="mediaUrl1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL 1</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="mediaAlt1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alt Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Description of image" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name="mediaUrl2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL 2</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="mediaAlt2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alt Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Description of image" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name="mediaUrl3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL 3</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="mediaAlt3"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alt Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Description of image" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800">Image Tips:</h4>
                <ul className="list-disc ml-5 mt-2 text-sm text-blue-700">
                  <li>The API appears to only accept certain Unsplash images</li>
                  <li>Try using this exact format: https://images.unsplash.com/photo-ID?parameters</li>
                  <li>Example: {`https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4?crop=entropy&fit=crop&h=900&q=80&w=1600`}</li>
                  <li>You can try other Unsplash photo IDs but keep the same parameters</li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Amenities</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="wifi"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">WiFi</FormLabel>
                        <FormDescription>Venue has WiFi available for guests</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parking"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Parking</FormLabel>
                        <FormDescription>Parking is available at the venue</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="breakfast"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Breakfast</FormLabel>
                        <FormDescription>Breakfast is included with the stay</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pets"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Pets Allowed</FormLabel>
                        <FormDescription>Guests can bring pets to this venue</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium">Location</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Beach Road" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Miami" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP/Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="33101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="continent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Continent</FormLabel>
                      <FormControl>
                        <Input placeholder="North America" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" placeholder="25.7617" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.000001" placeholder="-80.1918" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {mode === "edit" && (
                <Button type="button" variant="destructive" onClick={handleDeleteVenue} disabled={isDeleting || isLoading} className="sm:order-1">
                  {isDeleting ? "Deleting..." : "Delete Venue"}
                  <Trash2 className="ml-2 h-4 w-4" />
                </Button>
              )}

              <Button type="submit" disabled={isLoading || isDeleting} className="sm:flex-1">
                {isLoading ? (mode === "create" ? "Creating..." : "Updating...") : mode === "create" ? "Create Venue" : "Update Venue"}
              </Button>

              <Button type="button" variant="outline" onClick={() => router.push("/profile")} disabled={isLoading || isDeleting}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
