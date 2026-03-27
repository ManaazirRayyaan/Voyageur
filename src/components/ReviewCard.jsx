import { memo } from "react";
import StarRating from "./StarRating";

function ReviewCard({ review }) {
  return (
    <article className="travel-card p-7">
      <div className="flex items-center gap-4">
        <img src={review.avatar} alt={review.name} className="h-14 w-14 rounded-full" loading="lazy" decoding="async" />
        <div>
          <h3 className="font-semibold">{review.name}</h3>
          <p className="text-sm text-slate-500">{review.title}</p>
        </div>
      </div>
      <div className="mt-5">
        <StarRating rating={review.rating} size="text-lg" />
      </div>
      <p className="mt-4 text-sm leading-7 text-slate-600">“{review.comment}”</p>
    </article>
  );
}

export default memo(ReviewCard);
