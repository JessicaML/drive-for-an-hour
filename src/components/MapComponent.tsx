import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Coordinate, WarmDestination } from "../types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Create custom icon for warm destination markers with heat gradient
const warmDestinationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="36" height="54">
      <defs>
        <linearGradient id="heatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF8E53;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path fill="url(#heatGradient)" stroke="#fff" stroke-width="2"
            d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 18 9 18s9-11.25 9-18c0-4.97-4.03-9-9-9z"
            filter="url(#shadow)"/>
      <text x="12" y="12" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">.</text>
    </svg>
  `),
  iconSize: [36, 54],
  iconAnchor: [18, 54],
  popupAnchor: [0, -54],
});

interface MapComponentProps {
  coordinate: Coordinate;
  willRainSoon: boolean;
  warmDestinations?: WarmDestination[];
}

const MapComponent: React.FC<MapComponentProps> = ({ coordinate, willRainSoon, warmDestinations = [] }) => {
  const { lat, long } = coordinate;

  // Only render map if we have valid coordinates
  if (lat === 0 && long === 0) {
    return null;
  }

  return (
    <div className="map-container">
      {willRainSoon && (
        <div className="rain-overlay">
          <div className="rain-warning">
            <span className="rain-icon">🌧️</span>
            <span className="rain-text">Rain Expected Soon!</span>
          </div>
          <div className="rain-drops">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="rain-drop"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
      <MapContainer
        center={[lat, long]}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", borderRadius: "20px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[lat, long]}>
          <Popup>
            <strong>Your Location</strong>
            <br />
            Lat: {lat.toFixed(2)}, Long: {long.toFixed(2)}
          </Popup>
        </Marker>
        {warmDestinations.map((destination, index) => (
          <Marker
            key={`dest-${index}`}
            position={[destination.lat, destination.long]}
            icon={warmDestinationIcon}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <strong style={{ fontSize: '16px', color: '#FF6B6B' }}>
                  #{index + 1} {destination.locationName}
                </strong>
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  <div><strong>Temperature:</strong> {destination.temperature.toFixed(1)}°C</div>
                  <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    +{destination.temperatureIncrease.toFixed(1)}°C warmer
                  </div>
                  <div><strong>Weather:</strong> {destination.weatherDescription}</div>
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #ddd' }}>
                    <div><strong>Drive Time:</strong> {destination.drivingTimeMinutes} min</div>
                    <div><strong>Distance:</strong> {destination.drivingDistanceMiles.toFixed(1)} miles</div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
