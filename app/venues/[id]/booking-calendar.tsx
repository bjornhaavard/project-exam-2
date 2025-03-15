"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { addDays, format, isBefore, isSameDay, parseISO } from "date-fns";
import { API_CONFIG } from "@/app/api-config";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { DateRange } from "react-day-picker";

interface Venue {
  id: string;
  name: string;
  price: number;
  maxGuests: number;
}

interface Booking {
  id: string;
  dateFrom: string;
  dateTo: string;
  guests: number;
}

interface BookingCalendarProps {
  venue: Venue;
  existingBookings: Booking[];
}

export default function BookingCalendar({ venue, existingBookings }: BookingCalendarProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [token, setToken] = useState<string | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const userToken = localStorage.getItem("token");
    setIsAuthenticated(!!userToken);
    setToken(userToken);
  }, []);

  // Calculate total price when dates change
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const nights = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
      setTotalPrice(nights * venue.price);
    } else {
      setTotalPrice(0);
    }
  }, [dateRange, venue.price]);

  // Process existing bookings to get disabled dates
  useEffect(() => {
    const bookedDates: Date[] = [];

    existingBookings.forEach((booking) => {
      const from = parseISO(booking.dateFrom);
      const to = parseISO(booking.dateTo);

      let currentDate = new Date(from);
      while (isBefore(currentDate, to) || isSameDay(currentDate, to)) {
        bookedDates.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
      }
    });

    setDisabledDates(bookedDates);
  }, [existingBookings]);

  // Function to check if a date range overlaps with booked dates
  const isRangeAvailable = (from: Date, to: Date): boolean => {
    let currentDate = new Date(from);
    while (isBefore(currentDate, to) || isSameDay(currentDate, to)) {
      if (disabledDates.some((disabledDate) => isSameDay(disabledDate, currentDate))) {
        return false;
      }
      currentDate = addDays(currentDate, 1);
    }
    return true;
  };

  // Function to handle date range selection
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range) {
      setDateRange(undefined);
      return;
    }

    // If only the start date is selected
    if (range.from && !range.to) {
      setDateRange(range);
      return;
    }

    // If both dates are selected, check if the range is available
    if (range.from && range.to) {
      if (!isRangeAvailable(range.from, range.to)) {
        setError("Your selected date range includes already booked dates");
        // Keep the from date but clear the to date
        setDateRange({ from: range.from, to: undefined });
        return;
      }

      setDateRange(range);
      setError(null);
    }
  };

  // Function to fetch updated bookings after a successful booking
  const fetchUpdatedBookings = async () => {
    try {
      // Fetch updated bookings for this venue
      const response = await fetch(`${API_CONFIG.BASE_URL}/holidaze/venues/${venue.id}?_bookings=true`, {
        headers: {
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch updated bookings");
        return;
      }

      const data = await response.json();

      if (data.data && data.data.bookings && Array.isArray(data.data.bookings)) {
        // Update disabled dates with new bookings
        const updatedBookedDates: Date[] = [];

        data.data.bookings.forEach((booking: Booking) => {
          const from = parseISO(booking.dateFrom);
          const to = parseISO(booking.dateTo);

          let currentDate = new Date(from);
          while (isBefore(currentDate, to) || isSameDay(currentDate, to)) {
            updatedBookedDates.push(new Date(currentDate));
            currentDate = addDays(currentDate, 1);
          }
        });

        setDisabledDates(updatedBookedDates);
      }
    } catch (error) {
      console.error("Error fetching updated bookings:", error);
    }
  };

  // Function to handle booking submission
  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      setError("Please select check-in and check-out dates");
      return;
    }

    if (guests < 1 || guests > venue.maxGuests) {
      setError(`Number of guests must be between 1 and ${venue.maxGuests}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");

      const bookingResponse = await fetch(`${API_CONFIG.BASE_URL}/holidaze/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Noroff-API-Key": API_CONFIG.API_KEY,
        },
        body: JSON.stringify({
          dateFrom: dateRange.from.toISOString(),
          dateTo: dateRange.to.toISOString(),
          guests: guests,
          venueId: venue.id,
        }),
      });

      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingData.errors?.[0]?.message || "Failed to create booking");
      }

      // Log the booking data for debugging
      console.log("Booking successful:", bookingData);

      setSuccess("Booking successful! You can view your bookings in your profile.");

      // Reset form
      setDateRange(undefined);
      setGuests(1);

      // Fetch updated bookings to refresh the calendar
      await fetchUpdatedBookings();

      // Force a hard refresh after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Booking error:", error);
      setError(error instanceof Error ? error.message : "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select your dates</h3>
            <p className="text-sm text-gray-500">
              {dateRange?.from ? `Check-in: ${format(dateRange.from, "PPP")}` : "No check-in date selected"}
              {dateRange?.to ? `, Check-out: ${format(dateRange.to, "PPP")}` : ""}
            </p>
          </div>

          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={handleDateRangeSelect}
            disabled={(date) => {
              // Disable dates in the past
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              // Disable already booked dates
              return isBefore(date, today) || disabledDates.some((disabledDate) => isSameDay(disabledDate, date));
            }}
            className="rounded-md border"
            numberOfMonths={1}
          />

          <div className="mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <span>Booked dates</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>Selected dates</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Booking details</h3>

          {/* Booking summary */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="guests">Number of guests</Label>
              <Input id="guests" type="number" min={1} max={venue.maxGuests} value={guests} onChange={(e) => setGuests(Number.parseInt(e.target.value) || 1)} className="mt-1" />
              <p className="text-xs text-gray-500 mt-1">Maximum: {venue.maxGuests} guests</p>
            </div>

            {dateRange?.from && dateRange?.to && (
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span className="font-medium">{format(dateRange.from, "PPP")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span className="font-medium">{format(dateRange.to, "PPP")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span className="font-medium">{Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span className="font-medium">{guests}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error and success messages */}
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{success}</p>
                  <p className="text-sm mt-1">Refreshing page to update calendar...</p>
                </div>
              </div>
            )}

            {/* Booking button */}
            <Button onClick={handleBooking} disabled={!dateRange?.from || !dateRange?.to || isSubmitting || !!success} className="w-full">
              {isAuthenticated ? (isSubmitting ? "Processing..." : "Book Now") : "Login to Book"}
            </Button>

            {!isAuthenticated && <p className="text-sm text-center text-gray-500">You need to be logged in to book this venue</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
