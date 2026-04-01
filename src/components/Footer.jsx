import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="section-surface border-t border-slate-200/70 bg-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white"><i className="fa-solid fa-compass" /></span>
            <div>
              <p className="font-bold">Voyageur</p>
              <p className="text-sm text-slate-500">Premium travel planner</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">Plan smarter. Travel better. Explore the world with confidence.</p>
        </div>
        <div>
          <h3 className="font-semibold">Explore</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><Link to="/packages">Packages</Link></li>
            <li><Link to="/custom-trip">Custom Builder</Link></li>
            <li><Link to="/customers">Customer Reviews</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Account</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Media</h3>
          <div className="mt-4 flex gap-3 text-slate-600">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><i className="fa-brands fa-instagram" /></span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><i className="fa-brands fa-facebook-f" /></span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100"><i className="fa-brands fa-x-twitter" /></span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
