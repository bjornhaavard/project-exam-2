/**
 * Represents a single media item (image) for a venue.
 */
export interface VenueMedia {
  /** URL of the media */
  url: string;
  /** Alternative text for the media */
  alt: string;
}

/**
 * Represents metadata about a venue's available amenities.
 */
export interface VenueMeta {
  /** Whether the venue has WiFi */
  wifi: boolean;
  /** Whether the venue has parking available */
  parking: boolean;
  /** Whether the venue offers breakfast */
  breakfast: boolean;
  /** Whether pets are allowed at the venue */
  pets: boolean;
}

/**
 * Represents the physical location details of a venue.
 */
export interface VenueLocation {
  /** Street address of the venue */
  address: string;
  /** City where the venue is located */
  city: string;
  /** Zip code of the venue's location */
  zip: string;
  /** Country where the venue is located */
  country: string;
  /** Continent where the venue is located (can be null) */
  continent: string | null;
  /** Latitude coordinate */
  lat: number;
  /** Longitude coordinate */
  lng: number;
}

/**
 * Represents a booking made for a venue.
 */
export interface Booking {
  /** Unique identifier for the booking */
  id: string;
  /** Start date of the booking (ISO 8601 string) */
  dateFrom: string;
  /** End date of the booking (ISO 8601 string) */
  dateTo: string;
  /** Number of guests included in the booking */
  guests: number;
  /** Date when the booking was created (ISO 8601 string) */
  created: string;
  /** Date when the booking was last updated (ISO 8601 string) */
  updated: string;
  /** Details about the booked venue (optional) */
  venue?: {
    /** ID of the booked venue */
    id: string;
    /** Name of the booked venue */
    name: string;
    /** Description of the booked venue (optional) */
    description?: string;
    /** Price per night of the booked venue (optional) */
    price?: number;
    /** Media items associated with the booked venue (optional) */
    media?: VenueMedia[];
  };
}

/**
 * Represents a venue listing.
 */
export interface Venue {
  /** Unique identifier for the venue */
  id: string;
  /** Name of the venue */
  name: string;
  /** Description of the venue */
  description: string;
  /** Array of media associated with the venue */
  media: VenueMedia[];
  /** Price per night for staying at the venue */
  price: number;
  /** Maximum number of guests allowed */
  maxGuests: number;
  /** Average user rating for the venue */
  rating: number;
  /** Date when the venue was created (ISO 8601 string) */
  created: string;
  /** Date when the venue was last updated (ISO 8601 string) */
  updated: string;
  /** Metadata about venue amenities */
  meta: VenueMeta;
  /** Physical location details of the venue */
  location: VenueLocation;
  /** List of bookings for this venue (optional) */
  bookings?: Booking[];
}

/**
 * Payload for creating a new venue.
 */
export interface CreateVenueData {
  /** Name of the new venue */
  name: string;
  /** Description of the new venue */
  description: string;
  /** Array of media items for the venue (optional) */
  media?: VenueMedia[];
  /** Price per night for the venue */
  price: number;
  /** Maximum number of guests allowed */
  maxGuests: number;
  /** Optional rating for the new venue */
  rating?: number;
  /** Optional metadata about available amenities */
  meta?: {
    wifi?: boolean;
    parking?: boolean;
    breakfast?: boolean;
    pets?: boolean;
  };
  /** Optional location details for the new venue */
  location?: {
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
    continent?: string;
    lat?: number;
    lng?: number;
  };
}

/**
 * Payload for updating an existing venue.
 */
export interface UpdateVenueData {
  /** Updated name of the venue (optional) */
  name?: string;
  /** Updated description of the venue (optional) */
  description?: string;
  /** Updated array of media items (optional) */
  media?: VenueMedia[];
  /** Updated price per night (optional) */
  price?: number;
  /** Updated maximum number of guests (optional) */
  maxGuests?: number;
  /** Updated rating (optional) */
  rating?: number;
  /** Updated metadata about available amenities (optional) */
  meta?: {
    wifi?: boolean;
    parking?: boolean;
    breakfast?: boolean;
    pets?: boolean;
  };
  /** Updated location details (optional) */
  location?: {
    address?: string;
    city?: string;
    zip?: string;
    country?: string;
    continent?: string;
    lat?: number;
    lng?: number;
  };
}
