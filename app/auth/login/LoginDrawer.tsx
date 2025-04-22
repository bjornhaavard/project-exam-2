"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { API_CONFIG } from "@/app/api-config";
import { useAuthNotification } from "@/app/context/auth-notification-context";

const LoginDrawer = () => {
  const router = useRouter();
  const { showAuthNotification } = useAuthNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Listen for the custom event from the footer
  useEffect(() => {
    const handleLoginTrigger = () => {
      setIsOpen(true);
      setError("");
    };

    window.addEventListener("triggerLoginDrawer", handleLoginTrigger);

    return () => {
      window.removeEventListener("triggerLoginDrawer", handleLoginTrigger);
    };
  }, []);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }

    // Trim whitespace from credentials
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    try {
      const loginUrl = `${API_CONFIG.BASE_URL}/auth/login`;

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || "Login failed");
      }

      if (data.data?.accessToken) {
        // After successful login, fetch the user profile to get accurate venueManager status
        const profileResponse = await fetch(`${API_CONFIG.BASE_URL}/holidaze/profiles/${data.data.name}`, {
          headers: {
            Authorization: `Bearer ${data.data.accessToken}`,
            "X-Noroff-API-Key": API_CONFIG.API_KEY,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          // Use venueManager status from profile data
          data.data.venueManager = profileData.data.venueManager;
        }

        // Store auth data in localStorage
        localStorage.setItem("token", data.data.accessToken);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: data.data.name,
            email: data.data.email,
            avatar: data.data.avatar,
            banner: data.data.banner,
            venueManager: data.data.venueManager, // This should now be accurate
          })
        );

        // Show login notification
        showAuthNotification("login", data.data.name);

        // Dispatch custom event to notify other components (like Navbar)
        window.dispatchEvent(new Event("authChange"));

        // Close drawer and redirect
        setIsOpen(false);
        router.refresh();
        router.push("/profile");
      } else {
        throw new Error("No access token received");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={toggleDrawer} className="blue-button w-full">
        Login
      </button>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} m-0 p-0 w-full h-full`}
        style={{
          left: "0",
          top: "0",
          right: "0",
          bottom: "0",
          margin: "0",
          padding: "0",
          width: "100vw",
          height: "100vh",
        }}
        onClick={toggleDrawer}
      />
      <div
        className={`fixed top-0 right-0 h-full w-64 z-50 bg-gray-800 text-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Login</h1>
          {error && <div className="mb-4 p-2 bg-red-500 text-white rounded text-sm">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                name="email"
                type="email"
                placeholder="first.last@stud.noroff.no"
                required
                autoFocus={true}
                ref={emailRef}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline pr-10"
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="******************"
                  required
                  ref={passwordRef}
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link href="/auth/register">
                <button className="green-button text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={() => setIsOpen(false)}>
                  Register
                </button>
              </Link>
              <button
                className={`blue-button text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginDrawer;
