import { Link, useNavigate } from "react-router-dom";
import PackageCard from "../components/PackageCard";
import ReviewCard from "../components/ReviewCard";
import { usePackages } from "../context/PackageContext";

function Home() {
  const navigate = useNavigate();
  const { popularPackages, topDestinations, reviews, totalCount, setFilters } = usePackages();

  const handleSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFilters((prev) => ({
      ...prev,
      query: formData.get("query")?.toString() || "",
      destination: formData.get("destination")?.toString() || "",
      maxPrice: Number(formData.get("budget") || 5000),
    }));
    navigate("/packages");
  };

  return (
    <main className="section-surface">
      <section className="relative min-h-screen overflow-hidden">
        <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80" alt="Ocean destination" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="badge-gradient inline-flex rounded-full px-4 py-2 text-sm font-semibold">{reviews.length}+ verified traveler reviews across {totalCount}+ curated packages</span>
            <h1 className="font-display mt-6 text-5xl font-semibold leading-tight text-white md:text-6xl">Plan signature journeys with one polished travel workspace.</h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-100">From curated packages to custom itineraries, Voyageur turns discovery, booking, and trip coordination into one high-conviction experience.</p>
          </div>

          <form onSubmit={handleSearch} className="search-panel mt-10 grid gap-4 rounded-[2rem] p-4 md:grid-cols-4 md:items-end md:p-5">
            <label className="field rounded-3xl px-5 py-4">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search</span>
              <input name="query" type="text" placeholder="Luxury escape, family getaway..." className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" />
            </label>
            <label className="field rounded-3xl px-5 py-4">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Destination</span>
              <input name="destination" type="text" placeholder="Santorini, Kyoto, Dubai..." className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400" />
            </label>
            <label className="field rounded-3xl px-5 py-4">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Budget</span>
              <input name="budget" type="number" defaultValue="2500" min="100" className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none" />
            </label>
            <button type="submit" className="btn-primary rounded-3xl px-6 py-4 text-sm font-semibold">Search Premium Escapes</button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">Featured Destinations</p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-slate-900">Global escapes with standout demand.</h2>
          </div>
          <Link to="/packages" className="text-sm font-semibold text-sky-700">View all packages</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {topDestinations.map((item) => (
            <article key={item.destinationSlug} className="travel-card overflow-hidden">
              <div className="h-72"><img src={item.image} alt={item.destination} className="media-cover" loading="lazy" /></div>
              <div className="p-6">
                <p className="text-sm text-slate-500">{item.country}</p>
                <h3 className="mt-2 text-xl font-semibold">{item.destination}</h3>
                <p className="mt-3 text-sm text-slate-600">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-center justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">Popular Packages</p>
            <h2 className="font-display mt-2 text-3xl font-semibold">High-conversion itineraries travelers book fastest.</h2>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {popularPackages.slice(0, 3).map((item) => <PackageCard key={item.id} item={item} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="section-card p-8 lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">Travel Categories</p>
              <h2 className="font-display mt-2 text-3xl font-semibold">Intent-led planning for every traveler profile.</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {["Adventure", "Family", "Luxury", "Budget", "Cultural", "Religious"].map((category) => (
                <button key={category} type="button" onClick={() => { setFilters((prev) => ({ ...prev, category: category.toLowerCase() })); navigate("/packages"); }} className="category-pill rounded-full px-5 py-3 text-sm font-semibold">
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700">Testimonials</p>
            <h2 className="font-display mt-2 text-3xl font-semibold">Social proof with premium credibility.</h2>
          </div>
          <Link to="/customers" className="text-sm font-semibold text-sky-700">See all customer stories</Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {reviews.slice(0, 3).map((review) => <ReviewCard key={review.id} review={review} />)}
        </div>
      </section>
    </main>
  );
}

export default Home;
