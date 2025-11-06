import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Coordinate } from "../types";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

interface MapComponentProps {
  coordinate: Coordinate;
  willRainSoon: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({ coordinate, willRainSoon }) => {
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
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", borderRadius: "20px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, long]}>
          <Popup>
            Your Location
            <br />
            Lat: {lat.toFixed(2)}, Long: {long.toFixed(2)}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
