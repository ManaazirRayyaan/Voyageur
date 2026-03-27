import { Link, useLocation } from "react-router-dom";
import { useBooking } from "../context/BookingContext";

function BookingConfirmation() {
  const location = useLocation();
  const { bookings, lastCreatedBooking, downloadInvoice } = useBooking();
  const bookingId = location.state?.bookingId;
  const booking =
    bookings.find((item) => String(item.id) === String(bookingId)) ||
    lastCreatedBooking ||
    bookings[0];

  if (!booking) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <section className="section-card w-full max-w-2xl p-8 text-center">
          <h1 className="font-display text-4xl font-semibold">No booking found</h1>
          <p className="mt-4 text-sm text-slate-600">Complete a booking to see your confirmation summary.</p>
          <Link to="/packages" className="btn-primary mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold">Browse Packages</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="section-card w-full max-w-3xl overflow-hidden p-8 text-center lg:p-12">
        <div className="success-ring mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600">
          <i className="fa-solid fa-check" />
        </div>
        <span className="badge-gradient mt-8 inline-flex rounded-full px-4 py-2 text-sm font-semibold">Booking Successful</span>
        <h1 className="font-display mt-5 text-4xl font-semibold">Your {booking.package?.destination || booking.destination} journey is confirmed.</h1>
        <section className="section-card mx-auto mt-8 max-w-2xl p-6 text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-sm text-slate-500">Booking ID</p>
              <strong className="text-xl">{booking.reference}</strong>
            </div>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">Confirmed for {booking.travelers} travelers</span>
          </div>
          <div className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
            <div><p className="text-slate-500">Destination</p><strong className="mt-1 block text-slate-900">{booking.package?.destination || booking.destination}</strong></div>
            <div><p className="text-slate-500">Dates</p><strong className="mt-1 block text-slate-900">{booking.startDate} to {booking.endDate}</strong></div>
            <div><p className="text-slate-500">Hotel</p><strong className="mt-1 block text-slate-900">{booking.hotel?.name || "Assigned later"}</strong></div>
            <div><p className="text-slate-500">Total Paid</p><strong className="mt-1 block text-slate-900">${booking.totalPrice}</strong></div>
          </div>
        </section>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button type="button" onClick={() => downloadInvoice(booking.id, `${booking.reference.toLowerCase()}-invoice.pdf`)} className="btn-primary rounded-full px-6 py-4 text-sm font-semibold">Download Invoice (PDF)</button>
          <Link to={`/packages/${booking.package?.id || ""}`} className="btn-secondary rounded-full px-6 py-4 text-sm font-semibold">View Package Details</Link>
          <button type="button" disabled className="rounded-full bg-emerald-100 px-6 py-4 text-sm font-semibold text-emerald-700">Booking Confirmed</button>
        </div>
        <Link to="/dashboard" className="mt-5 inline-block text-sm font-semibold text-sky-700">Go to dashboard</Link>
      </section>
    </main>
  );
}

export default BookingConfirmation;
