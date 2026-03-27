import { useBooking } from "../context/BookingContext";

function DashboardBookings() {
  const { bookings, downloadInvoice } = useBooking();

  return (
    <section className="section-card p-6">
      <h2 className="text-2xl font-semibold">All Bookings</h2>
      <div className="mt-6 space-y-4">
        {bookings.length ? bookings.map((booking) => (
          <article key={booking.id} className="travel-card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold">{booking.package?.title || booking.destination}</h3>
                <p className="mt-2 text-sm text-slate-600">{booking.startDate} to {booking.endDate} • {booking.reference}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{booking.status}</span>
                <button type="button" onClick={() => downloadInvoice(booking.id, `${booking.reference.toLowerCase()}-invoice.pdf`)} className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold">
                  Download Invoice
                </button>
              </div>
            </div>
          </article>
        )) : <p className="text-sm text-slate-600">No bookings yet.</p>}
      </div>
    </section>
  );
}

export default DashboardBookings;
