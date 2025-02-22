"use client";

import { useState } from "react";
import Link from "next/link";

const LoginDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={toggleDrawer} className="gray-button">
        Login / Register
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
      <div className={`fixed top-0 right-0 h-full w-64 bg-gray-700 text-white shadow-lg transform transition-transform z-50 duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Login or Register</h1>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                placeholder="Username"
                autoFocus={true}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="******************"
              />
            </div>
            <div className="flex items-center justify-between">
              <button className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={closeDrawer}>
                Sign In
              </button>
              <Link href="/auth/register" passHref>
                <button className="green-button" type="button" onClick={closeDrawer}>
                  Register
                </button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginDrawer;
