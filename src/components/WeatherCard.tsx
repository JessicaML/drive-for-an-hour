import * as React from "react";
import formatTime from '../helpers/formatTime'
import { Value } from '../types'
import "../styles.css";


const WeatherCard: React.FC<{ value: Value }> = ({ value }) => {
  return (
    <div className="weather-card">
      <p className="weather-description">
        Current location weather: {value?.weather[0]?.main}
        {", "}
        {value?.weather[0]?.description}</p>
      <p className="temperature">Temperature: {value?.main?.temp} °C</p>
      <p className="sun-time">Sunrise time: {formatTime(value?.sys?.sunrise)}</p>
      <p className="sun-time">Sunset time: {formatTime(value?.sys?.sunset)}</p>
    </div>
  );
}

export default WeatherCard;

