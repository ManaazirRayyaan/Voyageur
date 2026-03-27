const destinationPool = [
  {
    slug: "santorini",
    name: "Santorini",
    country: "Greece",
    category: "luxury",
    hero: "https://picsum.photos/seed/santorini-hero/1200/700",
    thumb: "https://picsum.photos/seed/santorini-card/700/500",
    lat: 36.3932,
    lng: 25.4615,
  },
  {
    slug: "bali",
    name: "Bali",
    country: "Indonesia",
    category: "adventure",
    hero: "https://picsum.photos/seed/bali-hero/1200/700",
    thumb: "https://picsum.photos/seed/bali-card/700/500",
    lat: -8.4095,
    lng: 115.1889,
  },
  {
    slug: "kyoto",
    name: "Kyoto",
    country: "Japan",
    category: "cultural",
    hero: "https://picsum.photos/seed/kyoto-hero/1200/700",
    thumb: "https://picsum.photos/seed/kyoto-card/700/500",
    lat: 35.0116,
    lng: 135.7681,
  },
  {
    slug: "dubai",
    name: "Dubai",
    country: "UAE",
    category: "luxury",
    hero: "https://picsum.photos/seed/dubai-hero/1200/700",
    thumb: "https://picsum.photos/seed/dubai-card/700/500",
    lat: 25.2048,
    lng: 55.2708,
  },
  {
    slug: "switzerland",
    name: "Zermatt",
    country: "Switzerland",
    category: "family",
    hero: "https://picsum.photos/seed/switzerland-hero/1200/700",
    thumb: "https://picsum.photos/seed/switzerland-card/700/500",
    lat: 46.0207,
    lng: 7.7491,
  },
  {
    slug: "varanasi",
    name: "Varanasi",
    country: "India",
    category: "religious",
    hero: "https://picsum.photos/seed/varanasi-hero/1200/700",
    thumb: "https://picsum.photos/seed/varanasi-card/700/500",
    lat: 25.3176,
    lng: 82.9739,
  },
  {
    slug: "langkawi",
    name: "Langkawi",
    country: "Malaysia",
    category: "family",
    hero: "https://picsum.photos/seed/langkawi-hero/1200/700",
    thumb: "https://picsum.photos/seed/langkawi-card/700/500",
    lat: 6.3500,
    lng: 99.8000,
  },
  {
    slug: "cappadocia",
    name: "Cappadocia",
    country: "Turkey",
    category: "adventure",
    hero: "https://picsum.photos/seed/cappadocia-hero/1200/700",
    thumb: "https://picsum.photos/seed/cappadocia-card/700/500",
    lat: 38.6431,
    lng: 34.8270,
  },
];

const packageNamePool = [
  "Sunset Escape",
  "Signature Journey",
  "Luxe Week",
  "Retreat Builder",
  "Heritage Circuit",
  "Adventure Trails",
  "Family Horizon",
  "Premium Discovery",
  "Island Reset",
  "Curated Voyage",
];

export const packages = Array.from({ length: 100 }, (_, index) => {
  const destination = destinationPool[index % destinationPool.length];
  const packageName = packageNamePool[index % packageNamePool.length];
  const price = 890 + (index % 10) * 180 + Math.floor(index / 8) * 35;
  const durationDays = 3 + (index % 8);
  const rating = Number((4 + ((index % 10) * 0.1)).toFixed(1));
  const id = `pkg-${index + 1}`;

  return {
    id,
    title: `${destination.name} ${packageName}`,
    destination: destination.name,
    destinationSlug: destination.slug,
    country: destination.country,
    description: `A premium ${destination.category} package blending standout stays, curated dining, and polished booking confidence for ${destination.name}.`,
    longDescription: `This itinerary is designed to feel like a premium SaaS travel flow in product form: transparent pricing, curated options, and smooth decision-making from browsing to booking for ${destination.name}, ${destination.country}.`,
    price,
    durationDays,
    rating: Math.min(rating, 5),
    category: destination.category,
    image: destination.thumb,
    heroImage: destination.hero,
    latitude: destination.lat,
    longitude: destination.lng,
    featured: index < 8,
    popular: index < 12 || index % 9 === 0,
    itinerary: [
      { title: "Day 1: Arrival and check-in", description: "Private transfer, suite arrival, and concierge orientation." },
      { title: "Day 2: Signature destination experience", description: `A curated activity built around ${destination.name}'s most in-demand highlights.` },
      { title: "Day 3: Flexible premium exploration", description: "Open schedule with recommended dining, shopping, or wellness upgrades." },
    ],
    includedItems: ["Accommodation", "Selected experience", "Local support", "Curated recommendations"],
    excludedItems: ["International airfare", "Visa fees", "Personal expenses", "Optional upgrades"],
    restaurants: ["Chef's Table", "Sunset Tasting Lounge", "Local Heritage Dining"],
    gallery: [
      destination.hero,
      `https://picsum.photos/seed/${id}-1/500/320`,
      `https://picsum.photos/seed/${id}-2/500/320`,
      `https://picsum.photos/seed/${id}-3/500/320`,
    ],
  };
});
