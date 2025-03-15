"use server";

interface LoginResponse {
  data: {
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
    accessToken: string;
    venueManager?: boolean;
  };
  meta: Record<string, unknown>;
}

export async function loginUser(email: string, password: string) {
  try {
    // Make sure the API URL is correct and accessible
    const response = await fetch("https://api.noroff.dev/api/v1/holidaze/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
      // Add these options to help with potential CORS or network issues
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
