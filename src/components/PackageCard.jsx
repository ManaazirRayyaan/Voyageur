import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { usePackages } from "../context/PackageContext";
import { FALLBACK_IMAGE, getImage } from "../utils/fetchImages";
import StarRating from "./StarRating";
import WeatherBadge from "./WeatherBadge";

function PackageCard({ item, onSave, isSaved }) {
  const { isPackageBooked } = useBooking();
  const { getPackageImage } = usePackages();
  const alreadyBooked = isPackageBooked(item.id);
  const [imageUrl, setImageUrl] = useState(() => getImage(item.destination));
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsImageLoading(true);
    getPackageImage(item.destination).then((image) => {
      if (!active) return;
      setImageUrl(image || getImage(item.destination));
      setIsImageLoading(false);
    });

    return () => {
      active = false;
    };
  }, [getPackageImage, item.destination]);

  return (
    <article className="travel-card flex h-full w-full flex-col overflow-hidden lg:mx-auto lg:max-w-[350px]">
      <div className="h-56 overflow-hidden bg-slate-100">
        {isImageLoading ? (
          <div className="h-full w-full animate-pulse bg-slate-200" />
        ) : (
          <img
            src={imageUrl || getImage(item.destination)}
            alt={item.title}
            className="h-56 w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 capitalize">
            {item.category}
          </span>
          <StarRating rating={item.rating} />
        </div>

        <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>

        <p className="mt-2 text-sm text-slate-500">
          <i className="fa-solid fa-location-dot mr-2" />
          {item.destination}, {item.country}
        </p>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>{item.durationDays} Days</span>
          <span>{item.rating}/5</span>
        </div>
        <div className="mt-4">
          <WeatherBadge latitude={item.latitude} longitude={item.longitude} compact />
        </div>

        <div className="mt-auto pt-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <strong className="text-2xl">${item.price}</strong>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              to={`/packages/${item.id}`}
              className="btn-primary w-full rounded-xl px-4 py-2.5 text-center text-sm font-semibold"
            >
              View Package
            </Link>

            {alreadyBooked ? (
              <button
                type="button"
                disabled
                className="w-full rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-700"
              >
                Already Booked
              </button>
            ) : onSave ? (
              <button
                type="button"
                onClick={() => onSave(item)}
                className="btn-secondary w-full rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
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
