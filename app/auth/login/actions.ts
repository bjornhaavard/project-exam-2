"use server";

import { API_CONFIG } from "@/app/api-config";

/**
 * Interface representing the response structure from the login API endpoint
 * @interface LoginResponse
 */
interface LoginResponse {
  data: {
    /** User's username/name */
    name: string;
    /** User's email address */
    email: string;
    /** User's avatar image information (optional) */
    avatar?: {
      /** URL to the avatar image */
      url: string;
      /** Alternative text for the avatar image */
      alt: string;
    };
    /** User's banner image information (optional) */
    banner?: {
      /** URL to the banner image */
      url: string;
      /** Alternative text for the banner image */
      alt: string;
    };
    /** JWT access token for authenticated requests */
    accessToken: string;
    /** Flag indicating if the user is a venue manager (optional) */
    venueManager?: boolean;
  };
  /** Additional metadata from the API response */
  meta: Record<string, unknown>;
}

/**
 * Server action to authenticate a user with email and password
 *
 * This function sends a login request to the Noroff API and returns
 * the user data and authentication token if successful.
 *
 * @param {string} email - The user's email address
 * @param {string} password - The user's password
 * @returns {Promise<{
 *   success: boolean;
 *   user?: {
 *     name: string;
 *     email: string;
 *     avatar?: {url: string; alt: string};
 *     banner?: {url: string; alt: string};
 *     venueManager?: boolean;
 *   };
 *   token?: string;
 *   error?: string;
 * }>} Object containing success status, user data, token, and any error message
 *
 * @example
 * // Example usage in a form submission handler
 * async function handleSubmit(formData) {
 *   const email = formData.get('email');
 *   const password = formData.get('password');
 *   const result = await loginUser(email, password);
 *
 *   if (result.success) {
 *     // Store user data and token
 *     localStorage.setItem('token', result.token);
 *     localStorage.setItem('user', JSON.stringify(result.user));
 *   } else {
 *     // Handle error
 *     console.error(result.error);
 *   }
 * }
 */
export async function loginUser(email: string, password: string) {
  try {
    // Use API_CONFIG for the base URL and API key
    const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Noroff-API-Key": API_CONFIG.API_KEY,
      },
      body: JSON.stringify({
        email,
        password,
      }),
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("API error response:", errorData);
      throw new Error(errorData?.message || `Login failed with status: ${response.status}`);
    }

    const data: LoginResponse = await response.json();

    // Return the data for client-side storage
    return {
      success: true,
      user: {
        name: data.data.name,
        email: data.data.email,
        avatar: data.data.avatar,
        banner: data.data.banner,
        venueManager: data.data.venueManager,
      },
      token: data.data.accessToken,
    };
  } catch (error: unknown) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect to the authentication service",
    };
  }
}
