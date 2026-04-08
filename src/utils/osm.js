const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const OVERPASS_BASE = "https://overpass-api.de/api/interpreter";

function jsonHeaders() {
  return {
    Accept: "application/json",
  };
}

export function loadLeaflet() {
  if (window.L) {
    return Promise.resolve(window.L);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="leaflet"]');
    if (!existing) {
      reject(new Error("Leaflet is not available on the page."));
      return;
    }
    existing.addEventListener("load", () => resolve(window.L));
    existing.addEventListener("error", () => reject(new Error("Leaflet failed to load.")));
  });
}

export async function searchPlaces(query) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "6",
    addressdetails: "1",
  });
  const response = await fetch(`${NOMINATIM_BASE}/search?${params.toString()}`, { headers: jsonHeaders() });
  if (!response.ok) {
    throw new Error("Place search failed.");
  }
  return response.json();
}

export async function reverseGeocode(latitude, longitude) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: "jsonv2",
    addressdetails: "1",
  });
  const response = await fetch(`${NOMINATIM_BASE}/reverse?${params.toString()}`, { headers: jsonHeaders() });
  if (!response.ok) {
    throw new Error("Reverse geocoding failed.");
  }
  return response.json();
}

function normaliseFeature(feature, index, fallbackLabel) {
  const tags = feature.tags || {};
  return {
    id: `${feature.type}-${feature.id}-${index}`,
    name: tags.name || tags.brand || tags.operator || fallbackLabel,
    address:
      [
        tags["addr:street"],
        tags["addr:city"],
        tags["addr:state"],
      ]
        .filter(Boolean)
        .join(", ") || tags.description || "Mapped nearby location",
    latitude: feature.lat || feature.center?.lat,
    longitude: feature.lon || feature.center?.lon,
    rating: 4.2 + (index % 4) * 0.2,
    tags,
  };
}

async function overpassQuery(query) {
  const response = await fetch(OVERPASS_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/json",
    },
    body: query,
  });
  if (!response.ok) {
    throw new Error("Nearby place search failed.");
  }
  const data = await response.json();
  return data.elements || [];
}

export async function fetchNearbyTripOptions(latitude, longitude) {
  const around = 12000;
  const airportAround = 60000;
  const query = `
[out:json][timeout:25];
(
  node(around:${around},${latitude},${longitude})["tourism"="hotel"];
  way(around:${around},${latitude},${longitude})["tourism"="hotel"];
  node(around:${around},${latitude},${longitude})["amenity"="hotel"];
  way(around:${around},${latitude},${longitude})["amenity"="hotel"];

  node(around:${airportAround},${latitude},${longitude})["aeroway"="aerodrome"];
  way(around:${airportAround},${latitude},${longitude})["aeroway"="aerodrome"];

  node(around:${around},${latitude},${longitude})["amenity"="bus_station"];
  node(around:${around},${latitude},${longitude})["amenity"="taxi"];
  node(around:${around},${latitude},${longitude})["railway"="station"];
  node(around:${around},${latitude},${longitude})["public_transport"="station"];

  node(around:${around},${latitude},${longitude})["tourism"="attraction"];
  node(around:${around},${latitude},${longitude})["tourism"="museum"];
  node(around:${around},${latitude},${longitude})["tourism"="viewpoint"];
  node(around:${around},${latitude},${longitude})["leisure"="park"];
);
out center 12;
`;

  const features = await overpassQuery(query);
  const hotels = features
    .filter((item) => ["hotel"].includes(item.tags?.tourism) || item.tags?.amenity === "hotel")
    .slice(0, 6)
    .map((item, index) => ({
      ...normaliseFeature(item, index, "Selected stay"),
      pricePerNight: 160 + index * 35,
    }));

  const flights = features
    .filter((item) => item.tags?.aeroway === "aerodrome")
    .slice(0, 5)
    .map((item, index) => ({
      ...normaliseFeature(item, index, "Airport hub"),
      type: "flight",
      price: 260 + index * 80,
    }));

  const transports = features
    .filter((item) => ["bus_station", "taxi"].includes(item.tags?.amenity) || ["station"].includes(item.tags?.railway) || ["station"].includes(item.tags?.public_transport))
    .slice(0, 5)
    .map((item, index) => ({
      ...normaliseFeature(item, index, "Transfer option"),
      type: "car",
      price: 45 + index * 20,
    }));

  const activities = features
    .filter((item) => ["attraction", "museum", "viewpoint"].includes(item.tags?.tourism) || item.tags?.leisure === "park")
    .slice(0, 8)
    .map((item, index) => ({
      ...normaliseFeature(item, index, "Local experience"),
      price: 50 + index * 18,
    }));

  return {
    hotels,
    flights,
    transports,
    activities,
  };
}
