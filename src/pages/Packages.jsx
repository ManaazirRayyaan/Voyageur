import { useCallback, useEffect, useMemo, useState } from "react";
import PackageCard from "../components/PackageCard";
import FilterSidebar from "../components/FilterSidebar";
import { usePackages } from "../context/PackageContext";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "../context/BookingContext";

const ITEMS_PER_PAGE = 12;

function Packages() {
  const {
    filteredPackages,
    filters,
    setFilters,
    resetFilters,
    savedPackages,
    toggleSavedPackage,
    page,
    pageSize,
    shouldPaginate,
    setPage,
    totalPages,
    totalCount,
    isLoading,
    getPackageImage,
  } = usePackages();
  const { isAuthenticated } = useAuth();
  const { setSelectedPackage } = useBooking();
  const skeletons = Array.from({ length: shouldPaginate ? ITEMS_PER_PAGE : pageSize }, (_, index) => index);

  const displayedPackages = useMemo(
    () => (shouldPaginate ? filteredPackages.slice(0, ITEMS_PER_PAGE) : filteredPackages),
    [filteredPackages, shouldPaginate]
  );

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages]
  );

  const handleSavePackage = useCallback(
    (pkg) => {
      setSelectedPackage(pkg);
      toggleSavedPackage(pkg);
    },
    [setSelectedPackage, toggleSavedPackage]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    displayedPackages.forEach((pkg) => {
      getPackageImage(pkg.destination).then((src) => {
        const image = new window.Image();
        image.src = src;
      }).catch(() => {});
    });
  }, [displayedPackages, getPackageImage]);

  return (
    <main className="section-surface mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
      <section className="mb-10">
        <span className="badge-gradient inline-flex rounded-full px-4 py-2 text-sm font-semibold">{totalCount} packages found</span>
        <h1 className="font-display mt-4 text-4xl font-semibold">Search, filter, and compare travel packages.</h1>
      </section>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <FilterSidebar filters={filters} setFilters={setFilters} resetFilters={resetFilters} />

        <section>
          {isLoading && !filteredPackages.length ? (
            <div className="section-card mb-6 px-6 py-10 text-center text-slate-600 animate-pulse">Loading packages...</div>
          ) : null}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {isLoading && !filteredPackages.length
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
              : displayedPackages.map((item) => (
                <PackageCard
                  key={item.id}
                  item={item}
                  onSave={isAuthenticated ? handleSavePackage : undefined}
                  isSaved={savedPackages.some((saved) => saved.id === item.id)}
                />
              ))}
          </div>
          {!isLoading && !filteredPackages.length ? <p className="mt-6 text-sm text-slate-500">No packages match the current filters.</p> : null}
          {shouldPaginate ? (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50">Previous</button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${pageNumber === page ? "btn-primary" : "btn-secondary"}`}
                >
                  {pageNumber}
                </button>
              ))}
              <button type="button" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50">Next</button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default Packages;
