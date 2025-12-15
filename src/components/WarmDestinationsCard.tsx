import * as React from "react";
import { WarmDestination } from '../types';
import formatLocation from '../helpers/formatLocation';
import "../styles.css";

const WarmDestinationsCard: React.FC<{
  destinations: WarmDestination[];
  loading: boolean;
}> = ({ destinations, loading }) => {

  if (loading) {
    return (
      <div className="warm-destinations-card">
        <h2 className="warm-destinations-title">Finding Warm Destinations...</h2>
        <p className="loading-text">Searching for locations within an hour's drive</p>
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="warm-destinations-card">
        <h2 className="warm-destinations-title">No Warmer Destinations Found</h2>
        <p className="no-results-text">
          There are no locations within an hour's drive that are warmer than your current location.
        </p>
      </div>
    );
  }

  return (
    <div className="warm-destinations-card">
      <h2 className="warm-destinations-title">Warmest Destinations Nearby</h2>
      <p className="subtitle">Within 1 hour drive</p>

      <div className="destinations-list">
        {destinations.map((dest, index) => (
          <div key={`${dest.lat}-${dest.long}`} className="destination-item">
            <div className="destination-rank">#{index + 1}</div>
            <div className="destination-info">
              <div className="destination-temp-increase">
                +{dest.temperatureIncrease.toFixed(1)}°C warmer
              </div>
              <div className="destination-temp">
                {dest.temperature.toFixed(1)}°C
              </div>
              <div className="destination-weather">
                {dest.weatherMain} - {dest.weatherDescription}
              </div>
              <div className="destination-location">
                📍 {formatLocation({ lat: dest.lat, long: dest.long })}
              </div>
              <div className="destination-drive-info">
                <span className="drive-time">🚗 {dest.drivingTimeMinutes} min</span>
                <span className="drive-distance">({dest.drivingDistanceMiles} mi)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WarmDestinationsCard;
