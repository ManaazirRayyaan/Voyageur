import PackageCard from "../components/PackageCard";
import FilterSidebar from "../components/FilterSidebar";
import { usePackages } from "../context/PackageContext";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";

function Packages() {
  const {
    filteredPackages,
    filters,
    setFilters,
    resetFilters,
    savedPackages,
    toggleSavedPackage,
    page,
    setPage,
    totalPages,
    totalCount,
    isLoading,
  } = usePackages();
  const { isAuthenticated } = useAuth();
  const { setSelectedPackage } = useBooking();
  const skeletons = Array.from({ length: 6 }, (_, index) => index);

  return (
    <main className="section-surface mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
      <section className="mb-10">
        <span className="badge-gradient inline-flex rounded-full px-4 py-2 text-sm font-semibold">{totalCount} packages found</span>
        <h1 className="font-display mt-4 text-4xl font-semibold">Search, filter, and compare travel packages.</h1>
      </section>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <FilterSidebar filters={filters} setFilters={setFilters} resetFilters={resetFilters} />

        <section>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? skeletons.map((item) => (
                <div key={item} className="section-card animate-pulse overflow-hidden lg:mx-auto lg:max-w-[350px]">
                  <div className="h-56 bg-slate-200" />
                  <div className="space-y-4 p-6">
                    <div className="h-4 w-20 rounded bg-slate-200" />
                    <div className="h-6 w-3/4 rounded bg-slate-200" />
                    <div className="h-4 w-1/2 rounded bg-slate-200" />
                    <div className="h-10 rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))
              : filteredPackages.map((item) => (
                <PackageCard
                  key={item.id}
                  item={item}
                  onSave={isAuthenticated ? (pkg) => { setSelectedPackage(pkg); toggleSavedPackage(pkg); } : undefined}
                  isSaved={savedPackages.some((saved) => saved.id === item.id)}
                />
              ))}
          </div>
          {!isLoading && !filteredPackages.length ? <p className="mt-6 text-sm text-slate-500">No packages match the current filters.</p> : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50">Previous</button>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">Page {page} of {totalPages}</span>
            <button type="button" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50">Next</button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Packages;
