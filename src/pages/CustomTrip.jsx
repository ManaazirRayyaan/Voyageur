import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../components/Stepper";
import WeatherBadge from "../components/WeatherBadge";
import { useBooking } from "../context/BookingContext";
import { fetchNearbyTripOptions, loadLeaflet, reverseGeocode, searchPlaces } from "../utils/osm";
import { getNights } from "../utils/pricing";

const steps = ["Destination", "Dates", "Flights", "Hotels", "Activities", "Review"];
const defaultCenter = { lat: 20.5937, lng: 78.9629 };

function extractCountry(place) {
  return place.address?.country || place.display_name?.split(",").at(-1)?.trim() || "Selected via map";
}

function createDestinationPayload(place) {
  return {
    name: place.name || place.display_name?.split(",")[0] || "Selected Destination",
    formattedAddress: place.display_name || place.address || place.name,
    country: extractCountry(place),
    latitude: Number(place.lat || place.latitude),
    longitude: Number(place.lon || place.longitude),
    placeId: String(place.place_id || place.id || `${place.lat}-${place.lon}`),
    rating: place.rating || 4.5,
  };
}

function CustomTrip() {
  const navigate = useNavigate();
  const { createBooking } = useBooking();
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const leafletRef = useRef(null);

  const [activeStep, setActiveStep] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [error, setError] = useState("");
  const [options, setOptions] = useState({
    flights: [],
    transports: [],
    hotels: [],
    activities: [],
  });
  const [builder, setBuilder] = useState({
    destination: null,
    startDate: "2026-10-12",
    endDate: "2026-10-18",
    flight: null,
    transport: null,
    hotel: null,
    activities: [],
  });

  useEffect(() => {
    let active = true;
    loadLeaflet()
      .then((leaflet) => {
        if (!active || !mapElementRef.current) return;
        leafletRef.current = leaflet;
        const map = leaflet.map(mapElementRef.current, {
          zoomControl: true,
        }).setView([defaultCenter.lat, defaultCenter.lng], 4);
        leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);
        mapRef.current = map;
        markerRef.current = leaflet.marker([defaultCenter.lat, defaultCenter.lng]).addTo(map);
        map.on("click", async (event) => {
          const geocodeResult = await reverseGeocode(event.latlng.lat, event.latlng.lng);
          if (geocodeResult) {
            selectDestination(geocodeResult);
          }
        });
        setIsMapReady(true);
      })
      .catch((err) => {
        if (active) {
          setMapError(err.message || "Map failed to load.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  async function fetchNearbyOptions(destination) {
    setIsLoadingNearby(true);
    try {
      const nearby = await fetchNearbyTripOptions(destination.latitude, destination.longitude);
      const hotels = nearby.hotels;
      const flights = nearby.flights;
      const transports = [
        ...nearby.transports,
        {
          id: "private-chauffeur",
          name: `${destination.name} private chauffeur`,
          address: "Premium private arrival and intercity transfer",
          price: 120,
          rating: 4.9,
          type: "car",
        },
      ];
      const activities = nearby.activities;

      setOptions({ hotels, flights, transports, activities });
      setBuilder((prev) => ({
        ...prev,
        flight: flights[0] || null,
        transport: transports[0] || null,
        hotel: hotels[0] || null,
        activities: activities.slice(0, 2),
      }));
    } finally {
      setIsLoadingNearby(false);
    }
  }

  async function selectDestination(place) {
    const destination = createDestinationPayload(place);
    setBuilder((prev) => ({
      ...prev,
      destination,
      flight: null,
      transport: null,
      hotel: null,
      activities: [],
    }));
      setSearchQuery(destination.name);
      setSearchResults([]);

      if (mapRef.current && markerRef.current) {
        const position = [destination.latitude, destination.longitude];
        markerRef.current.setLatLng(position);
        markerRef.current.bindPopup(destination.name).openPopup();
        mapRef.current.setView(position, 11);
      }

      await fetchNearbyOptions(destination);
  }

  async function handleSearch(event) {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    setError("");
    setIsSearching(true);
    try {
      const results = await searchPlaces(searchQuery.trim());
      setSearchResults(results.slice(0, 6));
      if (results[0]) {
        await selectDestination(results[0]);
      }
    } catch (err) {
      setError(err.message || "Search failed.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  const nights = useMemo(() => getNights(builder.startDate, builder.endDate), [builder.startDate, builder.endDate]);
  const basePrice = useMemo(() => {
    if (!builder.destination) return 0;
    return Math.max(280, Math.round((builder.destination.rating || 4.5) * 95));
  }, [builder.destination]);
  const hotelTotal = useMemo(() => Number(builder.hotel?.pricePerNight || 0) * nights, [builder.hotel, nights]);
  const flightTotal = Number(builder.flight?.price || 0);
  const localTransportTotal = Number(builder.transport?.price || 0);
  const activitiesTotal = useMemo(
    () => builder.activities.reduce((sum, item) => sum + Number(item.price || 0), 0),
    [builder.activities]
  );
  const foodTotal = useMemo(() => Math.max(90, nights * 35), [nights]);
  const total = useMemo(
    () => (basePrice + hotelTotal + flightTotal + localTransportTotal + activitiesTotal + foodTotal) * 2,
    [activitiesTotal, basePrice, flightTotal, foodTotal, hotelTotal, localTransportTotal]
  );

  const handleNext = async () => {
    setError("");
    if (!builder.destination) {
      setError("Select a destination from the map or search first.");
      return;
    }
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      return;
    }
    try {
      const booking = await createBooking({
        travelers: 2,
        startDate: builder.startDate,
        endDate: builder.endDate,
        customDestination: builder.destination,
        customHotel: builder.hotel,
        customFlight: builder.flight,
        customTransport: builder.transport,
        customLocalTransport: builder.transport,
        customActivities: builder.activities,
        customNotes: builder.activities.map((activity) => activity.name).join(", "),
        pricing: {
          basePrice,
          flightTotal,
          activitiesTotal,
          foodTotal,
          localTransportTotal,
        },
      });
      navigate("/booking-confirmation", { state: { bookingId: booking.id } });
    } catch (err) {
      setError(err.payload?.detail || err.payload?.error || err.message || "Booking failed.");
    }
  };

  const toggleActivity = (activity) => {
    setBuilder((prev) => ({
      ...prev,
      activities: prev.activities.some((item) => item.id === activity.id)
        ? prev.activities.filter((item) => item.id !== activity.id)
        : [...prev.activities, activity],
    }));
  };

  const stepContent = [
    <div key="destination" className="space-y-5">
      <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search any city, landmark, island, or region"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />
        <button type="submit" className="btn-primary rounded-2xl px-5 py-3 text-sm font-semibold">
          {isSearching ? "Searching..." : "Search destination"}
        </button>
      </form>
      <div className="space-y-3">
        <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
          <strong className="block text-base text-slate-900">Map-first planning</strong>
          <p className="mt-2">Click anywhere on the OpenStreetMap panel or search for a place here. The selected location becomes available immediately for hotels, flights, transport, weather, and activities.</p>
        </div>
        {searchResults.map((result) => {
          const destination = createDestinationPayload(result);
          return (
            <button
              key={result.place_id}
              type="button"
              onClick={() => selectDestination(result)}
              className={`step-card w-full rounded-3xl p-4 text-left ${
                builder.destination?.placeId === destination.placeId ? "selected" : ""
              }`}
            >
              <p className="font-semibold">{destination.name}</p>
              <p className="mt-1 text-sm text-slate-600">{destination.formattedAddress}</p>
            </button>
          );
        })}
      </div>
      {builder.destination ? (
        <div className="rounded-3xl bg-slate-50 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Selected destination</p>
              <h3 className="mt-1 text-2xl font-semibold">{builder.destination.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{builder.destination.formattedAddress}</p>
            </div>
            <WeatherBadge latitude={builder.destination.latitude} longitude={builder.destination.longitude} />
          </div>
        </div>
      ) : null}
    </div>,
    <div key="dates" className="grid gap-4 md:grid-cols-2">
      <label className="rounded-3xl bg-slate-50 p-5">
        <span className="mb-2 block text-sm font-medium text-slate-500">Start date</span>
        <input type="date" value={builder.startDate} onChange={(e) => setBuilder((prev) => ({ ...prev, startDate: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
      </label>
      <label className="rounded-3xl bg-slate-50 p-5">
        <span className="mb-2 block text-sm font-medium text-slate-500">End date</span>
        <input type="date" value={builder.endDate} onChange={(e) => setBuilder((prev) => ({ ...prev, endDate: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
      </label>
    </div>,
    <div key="flights" className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        {(options.flights.length ? options.flights : [{ id: "none", name: "No nearby airport returned", address: "Search another destination to refresh nearby flight hubs.", price: 0 }]).map((flight) => (
          <button
            key={flight.id}
            type="button"
            onClick={() => flight.price && setBuilder((prev) => ({ ...prev, flight }))}
            className={`step-card rounded-3xl p-5 text-left ${builder.flight?.id === flight.id ? "selected" : ""}`}
          >
            <p className="font-semibold">{flight.name}</p>
            <p className="mt-2 text-sm text-slate-600">{flight.address}</p>
            <strong className="mt-4 block text-lg">${flight.price}</strong>
          </button>
        ))}
      </div>
      <div>
        <h3 className="text-lg font-semibold">Local transport from the map</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {options.transports.map((transport) => (
            <button
              key={transport.id}
              type="button"
              onClick={() => setBuilder((prev) => ({ ...prev, transport }))}
              className={`step-card rounded-3xl p-5 text-left ${builder.transport?.id === transport.id ? "selected" : ""}`}
            >
              <p className="font-semibold">{transport.name}</p>
              <p className="mt-2 text-sm text-slate-600">{transport.address}</p>
              <strong className="mt-4 block text-lg">${transport.price}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>,
    <div key="hotels" className="grid gap-4 md:grid-cols-2">
      {options.hotels.map((hotel) => (
        <button
          key={hotel.id}
          type="button"
          onClick={() => setBuilder((prev) => ({ ...prev, hotel }))}
          className={`step-card rounded-3xl p-5 text-left ${builder.hotel?.id === hotel.id ? "selected" : ""}`}
        >
          <p className="font-semibold">{hotel.name}</p>
          <p className="mt-2 text-sm text-slate-600">{hotel.address}</p>
          <p className="mt-3 text-sm text-slate-500">Google rating {hotel.rating}/5</p>
          <strong className="mt-4 block text-lg">${hotel.pricePerNight}/night</strong>
        </button>
      ))}
    </div>,
    <div key="activities" className="grid gap-4 md:grid-cols-2">
      {options.activities.map((activity) => (
        <button
          key={activity.id}
          type="button"
          onClick={() => toggleActivity(activity)}
          className={`step-card rounded-3xl p-5 text-left ${builder.activities.some((item) => item.id === activity.id) ? "selected" : ""}`}
        >
          <p className="font-semibold">{activity.name}</p>
          <p className="mt-2 text-sm text-slate-600">{activity.address}</p>
          <p className="mt-3 text-sm text-slate-500">Google rating {activity.rating}/5</p>
          <strong className="mt-4 block text-lg">${activity.price}</strong>
        </button>
      ))}
    </div>,
    <div key="review" className="rounded-3xl bg-slate-50 p-6">
      <div className="space-y-3 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-4"><span>Destination</span><strong className="text-right text-slate-900">{builder.destination?.name}</strong></div>
        <div className="flex items-center justify-between gap-4"><span>Travel dates</span><strong className="text-right text-slate-900">{builder.startDate} to {builder.endDate}</strong></div>
        <div className="flex items-center justify-between gap-4"><span>Flight hub</span><strong className="text-right text-slate-900">{builder.flight?.name || "Select a flight hub"}</strong></div>
        <div className="flex items-center justify-between gap-4"><span>Local transport</span><strong className="text-right text-slate-900">{builder.transport?.name || "Select transport"}</strong></div>
        <div className="flex items-center justify-between gap-4"><span>Hotel</span><strong className="text-right text-slate-900">{builder.hotel?.name || "Select hotel"}</strong></div>
        <div className="flex items-center justify-between gap-4"><span>Activities</span><strong className="text-right text-slate-900">{builder.activities.length ? builder.activities.map((item) => item.name).join(", ") : "Select activities"}</strong></div>
      </div>
    </div>,
  ];

  return (
    <main className="page-shell section-surface mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-10">
        <span className="badge-gradient inline-flex rounded-full px-4 py-2 text-sm font-semibold">OpenStreetMap Custom Trips</span>
        <h1 className="font-display mt-4 text-4xl font-semibold">Plan any destination from search or the map, then book hotels, flights, transfers, and experiences in one flow.</h1>
        <div className="mt-6">
          <Stepper steps={steps} activeStep={activeStep} />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="section-card p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Step {activeStep + 1}: {steps[activeStep]}</h2>
            {isLoadingNearby ? <span className="text-sm font-medium text-sky-700">Refreshing map-driven options...</span> : null}
          </div>
          {mapError ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{mapError}</p> : null}
          {!isMapReady && !mapError ? <p className="mt-4 text-sm text-slate-500">Loading interactive map...</p> : null}
          <div className="mt-6">{stepContent[activeStep]}</div>
          {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))} className="btn-secondary rounded-full px-6 py-3 text-sm font-semibold" disabled={activeStep === 0}>Back</button>
            <button type="button" onClick={handleNext} className="btn-primary rounded-full px-6 py-3 text-sm font-semibold">{activeStep === steps.length - 1 ? "Generate Invoice & Book" : "Continue"}</button>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="section-card overflow-hidden">
            <div ref={mapElementRef} className="h-[340px] w-full bg-slate-100" />
            <div className="p-6">
              <h3 className="text-xl font-semibold">Interactive destination canvas</h3>
              <p className="mt-2 text-sm text-slate-600">Use the map at every stage. Selecting a place updates the nearby hotels, airports, transit options, activities, and weather forecast available in Voyageur.</p>
            </div>
          </div>
          <div className="section-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Live Estimate</p>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Destination planning base</span><strong className="text-slate-900">${basePrice}</strong></div>
              <div className="flex items-center justify-between"><span>Flight hub</span><strong className="text-slate-900">${flightTotal}</strong></div>
              <div className="flex items-center justify-between"><span>Hotel x {nights} nights</span><strong className="text-slate-900">${hotelTotal}</strong></div>
              <div className="flex items-center justify-between"><span>Local transport</span><strong className="text-slate-900">${localTransportTotal}</strong></div>
              <div className="flex items-center justify-between"><span>Activities</span><strong className="text-slate-900">${activitiesTotal}</strong></div>
              <div className="flex items-center justify-between"><span>Food allowance</span><strong className="text-slate-900">${foodTotal}</strong></div>
            </div>
            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Projected total for 2 travelers</span><strong className="text-3xl">${total}</strong></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default CustomTrip;
