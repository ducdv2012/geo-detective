import type { Country, WeatherSnapshot } from "../types";
import { appConfig } from "../../app.config";

export async function fetchWeather(
  country: Country,
  fetcher: typeof fetch = fetch,
): Promise<WeatherSnapshot> {
  if (!country.capitalCoordinates) return { available: false };
  const { latitude, longitude } = country.capitalCoordinates;
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,weather_code,precipitation",
    timezone: "auto",
  });

  try {
    const response = await fetcher(`${appConfig.data.weatherUrl}?${params}`);
    if (!response.ok) return { available: false };
    const data = (await response.json()) as {
      current?: {
        temperature_2m?: number;
        weather_code?: number;
        precipitation?: number;
      };
    };
    if (typeof data.current?.temperature_2m !== "number")
      return { available: false };
    return {
      available: true,
      temperature: data.current.temperature_2m,
      weatherCode: data.current.weather_code,
      precipitation: data.current.precipitation,
    };
  } catch {
    return { available: false };
  }
}
