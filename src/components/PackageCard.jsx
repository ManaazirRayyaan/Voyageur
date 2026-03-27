import { memo } from "react";
import { Link } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import StarRating from "./StarRating";

function PackageCard({ item, onSave, isSaved }) {
  const { isPackageBooked } = useBooking();
  const alreadyBooked = isPackageBooked(item.id);

  return (
    <article className="travel-card flex h-full w-full flex-col overflow-hidden lg:mx-auto lg:max-w-[350px]">
      <img src={item.image} alt={item.title} className="h-56 w-full object-cover" loading="lazy" decoding="async" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">{item.category}</span>
          <StarRating rating={item.rating} />
        </div>
        <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
        <p className="mt-2 text-sm text-slate-500"><i className="fa-solid fa-location-dot mr-2" />{item.destination}, {item.country}</p>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>{item.durationDays} Days</span>
          <span>{item.rating}/5</span>
        </div>
        <div className="mt-auto pt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <strong className="text-2xl">${item.price}</strong>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Link to={`/packages/${item.id}`} className="btn-primary w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold">View Package</Link>
            {alreadyBooked ? (
              <button type="button" disabled className="w-full rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                Already Booked
              </button>
            ) : onSave ? (
              <button type="button" onClick={() => onSave(item)} className="btn-secondary w-full rounded-xl px-4 py-2.5 text-sm font-semibold">
                {isSaved ? "Saved" : "Save"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(PackageCard);
