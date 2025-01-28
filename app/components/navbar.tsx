import React from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="bg-gray-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image src="/images/Holidaze-logo.png" alt="Holidaze Logo" width={80} height={80} />
        </Link>

        <Link href="/" passHref>
          <p className="text-gray-800 hover:text-gray-700">Home</p>
        </Link>
        <Link href="/about" className="text-gray-800 hover:text-gray-700">
          About
        </Link>
        <Link href="/contact" className="text-gray-800 hover:text-gray-700">
          Contact
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
