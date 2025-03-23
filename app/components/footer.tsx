"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const Footer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status when component mounts and when auth changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    // Check on mount
    checkAuthStatus();

    // Listen for auth changes (like login/logout events)
    window.addEventListener("authChange", checkAuthStatus);
    window.addEventListener("storage", checkAuthStatus);

    return () => {
      window.removeEventListener("authChange", checkAuthStatus);
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  // Function to scroll to top
  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Function to trigger the login drawer
  const triggerLoginDrawer = () => {
    // Create and dispatch a custom event that the LoginDrawer component can listen for
    const loginEvent = new CustomEvent("triggerLoginDrawer");
    window.dispatchEvent(loginEvent);
  };

  return (
    <footer className="bg-gray-800 text-white w-full">
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="footer-section">
            <h3 className="text-lg font-bold mb-2">About</h3>
            <p>Stay updated with our latest venues and news.</p>
          </div>
          <div className="footer-section">
            <h3 className="text-lg font-bold mb-2">Quick Links</h3>
            <ul>
              <li className="mb-1">
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <a href="#" onClick={scrollToTop} className="text-gray-300 hover:text-white">
                  To the top
                </a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3 className="text-lg font-bold mb-2">Profile</h3>
            {isLoggedIn ? (
              <p>
                <Link href="/profile" className="text-blue-400 hover:text-blue-500">
                  View your Profile
                </Link>
              </p>
            ) : (
              <p>
                <button onClick={triggerLoginDrawer} className="text-blue-400 hover:text-blue-500 bg-transparent border-none p-0 cursor-pointer">
                  Login to view your Profile
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="footer-bottom text-center bg-gray-700 p-4 w-full">
        <p>&copy; 2025 HoliDaze. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
