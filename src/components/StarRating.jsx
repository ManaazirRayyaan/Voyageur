function StarRating({ rating, size = "text-sm" }) {
  const rounded = Math.round(rating);

  return (
    <div className={`rating-stars ${size}`}>
      {Array.from({ length: 5 }, (_, index) => (
        <i key={index} className={`fa-solid ${index < rounded ? "fa-star" : "fa-star-half-stroke"} ${index < Math.floor(rating) ? "" : ""}`} />
      ))}
    </div>
  );
}

export default StarRating;
