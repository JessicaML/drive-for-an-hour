import { useState, useEffect } from "react";
import { Coordinate } from "../types";

const useCoordinates: () => Coordinate = () => {
  const [coordinate, setCoordinate] = useState({
    lat: 0,
    long: 0
  });

  useEffect(() => {
    let geoId = window.navigator.geolocation?.watchPosition((position) => {
      if (coordinate.lat || coordinate.long === 0) {
    setCoordinate({
        lat: position.coords.latitude,
        long: position.coords.longitude
      });
      }
    });

    return () => {
      navigator.geolocation?.clearWatch(geoId);
    };
  // eslint-disable-next-line
  }, []);

  return coordinate;
}

export default useCoordinates;
