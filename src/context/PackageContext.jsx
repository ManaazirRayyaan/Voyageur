import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiRequest } from "../utils/api";
import { fetchImages, getFallbackImages, getImage } from "../utils/fetchImages";

const PackageContext = createContext(null);
const PAGINATED_PAGE_SIZE = 12;
const UNPAGINATED_PAGE_SIZE = 30;
const PACKAGE_CACHE_TTL_MS = 60 * 1000;

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
  const [imageCache, setImageCache] = useState({});
  const imagePromiseCache = useRef({});
  const packageListCache = useRef({});
  const packageDetailCache = useRef({});
  const [pageSize, setPageSize] = useState(PAGINATED_PAGE_SIZE);
  const filteredPackages = useMemo(() => packages, [packages]);

  function resolveImageCacheKey(destination, count = 6) {
    return `${String(destination || "").toLowerCase()}::${count}`;
  }

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
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
        max_price: String(filters.maxPrice),
      });
      if (debouncedQuery) params.set("query", debouncedQuery);
      if (debouncedDestination) params.set("destination", debouncedDestination);
      if (filters.duration && filters.duration !== "all") params.set("duration", filters.duration);
      if (filters.rating) params.set("rating", String(filters.rating));
      if (filters.category) params.set("category", filters.category);
      if (filters.vibe) params.set("vibe", filters.vibe);
      const requestKey = params.toString();

      const cachedListEntry = packageListCache.current[requestKey];
      if (cachedListEntry && Date.now() - cachedListEntry.timestamp < PACKAGE_CACHE_TTL_MS) {
        const cached = cachedListEntry.data;
        if (!active) return;
        setPackages(cached.results || []);
        setCount(cached.count || 0);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const data = await apiRequest(`/api/packages/?${params.toString()}`);
        if (!active) return;
        packageListCache.current[requestKey] = {
          data,
          timestamp: Date.now(),
        };
        setPackages(data.results || []);
        setCount(data.count || 0);

        const nextPageSize = data.count >= 30 ? PAGINATED_PAGE_SIZE : UNPAGINATED_PAGE_SIZE;
        if (nextPageSize !== pageSize) {
          setPage(1);
          setPageSize(nextPageSize);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadPackages();
    return () => {
      active = false;
    };
  }, [debouncedDestination, debouncedQuery, filters.category, filters.duration, filters.maxPrice, filters.rating, filters.vibe, page, pageSize]);

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

  const totalPages = Math.max(Math.ceil(count / pageSize), 1);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1));
  }, [reviews]);
  const shouldPaginate = count >= 30;

  async function fetchDestinationImagesShared(destination, count = 6) {
    const cacheKey = resolveImageCacheKey(destination, count);
    if (imageCache[cacheKey]?.length) {
      return imageCache[cacheKey];
    }
    if (imagePromiseCache.current[cacheKey]) {
      return imagePromiseCache.current[cacheKey];
    }

    imagePromiseCache.current[cacheKey] = fetchImages(destination, count)
      .then((images) => {
        setImageCache((prev) => ({ ...prev, [cacheKey]: images }));
        delete imagePromiseCache.current[cacheKey];
        return images;
      })
      .catch(() => {
        const fallbackImages = getFallbackImages(count, getImage(destination));
        setImageCache((prev) => ({ ...prev, [cacheKey]: fallbackImages }));
        delete imagePromiseCache.current[cacheKey];
        return fallbackImages;
      });

    return imagePromiseCache.current[cacheKey];
  }

  async function getPackageImageShared(destination) {
    const images = await fetchDestinationImagesShared(destination, 6);
    return images[0] || getImage(destination);
  }

  const value = useMemo(
    () => ({
      packages,
      filteredPackages,
      featuredPackages: packages.filter((pkg) => pkg.featured).slice(0, 6),
      popularPackages: packages.filter((pkg) => pkg.popular).slice(0, 6),
      topDestinations: Array.from(new Map(packages.map((pkg) => [pkg.destinationSlug, pkg])).values()).slice(0, 4),
      filters,
      setFilters,
      isLoading,
      page,
      pageSize,
      shouldPaginate,
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
        const detailKey = String(id);
        const cachedDetailEntry = packageDetailCache.current[detailKey];
        if (cachedDetailEntry && Date.now() - cachedDetailEntry.timestamp < PACKAGE_CACHE_TTL_MS) {
          return cachedDetailEntry.data;
        }
        const data = await apiRequest(`/api/packages/${id}/`);
        packageDetailCache.current[detailKey] = {
          data,
          timestamp: Date.now(),
        };
        return data;
      },
      refreshPackages() {
        packageListCache.current = {};
        setPage(1);
      },
      imageCache,
      fetchDestinationImages: fetchDestinationImagesShared,
      getPackageImage: getPackageImageShared,
      preloadPackageImages(destinations) {
        destinations.forEach((destination) => {
          fetchDestinationImagesShared(destination, 1).catch(() => {});
        });
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
    [averageRating, count, filteredPackages, filters, imageCache, isLoading, page, packages, pageSize, reviews, savedPackages, shouldPaginate, tokens, totalPages]
  );

  return <PackageContext.Provider value={value}>{children}</PackageContext.Provider>;
}

export function usePackages() {
  return useContext(PackageContext);
}
