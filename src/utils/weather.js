const weatherCache = new Map();

const WEATHER_CODE_LABELS = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunderstorm",
};

export function getWeatherLabel(code) {
  return WEATHER_CODE_LABELS[code] || "Forecast unavailable";
}

export async function fetchWeatherForecast(latitude, longitude) {
  if (latitude == null || longitude == null) {
    return null;
  }

  const cacheKey = `${latitude}:${longitude}`;
  if (weatherCache.has(cacheKey)) {
    return weatherCache.get(cacheKey);
  }

  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      daily: "weather_code,temperature_2m_max,temperature_2m_min",
      forecast_days: "3",
      timezone: "auto",
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Weather request failed with status ${response.status}`);
    }
    const data = await response.json();
    const forecast = (data.daily?.time || []).map((day, index) => ({
      day,
      weatherCode: data.daily.weather_code?.[index],
      summary: getWeatherLabel(data.daily.weather_code?.[index]),
      max: data.daily.temperature_2m_max?.[index],
      min: data.daily.temperature_2m_min?.[index],
    }));
    weatherCache.set(cacheKey, forecast);
    return forecast;
  } catch (error) {
    console.error("Weather fetch error:", error);
    weatherCache.set(cacheKey, null);
    return null;
  }
}
