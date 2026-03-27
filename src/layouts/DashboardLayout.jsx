import { NavLink, Outlet, useLocation } from "react-router-dom";
import BackButton from "../components/BackButton";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const titles = {
  "/dashboard": "Overview",
  "/dashboard/bookings": "Bookings",
  "/dashboard/wishlist": "Wishlist",
  "/dashboard/profile": "Profile",
  "/dashboard/create-trip": "Create Trip",
};

function DashboardLayout() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const title = titles[location.pathname] || "Dashboard";

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col">
        <Navbar />
        <BackButton />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <section className="section-card w-full max-w-2xl p-8 text-center">
            <h1 className="font-display text-4xl font-semibold">Sign in to view your dashboard</h1>
            <p className="mt-4 text-sm text-slate-600">Your bookings, wishlist, profile settings, and trip builder are available after login.</p>
            <NavLink to="/login" className="btn-primary mt-6 inline-block rounded-full px-6 py-3 text-sm font-semibold">Login</NavLink>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <BackButton />
      <div className="flex min-h-0 flex-1">
        <aside className="dashboard-sidebar w-[280px] shrink-0 p-6 text-white">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><i className="fa-solid fa-compass" /></span>
            <div><strong className="block text-lg">Voyageur</strong><span className="text-sm text-slate-300">Traveler dashboard</span></div>
          </NavLink>
          <nav className="mt-10 space-y-3 text-sm font-medium">
            <NavLink to="/dashboard" end className={({ isActive }) => `block rounded-2xl px-4 py-3 ${isActive ? "bg-white/10" : "hover:bg-white/10"}`}>Overview</NavLink>
            <NavLink to="/dashboard/bookings" className={({ isActive }) => `block rounded-2xl px-4 py-3 ${isActive ? "bg-white/10" : "hover:bg-white/10"}`}>Bookings</NavLink>
            <NavLink to="/dashboard/wishlist" className={({ isActive }) => `block rounded-2xl px-4 py-3 ${isActive ? "bg-white/10" : "hover:bg-white/10"}`}>Wishlist</NavLink>
            <NavLink to="/dashboard/profile" className={({ isActive }) => `block rounded-2xl px-4 py-3 ${isActive ? "bg-white/10" : "hover:bg-white/10"}`}>Profile</NavLink>
            <NavLink to="/dashboard/create-trip" className={({ isActive }) => `block rounded-2xl px-4 py-3 ${isActive ? "bg-white/10" : "hover:bg-white/10"}`}>Create Trip</NavLink>
          </nav>
        </aside>

        <section className="flex min-h-0 flex-1 flex-col bg-slate-50/60">
          <div className="dashboard-topbar border-b border-slate-200 bg-white/85 px-6 backdrop-blur">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Dashboard</p>
              <h1 className="font-display mt-2 text-4xl font-semibold">{title}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Signed in as</p>
              <p className="font-semibold text-slate-900">{user?.name || user?.username}</p>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardLayout;
