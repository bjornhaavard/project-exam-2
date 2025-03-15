"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoginDrawer from "../auth/login/LoginDrawer";

interface UserData {
  name: string;
  email: string;
  avatar?: {
    url: string;
    alt: string;
  };
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  // Check if user is logged in on component mount and when localStorage changes
  useEffect(() => {
    const checkUserLoggedIn = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Check on mount
    checkUserLoggedIn();

    // Listen for storage events (when localStorage changes)
    const handleStorageChange = () => {
      checkUserLoggedIn();
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event for login/logout
    const handleAuthChange = () => {
      checkUserLoggedIn();
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Update state
    setUser(null);
    setIsDropdownOpen(false);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("authChange"));

    // Redirect to home page
    router.push("/");
  };

  return (
    <nav className="bg-gray-800 shadow-xl p-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/images/holidaze-white-logo.png" alt="Holidaze Logo" width={150} height={100} />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="relative">
              <button onClick={toggleDropdown} className="flex items-center focus:outline-none" aria-expanded={isDropdownOpen} aria-haspopup="true">
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white">
                  {user.avatar?.url ? (
                    <Image src={user.avatar.url || "/placeholder.svg"} alt={user.avatar.alt || `${user.name}'s avatar`} width={40} height={40} className="object-cover h-full w-full" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white font-bold">{user.name.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <span className="ml-2 text-white">{user.name}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/auth/register" className="green-button">
                Register
              </Link>
              <LoginDrawer />
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden pt-4">
          {user ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white mr-2">
                  {user.avatar?.url ? (
                    <Image src={user.avatar.url || "/placeholder.svg"} alt={user.avatar.alt || `${user.name}'s avatar`} width={40} height={40} className="object-cover h-full w-full" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-blue-500 text-white font-bold">{user.name.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <span className="text-white">{user.name}</span>
              </div>
              <Link href="/profile" className="block w-full text-center py-2 text-white hover:bg-gray-700 rounded mb-2" onClick={() => setIsOpen(false)}>
                Profile
              </Link>
              <button onClick={handleLogout} className="block w-full text-center py-2 text-white hover:bg-gray-700 rounded">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/register" className="green-button block text-center mb-3" onClick={() => setIsOpen(false)}>
                Register
              </Link>
              <LoginDrawer />
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
