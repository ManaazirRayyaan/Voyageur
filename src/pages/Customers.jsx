import { useMemo, useState } from "react";
import Modal from "../components/Modal";
import ReviewCard from "../components/ReviewCard";
import { useAuth } from "../context/AuthContext";
import { usePackages } from "../context/PackageContext";

function Customers() {
  const { isAuthenticated } = useAuth();
  const { reviews, averageRating, addReview, packages } = usePackages();
  const [ratingFilter, setRatingFilter] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ comment: "", rating: 5 });
  const [error, setError] = useState("");

  const filteredReviews = useMemo(() => reviews.filter((review) => review.rating >= ratingFilter), [reviews, ratingFilter]);
  const ratingDistribution = useMemo(() => {
    const distribution = [5, 4, 3, 2, 1].map((star) => reviews.filter((review) => Math.round(review.rating) === star).length);
    const maxCount = Math.max(...distribution, 1);
    return distribution.map((count, index) => ({
      label: `${5 - index}★`,
      count,
      height: count ? Math.max((count / maxCount) * 100, 16) : 10,
    }));
  }, [reviews]);
  const fiveStarShare = useMemo(() => {
    if (!reviews.length) return 0;
    return Math.round((reviews.filter((review) => Math.round(review.rating) === 5).length / reviews.length) * 100);
  }, [reviews]);
  const destinationsReviewed = useMemo(() => new Set(reviews.map((review) => review.destinationSlug)).size, [reviews]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    const fallbackPackage = packages[0];
    if (!fallbackPackage) return;
    addReview({
      destination_id: fallbackPackage.destinationId,
      rating: Number(form.rating),
      comment: form.comment,
    }).then(() => {
      setForm({ comment: "", rating: 5 });
      setIsOpen(false);
    }).catch((err) => {
      setError(err.message || "Unable to submit review.");
    });
  };

  return (
    <main className="page-shell section-surface mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
      <section className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="badge-gradient inline-flex rounded-full px-4 py-2 text-sm font-semibold">{averageRating}/5 average customer rating</span>
          <h1 className="font-display mt-4 text-4xl font-semibold">Customer trust, retention, and proof of quality.</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={ratingFilter} onChange={(e) => setRatingFilter(Number(e.target.value))} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm outline-none">
            <option value="0">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4 stars & up</option>
            <option value="3">3 stars & up</option>
          </select>
          <button type="button" onClick={() => setIsOpen(true)} className="btn-primary rounded-full px-5 py-3 text-sm font-semibold">{isAuthenticated ? "Add Review" : "Login to Review"}</button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="section-card p-8">
          <h2 className="text-2xl font-semibold">Review Statistics</h2>
          <div className="mt-8 flex h-64 items-end justify-between gap-4">
            {ratingDistribution.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="chart-bar w-full max-w-[56px]" style={{ height: `${item.height}%` }} />
                <span className="text-sm text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Total reviews</p><strong className="mt-2 block text-2xl">{reviews.length}</strong></div>
            <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">5-star share</p><strong className="mt-2 block text-2xl">{fiveStarShare}%</strong></div>
            <div className="rounded-3xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Destinations reviewed</p><strong className="mt-2 block text-2xl">{destinationsReviewed}</strong></div>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredReviews.map((review) => <ReviewCard key={review.id} review={review} />)}
        </div>
      </section>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Your Review">
        <form onSubmit={handleSubmit} className="space-y-5">
          <textarea rows="4" placeholder="Share your travel experience" value={form.comment} onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none" />
          <select value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none">
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>
          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary rounded-full px-5 py-3 text-sm font-semibold">Cancel</button>
            <button type="submit" className="btn-primary rounded-full px-5 py-3 text-sm font-semibold">Submit Review</button>
          </div>
        </form>
      </Modal>
    </main>
  );
}

export default Customers;
