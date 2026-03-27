import { Link } from "react-router-dom";
import { usePackages } from "../context/PackageContext";

function DashboardWishlist() {
  const { savedPackages } = usePackages();

  return (
    <section className="section-card p-6">
      <h2 className="text-2xl font-semibold">Wishlist</h2>
      <div className="mt-6 grid gap-4">
        {savedPackages.length ? savedPackages.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <span>{item.title}</span>
            <Link to={`/packages/${item.id}`} className="font-semibold text-sky-700">Open</Link>
          </div>
        )) : <p className="text-sm text-slate-600">Your wishlist is empty.</p>}
      </div>
    </section>
  );
}

export default DashboardWishlist;
