import { memo } from "react";

function FilterSidebar({ filters, setFilters, resetFilters }) {
  return (
    <aside className="section-card h-fit p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button type="button" onClick={resetFilters} className="text-sm font-semibold text-sky-700">Reset</button>
      </div>

      <div className="space-y-8">
        <div>
          <div className="mb-3 flex items-center justify-between"><span className="font-medium">Price Range</span><span className="text-sm text-slate-500">${filters.maxPrice}</span></div>
          <input type="range" min="500" max="5000" step="100" value={filters.maxPrice} onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))} className="filter-range w-full" />
        </div>

        <input type="text" placeholder="Search packages" value={filters.query} onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
        <input type="text" placeholder="Destination" value={filters.destination} onChange={(e) => setFilters((prev) => ({ ...prev, destination: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />

        <div>
          <label className="mb-2 block font-medium">Duration</label>
          <select value={filters.duration} onChange={(e) => setFilters((prev) => ({ ...prev, duration: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none">
            <option value="all">All durations</option>
            <option value="short">1-4 days</option>
            <option value="medium">5-8 days</option>
            <option value="long">9+ days</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">Minimum Rating</label>
          <select value={filters.rating} onChange={(e) => setFilters((prev) => ({ ...prev, rating: Number(e.target.value) }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none">
            <option value="0">Any rating</option>
            <option value="3">3 stars</option>
            <option value="4">4 stars</option>
            <option value="4.5">4.5 stars</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block font-medium">Category</label>
          <select value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none">
            <option value="">All categories</option>
            <option value="luxury">Luxury</option>
            <option value="family">Family</option>
            <option value="adventure">Adventure</option>
            <option value="budget">Budget</option>
            <option value="cultural">Cultural</option>
            <option value="religious">Religious</option>
          </select>
        </div>
      </div>
    </aside>
  );
}

export default memo(FilterSidebar);
