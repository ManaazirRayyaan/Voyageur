import { Link, useLocation } from "react-router-dom";

function BackButton() {
  const location = useLocation();
  if (location.pathname === "/") return null;

  return (
    <Link
      to="/"
      className="fixed left-4 top-24 z-50 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_14px_30px_rgba(15,23,42,0.12)] backdrop-blur"
    >
      <i className="fa-solid fa-arrow-left" />
      <span>Back</span>
    </Link>
  );
}

export default BackButton;
