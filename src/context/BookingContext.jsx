import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, getApiBase } from "../utils/api";
import { useAuth } from "./AuthContext";
import { calculateBookingTotal, getNights } from "../utils/pricing";

const BookingContext = createContext(null);

const initialState = {
  selectedPackage: null,
  selectedHotel: null,
  selectedTransport: null,
  travelers: 2,
  startDate: "2026-06-14",
  endDate: "2026-06-20",
};

export function BookingProvider({ children }) {
  const { tokens, isAuthenticated } = useAuth();
  const [state, setState] = useState(initialState);
  const [bookings, setBookings] = useState([]);
  const [lastCreatedBooking, setLastCreatedBooking] = useState(null);

  useEffect(() => {
    let active = true;
    async function loadBookings() {
      if (!isAuthenticated || !tokens?.access) {
        setBookings([]);
        return;
      }
      const data = await apiRequest("/api/bookings/", { token: tokens.access });
      if (active) setBookings(data);
    }
    loadBookings().catch(() => {
      if (active) setBookings([]);
    });
    return () => {
      active = false;
    };
  }, [isAuthenticated, tokens]);

  const totalPrice = useMemo(() => {
    return calculateBookingTotal({
      packagePrice: Number(state.selectedPackage?.price || 0),
      hotelPrice: Number(state.selectedHotel?.pricePerNight || 0),
      transportPrice: Number(state.selectedTransport?.price || 0),
      travelers: state.travelers,
      nights: getNights(state.startDate, state.endDate),
    });
  }, [state]);

  const value = useMemo(
    () => ({
      ...state,
      bookings,
      lastCreatedBooking,
      totalPrice,
      isPackageBooked(packageId) {
        return bookings.some(
          (booking) =>
            String(booking.package?.id) === String(packageId) &&
            booking.status === "booked"
        );
      },
      setSelectedPackage(selectedPackage) {
        setState((prev) => ({
          ...prev,
          selectedPackage,
          selectedHotel: selectedPackage?.hotels?.[0] || prev.selectedHotel,
          selectedTransport: selectedPackage?.transports?.[0] || prev.selectedTransport,
        }));
      },
      setSelectedHotel(selectedHotel) {
        setState((prev) => ({ ...prev, selectedHotel }));
      },
      setSelectedTransport(selectedTransport) {
        setState((prev) => ({ ...prev, selectedTransport }));
      },
      setTravelers(travelers) {
        setState((prev) => ({ ...prev, travelers: Number(travelers) || 1 }));
      },
      setDates(startDate, endDate) {
        setState((prev) => ({ ...prev, startDate, endDate }));
      },
      async createBooking(overrides = {}) {
        if (!tokens?.access) throw new Error("Please log in to complete a booking.");
        const packageItem = Object.prototype.hasOwnProperty.call(overrides, "package")
          ? overrides.package
          : state.selectedPackage;
        const bookingPayload = {
          package_id: packageItem?.id,
          destination_id: overrides.destinationId,
          hotel_id: (overrides.hotel || state.selectedHotel)?.id || null,
          transport_id: (overrides.transport || state.selectedTransport)?.id || null,
          travelers: Number(overrides.travelers || state.travelers || 1),
          start_date: overrides.startDate || state.startDate,
          end_date: overrides.endDate || state.endDate,
          custom_notes: overrides.customNotes || "",
        };
        if (!bookingPayload.package_id) {
          delete bookingPayload.package_id;
        }
        if (!bookingPayload.destination_id) {
          delete bookingPayload.destination_id;
        }
        const booking = await apiRequest("/api/book/", {
          method: "POST",
          body: bookingPayload,
          token: tokens.access,
        });
        setBookings((prev) => [booking, ...prev]);
        setLastCreatedBooking(booking);
        return booking;
      },
      async refreshBookings() {
        if (!tokens?.access) return [];
        const data = await apiRequest("/api/bookings/", { token: tokens.access });
        setBookings(data);
        return data;
      },
      resetCurrentBooking() {
        setState(initialState);
      },
      async downloadInvoice(bookingId, filename = "voyageur-invoice.pdf") {
        const blob = await apiRequest(`/api/invoice/${bookingId}/`, {
          token: tokens?.access,
          parse: "blob",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
      },
      invoiceUrl(bookingId) {
        return `${getApiBase()}/api/invoice/${bookingId}/`;
      },
    }),
    [bookings, lastCreatedBooking, state, tokens, totalPrice]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  return useContext(BookingContext);
}
