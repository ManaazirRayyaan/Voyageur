import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";
import { getNights } from "../utils/pricing";

function BookingSidebar({ packageItem }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    selectedPackage,
    selectedHotel,
    selectedTransport,
    travelers,
    startDate,
    endDate,
    totalPrice,
    setSelectedPackage,
    setSelectedHotel,
    setSelectedTransport,
    setTravelers,
    setDates,
    createBooking,
    isPackageBooked,
  } = useBooking();
  const [error, setError] = useState("");

  const packageHotels = useMemo(
    () => packageItem.hotels || [],
    [packageItem.hotels]
  );
  const packageTransports = packageItem.transports || [];

  const activeHotel = selectedHotel && selectedHotel.destinationSlug === packageItem.destinationSlug ? selectedHotel : packageHotels[0];
  const activeTransport = selectedTransport || packageTransports[0];
  const alreadyBooked = isPackageBooked(packageItem.id);

  const handleBookNow = async () => {
    setError("");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (alreadyBooked) {
      return;
    }
    setSelectedPackage(packageItem);
    setSelectedHotel(activeHotel);
    setSelectedTransport(activeTransport);
    try {
      const booking = await createBooking({
        package: packageItem,
        hotel: activeHotel,
        transport: activeTransport,
        travelers,
        startDate,
        endDate,
        type: "package",
      });
      navigate("/booking-confirmation", { state: { bookingId: booking.id } });
    } catch (err) {
      setError(err.payload?.error?.[0] || err.payload?.error || err.message || "Booking failed.");
    }
  };

  return (
    <div className="section-card p-7">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Reserve Package</p>
      <div className="mt-4 flex items-end justify-between">
        <div><span className="text-sm text-slate-500">Starting from</span><p className="text-4xl font-bold">${packageItem.price}</p></div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Instant confirm</span>
      </div>
      <div className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Select Dates</span>
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="date" value={startDate} onChange={(e) => setDates(e.target.value, endDate)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
            <input type="date" value={endDate} onChange={(e) => setDates(startDate, e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
          </div>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Transport</span>
          <select
            value={activeTransport?.id}
            onChange={(e) => setSelectedTransport(packageTransports.find((item) => String(item.id) === e.target.value))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          >
            {packageTransports.map((transport) => <option key={transport.id} value={transport.id}>{transport.type}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Hotel</span>
          <select
            value={activeHotel?.id}
            onChange={(e) => setSelectedHotel(packageHotels.find((hotel) => String(hotel.id) === e.target.value))}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
          >
            {packageHotels.map((hotel) => <option key={hotel.id} value={hotel.id}>{hotel.name}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Travelers</span>
          <input type="number" min="1" value={travelers} onChange={(e) => setTravelers(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        </label>
      </div>
      <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
        <div className="flex justify-between"><span>Base package</span><strong>${packageItem.price}</strong></div>
        <div className="mt-3 flex justify-between"><span>Hotel x {getNights(startDate, endDate)} nights</span><strong>${(activeHotel?.pricePerNight || 0) * getNights(startDate, endDate)}</strong></div>
        <div className="mt-3 flex justify-between"><span>Transport</span><strong>${activeTransport?.price || 0}</strong></div>
        <div className="mt-4 border-t border-slate-200 pt-4 text-base font-semibold text-slate-900">
          <div className="flex justify-between"><span>Total</span><span>${totalPrice}</span></div>
        </div>
      </div>
      {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
      <button
        type="button"
        onClick={handleBookNow}
        disabled={alreadyBooked}
        className={`${alreadyBooked ? "cursor-not-allowed bg-slate-200 text-slate-500 shadow-none" : "btn-primary"} mt-6 block w-full rounded-3xl px-6 py-4 text-center text-sm font-semibold`}
      >
        {alreadyBooked ? "Already Booked" : "Book Now"}
      </button>
    </div>
  );
}

export default BookingSidebar;
