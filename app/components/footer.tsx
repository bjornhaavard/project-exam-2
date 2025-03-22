import React from "react";
import Link from "next/link";

const Footer = () => {
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
                <Link href="" className="text-gray-300 hover:text-white">
                  To the top
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3 className="text-lg font-bold mb-2">Profile</h3>
            <p>
              <Link href="/profile" className="text-blue-400 hover:text-blue-500">
                View your Profile
              </Link>
            </p>
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
