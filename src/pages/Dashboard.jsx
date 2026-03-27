import { Link } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { usePackages } from "../context/PackageContext";

function Dashboard() {
  const { bookings } = useBooking();
  const { savedPackages } = usePackages();
  const activeTrips = bookings.filter((booking) => booking.isOngoing).length;

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="section-card p-6"><p className="text-sm text-slate-500">Active trips</p><strong className="mt-2 block text-3xl">{activeTrips}</strong></div>
        <div className="section-card p-6"><p className="text-sm text-slate-500">Bookings</p><strong className="mt-2 block text-3xl">{bookings.length}</strong></div>
        <div className="section-card p-6"><p className="text-sm text-slate-500">Wishlist</p><strong className="mt-2 block text-3xl">{savedPackages.length}</strong></div>
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="section-card p-6">
          <h2 className="text-2xl font-semibold">Recent Bookings</h2>
          <div className="mt-6 space-y-4">
            {bookings.slice(0, 3).map((booking) => (
              <article key={booking.id} className="travel-card p-5">
                <h3 className="text-xl font-semibold">{booking.package?.title || booking.destination}</h3>
                <p className="mt-2 text-sm text-slate-600">{booking.startDate} to {booking.endDate} • {booking.reference}</p>
              </article>
            ))}
            {!bookings.length ? <p className="text-sm text-slate-600">No bookings yet.</p> : null}
          </div>
          <Link to="/dashboard/bookings" className="mt-6 inline-block text-sm font-semibold text-sky-700">View all bookings</Link>
        </div>

        <div className="section-card p-6">
          <h2 className="text-2xl font-semibold">Saved Packages</h2>
          <div className="mt-5 space-y-4">
            {savedPackages.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <span>{item.title}</span>
                <Link to={`/packages/${item.id}`} className="font-semibold text-sky-700">Open</Link>
              </div>
            ))}
            {!savedPackages.length ? <p className="text-sm text-slate-600">Save packages from the catalog to see them here.</p> : null}
          </div>
          <Link to="/dashboard/wishlist" className="mt-6 inline-block text-sm font-semibold text-sky-700">Open wishlist</Link>
        </div>
      </section>
    </>
  );
}

export default Dashboard;
