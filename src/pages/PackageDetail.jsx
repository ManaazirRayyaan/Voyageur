import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BookingSidebar from "../components/BookingSidebar";
import ReviewCard from "../components/ReviewCard";
import StarRating from "../components/StarRating";
import WeatherBadge from "../components/WeatherBadge";
import { usePackages } from "../context/PackageContext";
import { FALLBACK_IMAGE, getFallbackImages, getImage } from "../utils/fetchImages";

function PackageDetail() {
  const { id } = useParams();
  const { getPackageById, fetchPackageDetail, imageCache, fetchDestinationImages } = usePackages();
  const [packageItem, setPackageItem] = useState(() => getPackageById(id));
  const [hasLoaded, setHasLoaded] = useState(Boolean(getPackageById(id)));
  const [galleryImages, setGalleryImages] = useState([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    let active = true;
    fetchPackageDetail(id).then((data) => {
      if (active) {
        setPackageItem(data);
        setHasLoaded(true);
      }
    }).catch(() => {
      if (active) {
        setPackageItem(null);
        setHasLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!packageItem?.destination) return;
    let active = true;
    const cacheKey = `${String(packageItem.destination).toLowerCase()}::6`;
    if (imageCache[cacheKey]?.length) {
      setGalleryImages(imageCache[cacheKey]);
      setIsGalleryLoading(false);
      return;
    }

    setIsGalleryLoading(true);
    fetchDestinationImages(packageItem.destination, 6).then((images) => {
      if (!active) return;
      setGalleryImages(images.length ? images : getFallbackImages(6, getImage(packageItem.destination)));
      setIsGalleryLoading(false);
    });

    return () => {
      active = false;
    };
  }, [fetchDestinationImages, imageCache, packageItem?.destination]);

  if (!hasLoaded && !packageItem) {
    return <main className="page-shell flex min-h-screen items-center justify-center px-4 py-28 text-slate-600">Loading package...</main>;
  }

  if (!packageItem) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center px-4 py-28 text-slate-600">
        <div className="section-card max-w-lg px-8 py-10 text-center">
          <h1 className="font-display text-3xl font-semibold text-slate-900">Package not found</h1>
          <p className="mt-3 text-sm text-slate-500">This package may have been removed or is no longer available.</p>
        </div>
      </main>
    );
  }

  const packageHotels = packageItem.hotels || [];
  const packageTransports = packageItem.transports || [];
  const destinationReviews = packageItem.reviews || [];

  return (
    <main className="page-shell section-surface mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-8">
          <div className="section-card overflow-hidden">
            {isGalleryLoading ? (
              <div className="h-[420px] w-full animate-pulse bg-slate-200" />
            ) : (
              <img
                src={galleryImages[0] || getImage(packageItem.destination) || FALLBACK_IMAGE}
                alt={packageItem.title}
                className="h-[420px] w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                loading="eager"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
            )}
            <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-4">
              {(isGalleryLoading ? Array.from({ length: 6 }, (_, index) => ({ id: index })) : galleryImages.slice(0, 6)).map((image, index) =>
                isGalleryLoading ? (
                  <div key={index} className="h-24 w-full animate-pulse rounded-2xl bg-slate-200" />
                ) : (
                  <img
                    key={image}
                    src={image}
                    alt={`${packageItem.title} ${index + 1}`}
                    className="h-24 w-full rounded-2xl object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                )
              )}
            </div>
          </div>

          <section className="section-card p-8">
            <div className="flex flex-wrap items-center gap-4">
              <span className="badge-gradient rounded-full px-4 py-2 text-sm font-semibold capitalize">{packageItem.category}</span>
              <StarRating rating={packageItem.rating} />
            </div>
            <h1 className="font-display mt-5 text-4xl font-semibold">{packageItem.title}</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">{packageItem.longDescription}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Location</p><strong className="mt-2 block text-lg">{packageItem.destination}</strong></div>
              <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Duration</p><strong className="mt-2 block text-lg">{packageItem.durationDays} Days</strong></div>
              <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Base Price</p><strong className="mt-2 block text-lg">${packageItem.price}</strong></div>
            </div>
            <div className="mt-6">
              <WeatherBadge latitude={packageItem.latitude} longitude={packageItem.longitude} />
            </div>
          </section>

          <section className="section-card p-8">
            <h2 className="text-2xl font-semibold">Day-by-Day Itinerary</h2>
            <div className="mt-6 space-y-4">
              {packageItem.itinerary.map((item, index) => (
                <details key={item.title} className="accordion-item rounded-3xl border border-slate-200 p-5" open={index === 0}>
                  <summary className="flex cursor-pointer items-center justify-between font-semibold">{item.title}<i className="fa-solid fa-plus text-slate-400" /></summary>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="section-card p-8">
              <h2 className="text-2xl font-semibold">Included</h2>
              <ul className="mt-5 space-y-4 text-sm text-slate-600">
                {packageItem.includedItems.map((item) => <li key={item}><i className="fa-solid fa-check mr-3 text-emerald-500" />{item}</li>)}
              </ul>
            </div>
            <div className="section-card p-8">
              <h2 className="text-2xl font-semibold">Excluded</h2>
              <ul className="mt-5 space-y-4 text-sm text-slate-600">
                {packageItem.excludedItems.map((item) => <li key={item}><i className="fa-solid fa-xmark mr-3 text-rose-500" />{item}</li>)}
              </ul>
            </div>
          </section>

          <section className="section-card p-8">
            <h2 className="text-2xl font-semibold">Available Transport</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {packageTransports.map((transport) => (
                <article key={transport.id} className="travel-card p-5">
                  <i className={`fa-solid ${transport.icon} text-2xl text-sky-600`} />
                  <h3 className="mt-4 font-semibold">{transport.type}</h3>
                  <p className="mt-2 text-sm text-slate-600">{transport.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section-card p-8">
            <h2 className="text-2xl font-semibold">Hotel Options</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {packageHotels.map((hotel) => (
                <article key={hotel.id} className="travel-card p-5">
                  <h3 className="font-semibold">{hotel.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{hotel.summary}</p>
                  <p className="mt-4 rating-stars">{hotel.rating}/5</p>
                  <strong className="mt-4 block text-xl">${hotel.pricePerNight}/night</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="section-card p-8">
            <h2 className="text-2xl font-semibold">Restaurants & Experiences</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {packageItem.restaurants.map((item) => (
                <div key={item} className="travel-card p-5">
                  <h3 className="font-semibold">{item}</h3>
                  <p className="mt-2 text-sm text-slate-600">Configured for the destination narrative and premium trip feel.</p>
                </div>
              ))}
            </div>
          </section>

          <section className="section-card overflow-hidden">
            <div className="p-8 pb-0">
              <h2 className="text-2xl font-semibold">Map Preview</h2>
            </div>
            <iframe title={`${packageItem.destination} map`} className="mt-6 h-[360px] w-full border-0" loading="lazy" src={`https://www.google.com/maps?q=${packageItem.latitude},${packageItem.longitude}&output=embed`} />
          </section>

          <section className="section-card p-8">
            <h2 className="text-2xl font-semibold">Recent Reviews</h2>
            <div className="mt-6 grid gap-4">
              {destinationReviews.slice(0, 3).map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
          </section>
        </section>

        <aside className="sticky-booking lg:sticky">
          <BookingSidebar packageItem={packageItem} />
        </aside>
      </div>
    </main>
  );
}

export default PackageDetail;
