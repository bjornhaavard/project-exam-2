import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import { Toaster } from "sonner";
import { AuthNotificationProvider } from "./context/auth-notification-context";

/**
 * Geist Sans font configuration
 * This sets up the Geist Sans font with Latin subset and makes it available as a CSS variable
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * Geist Mono font configuration
 * This sets up the Geist Mono font with Latin subset and makes it available as a CSS variable
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Metadata for the application
 * This defines SEO-related information and favicon configurations
 * @type {Metadata}
 */
export const metadata: Metadata = {
  title: "Holidayz",
  description: "Here you can find your next holiday destination",
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

/**
 * Root layout component for the application
 * This component wraps all pages and provides the basic HTML structure
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render within the layout
 * @returns {React.JSX.Element} The root layout structure with navbar, main content, and footer
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex flex-col min-h-screen antialiased bg-slate-200">
        <AuthNotificationProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
            <Toaster />
          </main>
          <Footer />
        </AuthNotificationProvider>
      </body>
    </html>
  );
}
