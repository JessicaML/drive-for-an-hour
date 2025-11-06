import * as React from "react";
import { useState, useEffect } from "react";
import useCoordinates from "./hooks/useCoordinates";
import WeatherCard from "./components/WeatherCard";
import LocationCard from "./components/LocationCard";
import MapComponent from "./components/MapComponent";
import { Coordinate, Value, ForecastData } from "./types";
import "./styles.css";

export default function App() {
  const [result, setResult] = useState<Value[]>([]);
  const [willRainSoon, setWillRainSoon] = useState<boolean>(false);

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

  console.log('Render:', { coordinate }, { result })

  return (
    <div className="App" data-testid="container"><h1>Weather App</h1>
      {shouldDisplayWeather ? (<>
        <LocationCard coordinate={coordinate} />
        <MapComponent coordinate={coordinate} willRainSoon={willRainSoon} />
      {result?.map((value) => {
          return (
            <WeatherCard value={value} key={value.id} />
          );
        })}</>) : <p>Checking the weather in your location, hang on....</p>}
    </div>
  );
}
