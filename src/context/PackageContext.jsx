import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiRequest } from "../utils/api";

const PackageContext = createContext(null);

const initialFilters = {
  query: "",
  destination: "",
  maxPrice: 5000,
  duration: "all",
  rating: 0,
  category: "",
  vibe: "",
};

export function PackageProvider({ children }) {
  const { tokens, isAuthenticated } = useAuth();
  const [packages, setPackages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [savedPackages, setSavedPackages] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedQuery, setDebouncedQuery] = useState(initialFilters.query);
  const [debouncedDestination, setDebouncedDestination] = useState(initialFilters.destination);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [filters.query, filters.destination, filters.maxPrice, filters.duration, filters.rating, filters.category, filters.vibe]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(filters.query), 250);
    return () => window.clearTimeout(timer);
  }, [filters.query]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedDestination(filters.destination), 250);
    return () => window.clearTimeout(timer);
  }, [filters.destination]);

  useEffect(() => {
    let active = true;
    async function loadPackages() {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        page_size: "10",
        max_price: String(filters.maxPrice),
      });
      if (debouncedQuery) params.set("query", debouncedQuery);
      if (debouncedDestination) params.set("destination", debouncedDestination);
      if (filters.duration && filters.duration !== "all") params.set("duration", filters.duration);
      if (filters.rating) params.set("rating", String(filters.rating));
      if (filters.category) params.set("category", filters.category);
      if (filters.vibe) params.set("vibe", filters.vibe);

      try {
        const data = await apiRequest(`/api/packages/?${params.toString()}`);
        if (!active) return;
        setPackages(data.results || []);
        setCount(data.count || 0);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadPackages();
    return () => {
      active = false;
    };
  }, [debouncedDestination, debouncedQuery, filters.category, filters.duration, filters.maxPrice, filters.rating, filters.vibe, page]);

  useEffect(() => {
    let active = true;
    apiRequest("/api/reviews/")
      .then((data) => {
        if (active) {
          const items = Array.isArray(data) ? data : data.results || [];
          setReviews(items);
        }
      })
      .catch(() => {
        if (active) setReviews([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadWishlist() {
      if (!isAuthenticated || !tokens?.access) {
        setSavedPackages([]);
        return;
      }
      const data = await apiRequest("/api/wishlist/", { token: tokens.access });
      if (active) setSavedPackages(data.map((item) => item.package));
    }
    loadWishlist().catch(() => {
      if (active) setSavedPackages([]);
    });
    return () => {
      active = false;
    };
  }, [isAuthenticated, tokens]);

  const totalPages = Math.max(Math.ceil(count / 10), 1);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1));
  }, [reviews]);

  const value = useMemo(
    () => ({
      packages,
      filteredPackages: packages,
      featuredPackages: packages.filter((pkg) => pkg.featured).slice(0, 6),
      popularPackages: packages.filter((pkg) => pkg.popular).slice(0, 6),
      topDestinations: Array.from(new Map(packages.map((pkg) => [pkg.destinationSlug, pkg])).values()).slice(0, 4),
      filters,
      setFilters,
      isLoading,
      page,
      totalPages,
      totalCount: count,
      setPage,
      resetFilters() {
        setFilters(initialFilters);
      },
      getPackageById(id) {
        return packages.find((pkg) => String(pkg.id) === String(id));
      },
      async fetchPackageDetail(id) {
        return apiRequest(`/api/packages/${id}/`);
      },
      reviews,
      averageRating,
      savedPackages,
      async toggleSavedPackage(packageItem) {
        if (!tokens?.access) return;
        const exists = savedPackages.some((saved) => saved.id === packageItem.id);
        if (exists) {
          await apiRequest(`/api/wishlist/remove/?package_id=${packageItem.id}`, {
            method: "DELETE",
            token: tokens.access,
          });
          setSavedPackages((prev) => prev.filter((saved) => saved.id !== packageItem.id));
        } else {
          await apiRequest("/api/wishlist/add/", {
            method: "POST",
            token: tokens.access,
            body: { package_id: packageItem.id },
          });
          setSavedPackages((prev) => [packageItem, ...prev]);
        }
      },
      async addReview(review) {
        if (!tokens?.access) {
          throw new Error("Please log in to submit a review.");
        }
        const created = await apiRequest("/api/reviews/", {
          method: "POST",
          token: tokens.access,
          body: review,
        });
        setReviews((prev) => [created, ...prev]);
        return created;
      },
    }),
    [averageRating, count, filters, isLoading, page, packages, reviews, savedPackages, tokens, totalPages]
  );

  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
}

export function usePackages() {
  return useContext(PackageContext);
}
