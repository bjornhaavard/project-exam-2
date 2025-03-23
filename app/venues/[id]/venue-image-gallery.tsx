"use client";

import { useState } from "react";
import Image from "next/image";
import ImageGalleryModal from "@/app/components/ImageGalleryModal";

interface Venue {
  id: string;
  name: string;
  media: { url: string; alt: string }[];
  // Other venue properties...
}

interface VenueImageGalleryProps {
  venue: Venue;
}

export default function VenueImageGallery({ venue }: VenueImageGalleryProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [initialImageIndex, setInitialImageIndex] = useState(0);

  const openGallery = (imageIndex = 0) => {
    setInitialImageIndex(imageIndex);
    setGalleryOpen(true);
  };

  if (!venue.media || venue.media.length === 0) {
    return (
      <div className="relative w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative w-full h-[400px] cursor-pointer group overflow-hidden" onClick={() => openGallery(0)}>
          <Image
            src={venue.media[0]?.url || "/placeholder.svg"}
            alt={venue.media[0]?.alt || venue.name}
            fill
            className="rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>

        {/* Additional Images */}
        {venue.media.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {venue.media.slice(1).map((image, index) => (
              <div key={index} className="relative h-24 cursor-pointer group overflow-hidden" onClick={() => openGallery(index + 1)}>
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt || `${venue.name} image ${index + 2}`}
                  fill
                  className="rounded-md object-cover transition-transform duration-300 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal images={venue.media} initialIndex={initialImageIndex} isOpen={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </>
  );
}
