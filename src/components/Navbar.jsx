import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar({ transparent = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const classes = transparent ? "fixed inset-x-0 top-0 z-50 transition-all duration-300 bg-transparent" : "glass-nav sticky top-0 z-50";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const links = [
    { to: "/packages", label: "Packages" },
    { to: "/custom-trip", label: "Custom Trips" },
    { to: "/customers", label: "Reviews" },
  ];

  return (
    <header className={classes}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-white sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15"><i className="fa-solid fa-compass" /></span>
          <div>
            <strong className="block text-lg">Voyageur</strong>
            <span className="text-xs text-slate-200">Travel Planner</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? <NavLink to="/dashboard">Dashboard</NavLink> : null}
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="rounded-full border border-white/20 px-5 py-2.5">Logout</button>
          ) : (
            <Link to="/login" className="rounded-full border border-white/20 px-5 py-2.5">Sign In</Link>
          )}
        </nav>

        <button type="button" onClick={() => setIsOpen((prev) => !prev)} className="rounded-2xl border border-white/20 p-3 lg:hidden">
          <i className="fa-solid fa-bars" />
        </button>
      </div>

      {isOpen ? (
        <div className="bg-slate-950/95 px-4 py-4 text-white lg:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link> : null}
            {isAuthenticated ? (
              <button type="button" onClick={handleLogout} className="text-left">Logout</button>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
