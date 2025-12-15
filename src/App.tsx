import * as React from "react";
import { useState, useEffect } from "react";
import useCoordinates from "./hooks/useCoordinates";
import WeatherCard from "./components/WeatherCard";
import LocationCard from "./components/LocationCard";
import MapComponent from "./components/MapComponent";
import WarmDestinationsCard from "./components/WarmDestinationsCard";
import { Coordinate, Value, ForecastData, WarmDestination } from "./types";
import { generateGridCoordinates } from "./helpers/generateGridCoordinates";
import { getLocationsWithinDrivingTime } from "./services/distanceMatrix";
import { findWarmestDestinations } from "./services/warmDestinations";
import "./styles.css";

export default function App() {
  const [result, setResult] = useState<Value[]>([]);
  const [willRainSoon, setWillRainSoon] = useState<boolean>(false);
  const [warmDestinations, setWarmDestinations] = useState<WarmDestination[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState<boolean>(false);

  const coordinate: Coordinate = useCoordinates();

  const shouldDisplayWeather = coordinate.lat !== 0 || coordinate.long !== 0

  useEffect(() => {
    const fetchWeatherData = async () => {
      // Fetch current weather
      const currentWeatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coordinate.lat}&lon=${coordinate.long}&units=metric&appid=${process.env.REACT_APP_OPENWEATHERMAP_API_KEY}`,
        {
          method: "GET"
        }
      );
      const currentWeatherData = await currentWeatherResponse.json();
      setResult([currentWeatherData]);

      // Fetch forecast data
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinate.lat}&lon=${coordinate.long}&units=metric&appid=${process.env.REACT_APP_OPENWEATHERMAP_API_KEY}`,
        {
          method: "GET"
        }
      );
      const forecastData: ForecastData = await forecastResponse.json();

      // Check if it will rain in the next 2 hours
      const now = Date.now() / 1000; // Convert to Unix timestamp
      const twoHoursFromNow = now + (2 * 60 * 60);

      const rainInNext2Hours = forecastData.list?.some((item) => {
        const isWithinNext2Hours = item.dt >= now && item.dt <= twoHoursFromNow;
        const hasRain = item.weather[0]?.main.toLowerCase().includes('rain') ||
                       item.weather[0]?.main.toLowerCase().includes('drizzle') ||
                       item.weather[0]?.main.toLowerCase().includes('thunderstorm');
        return isWithinNext2Hours && hasRain;
      });

      setWillRainSoon(rainInNext2Hours || false);
    };

    if (shouldDisplayWeather) {
      fetchWeatherData();
    }
  // eslint-disable-next-line
  }, [shouldDisplayWeather]);

  // Fetch warm destinations within 1 hour drive
  useEffect(() => {
    const fetchWarmDestinations = async () => {
      const openRouteServiceApiKey = process.env.REACT_APP_OPENROUTESERVICE_API_KEY;
      const weatherApiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY;

      if (!openRouteServiceApiKey || openRouteServiceApiKey === "your-openrouteservice-api-key-here") {
        console.warn("OpenRouteService API key not configured. Skipping warm destinations search.");
        return;
      }

      if (!weatherApiKey) {
        console.error("OpenWeatherMap API key not found.");
        return;
      }

      if (result.length === 0) {
        // Wait for current weather to be fetched first
        return;
      }

      setLoadingDestinations(true);

      try {
        // Generate grid of coordinates (60 mile radius, 15 mile spacing)
        const gridCoordinates = generateGridCoordinates(coordinate, 60, 15);
        console.log(`Generated ${gridCoordinates.length} grid coordinates to check`);

        // Filter to locations within 1 hour drive
        const locationsWithinHour = await getLocationsWithinDrivingTime(
          coordinate,
          gridCoordinates,
          60, // 60 minutes = 1 hour
          openRouteServiceApiKey
        );
        console.log(`Found ${locationsWithinHour.length} locations within 1 hour drive`);
                console.log(`locationsWithinHour ${locationsWithinHour}`);


        // Get current temperature
        const currentTemp = result[0].main.temp;

        // Find warmest destinations
        const warmest = await findWarmestDestinations(
          coordinate,
          currentTemp,
          locationsWithinHour,
          weatherApiKey,
          5 // Top 5 destinations
        );
                console.log(`Found ${warmest.length} warmer destinations`);

        console.log(`Found ${warmest.length} warmer destinations`);

        setWarmDestinations(warmest);
      } catch (error) {
        console.error("Error fetching warm destinations:", error);
      } finally {
        setLoadingDestinations(false);
      }
    };

    if (shouldDisplayWeather && result.length > 0) {
      fetchWarmDestinations();
    }
  // eslint-disable-next-line
  }, [shouldDisplayWeather, result.length]);

  console.log('Render:', { coordinate }, { result })

  return (
    <div className="App" data-testid="container"><h1>Better Weather Seeker</h1>
    <p>Where can I drive for an hour and get better weather conditions?</p>
            <WarmDestinationsCard
          destinations={warmDestinations}
          loading={loadingDestinations}
        />
      {shouldDisplayWeather ? (<>
        <MapComponent coordinate={coordinate} willRainSoon={willRainSoon} />
      {result?.map((value) => {
          return (
            <WeatherCard value={value} key={value.id} />
          );
        })}

      </>) : <p>Checking the weather in your location, hang on....</p>}
    </div>
  );
}
