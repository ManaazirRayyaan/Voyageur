export function calculateBookingTotal({ packagePrice = 0, hotelPrice = 0, transportPrice = 0, travelers = 1, nights = 1 }) {
  return (Number(packagePrice) + Number(transportPrice) + Number(hotelPrice) * Number(nights)) * Number(travelers || 1);
}

export function getNights(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}
