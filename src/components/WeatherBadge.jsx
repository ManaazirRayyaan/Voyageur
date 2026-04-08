import { useEffect, useState } from "react";
import { fetchWeatherForecast } from "../utils/weather";

function WeatherBadge({ latitude, longitude, compact = false }) {
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    let active = true;
    fetchWeatherForecast(latitude, longitude).then((data) => {
      if (active) {
        setForecast(data);
      }
    });
    return () => {
      active = false;
    };
  }, [latitude, longitude]);

  const today = forecast?.[0];
  if (!today) {
    return (
      <span className={`rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 ${compact ? "" : "inline-flex"}`}>
        Forecast loading
      </span>
    );
  }

  return (
    <div className={`rounded-2xl bg-sky-50 px-3 py-2 text-sky-900 ${compact ? "text-xs" : "text-sm"}`}>
      <div className="font-semibold">{today.summary}</div>
      <div className="text-sky-700">{today.min}°C to {today.max}°C</div>
    </div>
  );
}

export default WeatherBadge;
