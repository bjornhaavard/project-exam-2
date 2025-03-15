"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { API_CONFIG } from "@/app/api-config";

interface UserData {
  name: string;
  email: string;
  avatar?: {
    url: string;
    alt: string;
  };
  banner?: {
    url: string;
    alt: string;
  };
  venueManager: boolean;
}

const EditProfileImages = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarAlt, setAvatarAlt] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerAlt, setBannerAlt] = useState("");

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Initialize form with existing data
      if (parsedUser.avatar) {
        setAvatarUrl(parsedUser.avatar.url || "");
        setAvatarAlt(parsedUser.avatar.alt || "");
      }

      if (parsedUser.banner) {
        setBannerUrl(parsedUser.banner.url || "");
        setBannerAlt(parsedUser.banner.alt || "");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error parsing user data:", error);
      setError("Failed to load user data");
      setLoading(false);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token");

    if (!token || !user) {
      setError("You must be logged in to update your profile");
      setUpdating(false);
      return;
    }

    // Prepare update data
    const updateData: {
      avatar?: { url: string; alt: string };
      banner?: { url: string; alt: string };
    } = {};

    // Only include avatar if URL is provided
    if (avatarUrl.trim()) {
      updateData.avatar = {
        url: avatarUrl.trim(),
        alt: avatarAlt.trim() || `${user.name}'s avatar`,
      };
    }

    // Only include banner if URL is provided
    if (bannerUrl.trim()) {
      updateData.banner = {
        url: bannerUrl.trim(),
        alt: bannerAlt.trim() || `${user.name}'s banner`,
      };
    }

    // Don't make API call if no updates
    if (!updateData.avatar && !updateData.banner) {
      setError("Please provide at least one image URL");
      setUpdating(false);
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/profiles/${user.name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || "Failed to update profile");
      }

      // Update localStorage with new user data
      const updatedUser = {
        ...user,
        avatar: data.data.avatar,
        banner: data.data.banner,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Update state
      setUser(updatedUser);
      setSuccess("Profile images updated successfully!");

      // Notify other components about the update
      window.dispatchEvent(new Event("authChange"));

      // Show success message briefly before redirecting
      setTimeout(() => {
        router.push("/profile");
      }, 1000); // Redirect after 1 second
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-4xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Update Profile Images</h1>

          {error && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
              <p className="mt-1 text-sm">Redirecting to your profile...</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Avatar Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Preview */}
                <div className="w-full md:w-1/3">
                  <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center">
                    <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-gray-300 mb-2">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl || "/placeholder.svg"}
                          alt={avatarAlt || "Avatar preview"}
                          width={128}
                          height={128}
                          className="object-cover h-full w-full"
                          onError={() => setError("Avatar image URL is invalid or inaccessible")}
                        />
                      ) : user?.avatar?.url ? (
                        <Image src={user.avatar.url || "/placeholder.svg"} alt={user.avatar.alt || "Current avatar"} width={128} height={128} className="object-cover h-full w-full" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white text-4xl font-bold">{user?.name.charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{avatarUrl ? "New profile picture" : "Current profile picture"}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="w-full md:w-2/3 space-y-4">
                  <div>
                    <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      id="avatarUrl"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="mt-1 text-sm text-gray-500">Enter a publicly accessible URL for your profile picture</p>
                  </div>

                  <div>
                    <label htmlFor="avatarAlt" className="block text-sm font-medium text-gray-700 mb-1">
                      Image Description
                    </label>
                    <input
                      type="text"
                      id="avatarAlt"
                      value={avatarAlt}
                      onChange={(e) => setAvatarAlt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of your profile picture"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Profile Banner</h2>

              <div className="flex flex-col gap-6">
                {/* Preview */}
                <div className="w-full">
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="h-48 bg-gray-200 rounded-lg relative overflow-hidden">
                      {bannerUrl ? (
                        <Image
                          src={bannerUrl || "/placeholder.svg"}
                          alt={bannerAlt || "Banner preview"}
                          fill
                          className="object-cover"
                          onError={() => setError("Banner image URL is invalid or inaccessible")}
                        />
                      ) : user?.banner?.url ? (
                        <Image src={user.banner.url || "/placeholder.svg"} alt={user.banner.alt || "Current banner"} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold">No Banner Image</div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-center">{bannerUrl ? "New banner image" : "Current banner image"}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="w-full space-y-4">
                  <div>
                    <label htmlFor="bannerUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Banner URL
                    </label>
                    <input
                      type="url"
                      id="bannerUrl"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/banner.jpg"
                    />
                    <p className="mt-1 text-sm text-gray-500">Enter a publicly accessible URL for your profile banner</p>
                  </div>

                  <div>
                    <label htmlFor="bannerAlt" className="block text-sm font-medium text-gray-700 mb-1">
                      Banner Description
                    </label>
                    <input
                      type="text"
                      id="bannerAlt"
                      value={bannerAlt}
                      onChange={(e) => setBannerAlt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of your banner image"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating || success !== null}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  updating || success !== null ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {updating ? "Updating..." : success ? "Updated!" : "Update Profile Images"}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Tips for Profile Images</h3>
            <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
              <li>Use images that are publicly accessible (the API will check this)</li>
              <li>Recommended profile picture size: 500x500 pixels</li>
              <li>Recommended banner size: 1500x500 pixels</li>
              <li>Supported formats: JPG, PNG, GIF</li>
              <li>Maximum file size: 2MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileImages;
