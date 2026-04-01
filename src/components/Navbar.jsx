import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar({ transparent = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const classes = transparent
    ? `fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? "liquid-glass-nav shadow-[0_18px_50px_rgba(15,23,42,0.18)]" : "bg-transparent"}`
    : "glass-nav sticky top-0 z-50";

  useEffect(() => {
    if (!transparent) return undefined;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparent]);

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
      <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8 ${transparent && isScrolled ? "text-slate-900" : "text-white"}`}>
        <Link to="/" className="flex items-center gap-3">
          <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${transparent && isScrolled ? "bg-white/70 text-sky-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)]" : "bg-white/15"}`}><i className="fa-solid fa-compass" /></span>
          <div>
            <strong className="block text-lg">Voyageur</strong>
            <span className={`text-xs ${transparent && isScrolled ? "text-slate-500" : "text-slate-200"}`}>Travel Planner</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={transparent && isScrolled ? "text-slate-700" : ""}>
              {link.label}
            </NavLink>
          ))}
          {isAuthenticated ? <NavLink to="/dashboard" className={transparent && isScrolled ? "text-slate-700" : ""}>Dashboard</NavLink> : null}
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className={`rounded-full px-5 py-2.5 ${transparent && isScrolled ? "border border-slate-200 bg-white/60 text-slate-800" : "border border-white/20"}`}>Logout</button>
          ) : (
            <Link to="/login" className={`rounded-full px-5 py-2.5 ${transparent && isScrolled ? "border border-slate-200 bg-white/60 text-slate-800" : "border border-white/20"}`}>Sign In</Link>
          )}
        </nav>

        <button type="button" onClick={() => setIsOpen((prev) => !prev)} className={`rounded-2xl p-3 lg:hidden ${transparent && isScrolled ? "border border-slate-200 bg-white/60 text-slate-800" : "border border-white/20"}`}>
          <i className="fa-solid fa-bars" />
        </button>
      </div>

      {isOpen ? (
        <div className={`${transparent && isScrolled ? "border-t border-white/40 bg-white/75 text-slate-900 backdrop-blur-2xl" : "bg-slate-950/95 text-white"} px-4 py-4 lg:hidden`}>
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
