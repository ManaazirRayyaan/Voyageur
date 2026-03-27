import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../components/Stepper";
import { useBooking } from "../context/BookingContext";
import { apiRequest } from "../utils/api";
import { calculateBookingTotal, getNights } from "../utils/pricing";

const steps = ["Destination", "Dates", "Transport", "Hotel", "Activities", "Review"];

function CustomTrip() {
  const navigate = useNavigate();
  const { createBooking } = useBooking();
  const [activeStep, setActiveStep] = useState(0);
  const [destinationOptions, setDestinationOptions] = useState([]);
  const [isBooting, setIsBooting] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailCache, setDetailCache] = useState({});
  const [error, setError] = useState("");
  const [builder, setBuilder] = useState({
    destination: null,
    startDate: "2026-10-12",
    endDate: "2026-10-18",
    transport: null,
    hotel: null,
    activities: ["Coral Diving", "Sunset Cruise"],
  });

  useEffect(() => {
    let active = true;
    async function boot() {
      setIsBooting(true);
      try {
        const data = await apiRequest("/api/packages/?page=1&page_size=6");
        if (!active) return;
        const options = data.results || [];
        setDestinationOptions(options);
        if (options[0]) {
          setBuilder((prev) => ({ ...prev, destination: options[0] }));
          await loadPackageDetail(options[0].id, active);
        }
      } finally {
        if (active) setIsBooting(false);
      }
    }
    boot();
    return () => {
      active = false;
    };
  }, []);

  async function loadPackageDetail(id, activeFlag = true) {
    if (detailCache[id]) {
      const detail = detailCache[id];
      if (activeFlag) {
        setBuilder((prev) => ({
          ...prev,
          destination: detail,
          hotel: detail.hotels?.[0] || null,
          transport: detail.transports?.[0] || null,
        }));
      }
      return detail;
    }

    setIsDetailLoading(true);
    try {
      const detail = await apiRequest(`/api/packages/${id}/`);
      if (!activeFlag) return detail;
      setDetailCache((prev) => ({ ...prev, [id]: detail }));
      setBuilder((prev) => ({
        ...prev,
        destination: detail,
        hotel: detail.hotels?.[0] || null,
        transport: detail.transports?.[0] || null,
      }));
      return detail;
    } finally {
      if (activeFlag) setIsDetailLoading(false);
    }
  }

  const matchingHotels = useMemo(() => builder.destination?.hotels || [], [builder.destination]);
  const matchingTransports = useMemo(() => builder.destination?.transports || [], [builder.destination]);

  const activityPrice = Math.max(150, builder.activities.length * 155);
  const total = calculateBookingTotal({
    packagePrice: Number(builder.destination?.price || 0) + activityPrice,
    hotelPrice: builder.hotel?.pricePerNight || 0,
    transportPrice: builder.transport?.price || 0,
    travelers: 2,
    nights: getNights(builder.startDate, builder.endDate),
  });

  const handleDestinationSelect = async (option) => {
    setBuilder((prev) => ({ ...prev, destination: option, hotel: null, transport: null }));
    await loadPackageDetail(option.id);
  };

  const stepContent = [
    <div key="destination" className="grid gap-4 md:grid-cols-2">
      {destinationOptions.map((option) => (
        <button key={option.id} type="button" onClick={() => handleDestinationSelect(option)} className={`step-card rounded-3xl p-5 text-left ${builder.destination?.id === option.id ? "selected" : ""}`}>
          <p className="font-semibold">{option.destination}</p>
          <p className="mt-2 text-sm text-slate-600">{option.description}</p>
        </button>
      ))}
    </div>,
    <div key="dates" className="grid gap-4 md:grid-cols-2">
      <input type="date" value={builder.startDate} onChange={(e) => setBuilder((prev) => ({ ...prev, startDate: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
      <input type="date" value={builder.endDate} onChange={(e) => setBuilder((prev) => ({ ...prev, endDate: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
    </div>,
    <div key="transport" className="grid gap-4 md:grid-cols-2">
      {matchingTransports.map((transport) => (
        <button key={transport.id} type="button" onClick={() => setBuilder((prev) => ({ ...prev, transport }))} className={`step-card rounded-3xl p-5 text-left ${builder.transport?.id === transport.id ? "selected" : ""}`}>
          <p className="font-semibold">{transport.type}</p>
          <p className="mt-2 text-sm text-slate-600">{transport.description}</p>
        </button>
      ))}
      {!matchingTransports.length ? <p className="text-sm text-slate-500">Transport options will appear after destination details load.</p> : null}
    </div>,
    <div key="hotel" className="grid gap-4 md:grid-cols-2">
      {matchingHotels.map((hotel) => (
        <button key={hotel.id} type="button" onClick={() => setBuilder((prev) => ({ ...prev, hotel }))} className={`step-card rounded-3xl p-5 text-left ${builder.hotel?.id === hotel.id ? "selected" : ""}`}>
          <p className="font-semibold">{hotel.name}</p>
          <p className="mt-2 text-sm text-slate-600">{hotel.summary}</p>
        </button>
      ))}
      {!matchingHotels.length ? <p className="text-sm text-slate-500">Hotel options will appear after destination details load.</p> : null}
    </div>,
    <div key="activities" className="grid gap-4 md:grid-cols-2">
      {["Coral Diving", "Sunset Cruise", "Spa Ritual", "Local Food Tour"].map((activity) => (
        <button
          key={activity}
          type="button"
          onClick={() =>
            setBuilder((prev) => ({
              ...prev,
              activities: prev.activities.includes(activity)
                ? prev.activities.filter((item) => item !== activity)
                : [...prev.activities, activity],
            }))
          }
          className={`step-card rounded-3xl p-5 text-left ${builder.activities.includes(activity) ? "selected" : ""}`}
        >
          <p className="font-semibold">{activity}</p>
          <p className="mt-2 text-sm text-slate-600">Selectable upgrade with live pricing impact.</p>
        </button>
      ))}
    </div>,
    <div key="review" className="rounded-3xl bg-slate-50 p-6">
      <div className="space-y-3 text-sm text-slate-600">
        <div className="flex items-center justify-between"><span>Destination</span><strong className="text-slate-900">{builder.destination?.destination}</strong></div>
        <div className="flex items-center justify-between"><span>Travel Dates</span><strong className="text-slate-900">{builder.startDate} to {builder.endDate}</strong></div>
        <div className="flex items-center justify-between"><span>Transport</span><strong className="text-slate-900">{builder.transport?.type || "Select transport"}</strong></div>
        <div className="flex items-center justify-between"><span>Hotel</span><strong className="text-slate-900">{builder.hotel?.name || "Select hotel"}</strong></div>
        <div className="flex items-center justify-between"><span>Activities</span><strong className="text-slate-900 text-right">{builder.activities.join(", ")}</strong></div>
      </div>
    </div>,
  ];

  const handleNext = async () => {
    setError("");
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      return;
    }
    try {
      const booking = await createBooking({
        package: builder.destination,
        hotel: builder.hotel,
        transport: builder.transport,
        travelers: 2,
        startDate: builder.startDate,
        endDate: builder.endDate,
        totalPrice: total,
        type: "custom",
        customNotes: builder.activities.join(", "),
      });
      navigate("/booking-confirmation", { state: { bookingId: booking.id } });
    } catch (err) {
      setError(err.payload?.error?.[0] || err.payload?.error || err.message || "Booking failed.");
    }
  };

  if (isBooting) {
    return <main className="flex min-h-[60vh] items-center justify-center text-slate-600">Starting trip builder...</main>;
  }

  return (
    <main className="page-shell section-surface mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-10">
        <span className="badge-gradient inline-flex rounded-full px-4 py-2 text-sm font-semibold">Custom Trip Builder</span>
        <h1 className="font-display mt-4 text-4xl font-semibold">Design a bespoke trip in six guided steps.</h1>
        <div className="mt-6">
          <Stepper steps={steps} activeStep={activeStep} />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="section-card p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">Step {activeStep + 1}: {steps[activeStep]}</h2>
            {isDetailLoading ? <span className="text-sm font-medium text-sky-700">Loading destination details...</span> : null}
          </div>
          <div className="mt-6">{stepContent[activeStep]}</div>
          {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
          <div className="mt-8 flex items-center justify-between">
            <button type="button" onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))} className="btn-secondary rounded-full px-6 py-3 text-sm font-semibold" disabled={activeStep === 0}>Back</button>
            <button type="button" onClick={handleNext} className="btn-primary rounded-full px-6 py-3 text-sm font-semibold">{activeStep === steps.length - 1 ? "Confirm Trip" : "Continue"}</button>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="section-card overflow-hidden">
            <iframe title="Destination map" className="h-[320px] w-full border-0" loading="lazy" src={`https://www.google.com/maps?q=${builder.destination?.latitude},${builder.destination?.longitude}&output=embed`} />
            <div className="p-6">
              <h3 className="text-xl font-semibold">Live route context</h3>
              <p className="mt-2 text-sm text-slate-600">Map preview stays visible while travelers configure destination, stay style, and activity mix.</p>
            </div>
          </div>
          <div className="section-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Live Estimate</p>
            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>Base package</span><strong className="text-slate-900">${builder.destination?.price || 0}</strong></div>
              <div className="flex items-center justify-between"><span>Hotel</span><strong className="text-slate-900">${builder.hotel?.pricePerNight || 0}/night</strong></div>
              <div className="flex items-center justify-between"><span>Transport</span><strong className="text-slate-900">${builder.transport?.price || 0}</strong></div>
              <div className="flex items-center justify-between"><span>Activities</span><strong className="text-slate-900">${activityPrice}</strong></div>
            </div>
            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Projected total</span><strong className="text-3xl">${total}</strong></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default CustomTrip;
