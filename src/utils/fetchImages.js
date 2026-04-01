const FALLBACK_IMAGE = "https://placehold.co/600x400?text=Travel";
const imageCache = new Map();

export const getFallbackImages = (count = 1, image = FALLBACK_IMAGE) => Array.from({ length: count }, () => image);

export const getImage = (destination) =>
  `https://source.unsplash.com/400x250/?${encodeURIComponent(destination || "travel")},travel`;

export const fetchImages = async (destination, perPage = 6) => {
  const normalizedDestination = String(destination || "").trim();
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  const cacheKey = `${normalizedDestination.toLowerCase()}::${perPage}`;

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey);
  }

  if (!normalizedDestination || !accessKey || accessKey === "YOUR_ACCESS_KEY") {
    const fallbackImages = getFallbackImages(perPage, getImage(normalizedDestination));
    imageCache.set(cacheKey, fallbackImages);
    return fallbackImages;
  }

  try {
    const params = new URLSearchParams({
      query: normalizedDestination,
      per_page: String(perPage),
      client_id: accessKey,
      orientation: "landscape",
    });

    const response = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Unsplash request failed with status ${response.status}`);
    }

    const data = await response.json();
    const images = (data.results || []).map((img) => img.urls?.small || img.urls?.regular).filter(Boolean);
    const finalImages = images.length ? images : getFallbackImages(perPage, getImage(normalizedDestination));
    imageCache.set(cacheKey, finalImages);
    return finalImages;
  } catch (error) {
    console.error("Image fetch error:", error);
    const fallbackImages = getFallbackImages(perPage, getImage(normalizedDestination));
    imageCache.set(cacheKey, fallbackImages);
    return fallbackImages;
  }
};

export { FALLBACK_IMAGE };
