import * as React from "react";
import formatLocation from '../helpers/formatLocation'
import { Coordinate } from '../types'
import "../styles.css";

interface Props {
  lat: string; long: string;
}

const LocationCard: React.FC<{ coordinate: Coordinate }> = ({ coordinate }) => {
  const { lat, long } = coordinate

  return (
    <div className="location-card">
      {lat !== 0 && <p key={lat}>Lat: {formatLocation(lat)}</p>}
      {long !== 0 && <p key={long}>Long: {formatLocation(long)}</p>}
    </div>
  );
}

export default LocationCard;
