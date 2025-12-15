import { Coordinate, Value, WarmDestination } from '../types';
import { LocationWithDrivingTime } from './distanceMatrix';

/**
 * Fetches weather data for a single coordinate
 * @param coordinate - The location to fetch weather for
 * @param apiKey - OpenWeatherMap API key
 * @returns Weather data or null if fetch fails
 */
const fetchWeatherForLocation = async (
  coordinate: Coordinate,
  apiKey: string
): Promise<Value | null> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coordinate.lat}&lon=${coordinate.long}&units=metric&appid=${apiKey}`
    );

    if (!response.ok) {
      console.error(`Failed to fetch weather for ${coordinate.lat},${coordinate.long}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};

/**
 * Fetches weather data for multiple locations in parallel
 * @param locations - Array of locations with driving info
 * @param apiKey - OpenWeatherMap API key
 * @returns Array of weather data
 */
const fetchWeatherForMultipleLocations = async (
  locations: LocationWithDrivingTime[],
  apiKey: string
): Promise<Array<{ location: LocationWithDrivingTime; weather: Value | null }>> => {
  const promises = locations.map(async (location) => ({
    location,
    weather: await fetchWeatherForLocation(location, apiKey)
  }));

  return Promise.all(promises);
};

/**
 * Finds the warmest destinations within driving range
 * @param currentLocation - User's current location
 * @param currentTemp - Current temperature at user's location
 * @param locationsWithinRange - Locations within acceptable driving time
 * @param weatherApiKey - OpenWeatherMap API key
 * @param topN - Number of top destinations to return (default 5)
 * @returns Array of warm destinations sorted by temperature increase
 */
export const findWarmestDestinations = async (
  currentLocation: Coordinate,
  currentTemp: number,
  locationsWithinRange: LocationWithDrivingTime[],
  weatherApiKey: string,
  topN: number = 5
): Promise<WarmDestination[]> => {
  // Fetch weather for all locations
  const weatherData = await fetchWeatherForMultipleLocations(locationsWithinRange, weatherApiKey);

  // Transform to WarmDestination objects and filter out failed fetches
  const warmDestinations: WarmDestination[] = weatherData
    .filter(item => item.weather !== null)
    .map(item => {
      const weather = item.weather!;
      console.log('item:', item);
      return {
        lat: item.location.lat,
        long: item.location.long,
        temperature: weather.main.temp,
        temperatureIncrease: weather.main.temp - currentTemp,
        drivingTimeMinutes: item.location.drivingTimeMinutes,
        drivingDistanceMiles: item.location.drivingDistanceMiles,
        weatherDescription: weather.weather[0].description,
        weatherMain: weather.weather[0].main,
        locationName: weather.name
      };
    })
    // Only include locations that are warmer
    .filter(dest => dest.temperatureIncrease > 0);

  // Sort by temperature increase (highest first)
  warmDestinations.sort((a, b) => b.temperatureIncrease - a.temperatureIncrease);

  // Return top N
  return warmDestinations.slice(0, topN);
};
