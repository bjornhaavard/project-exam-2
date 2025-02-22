"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import LoginDrawer from "./LoginDrawer";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-700 shadow-xl p-8">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/images/holidaze-white-logo.png" alt="Holidaze Logo" width={150} height={100} />
        </Link>
        <LoginDrawer />
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <Link href="/auth/register" className="green-button block mb-3 mt-3">
            Register
          </Link>
          <LoginDrawer />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
