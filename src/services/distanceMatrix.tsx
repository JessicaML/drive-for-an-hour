import { Coordinate } from '../types';

interface OpenRouteServiceMatrixResponse {
  durations?: number[][]; // seconds
  distances?: number[][]; // meters
  metadata?: {
    query: {
      locations: number[][];
    };
  };
}

export interface LocationWithDrivingTime extends Coordinate {
  drivingTimeMinutes: number;
  drivingDistanceMiles: number;
}

/**
 * Calculates driving times from origin to multiple destinations using OpenRouteService Matrix API
 * Note: OpenRouteService allows up to 50 locations per request (free tier: 2000 requests/day)
 * @param origin - Starting coordinate
 * @param destinations - Array of destination coordinates
 * @param apiKey - OpenRouteService API key
 * @returns Array of destinations with driving times
 */
export const calculateDrivingTimes = async (
  origin: Coordinate,
  destinations: Coordinate[],
  apiKey: string
): Promise<LocationWithDrivingTime[]> => {
  const results: LocationWithDrivingTime[] = [];

  // Process in batches of 49 (origin + 49 destinations = 50 total, OpenRouteService's limit)
  const batchSize = 49;
  for (let i = 0; i < destinations.length; i += batchSize) {
    const batch = destinations.slice(i, i + batchSize);

    // IMPORTANT: OpenRouteService uses [longitude, latitude] format!
    const locations = [
      [origin.long, origin.lat], // Origin first
      ...batch.map(coord => [coord.long, coord.lat]) // Then destinations
    ];

    const url = 'https://api.openrouteservice.org/v2/matrix/driving-car';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify({
          locations: locations,
          metrics: ['distance', 'duration'],
          sources: [0], // Origin is at index 0
          destinations: batch.map((_, idx) => idx + 1) // Destinations are indices 1 onwards
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouteService API error (${response.status}):`, errorText);
        continue;
      }

      const data: OpenRouteServiceMatrixResponse = await response.json();

      if (data.durations && data.distances) {
        // First row contains durations from origin to all destinations
        const durations = data.durations[0];
        const distances = data.distances[0];

        batch.forEach((coord, index) => {
          // Index + 1 because index 0 is the origin
          const duration = durations[index + 1];
          const distance = distances[index + 1];

          // Skip if duration/distance is null (unreachable location)
          if (duration !== null && distance !== null && duration !== undefined && distance !== undefined) {
            results.push({
              lat: coord.lat,
              long: coord.long,
              drivingTimeMinutes: Math.round(duration / 60), // seconds to minutes
              drivingDistanceMiles: Math.round(distance / 1609.34) // meters to miles
            });
          }
        });
      }
    } catch (error) {
      console.error('Error calculating driving times:', error);
    }
  }

  return results;
};

/**
 * Filters locations to only those within a specified driving time
 * @param origin - Starting coordinate
 * @param destinations - Array of destination coordinates
 * @param maxDrivingMinutes - Maximum driving time in minutes
 * @param apiKey - Google Maps API key
 * @returns Array of locations within the time threshold
 */
export const getLocationsWithinDrivingTime = async (
  origin: Coordinate,
  destinations: Coordinate[],
  maxDrivingMinutes: number,
  apiKey: string
): Promise<LocationWithDrivingTime[]> => {
  const allLocations = await calculateDrivingTimes(origin, destinations, apiKey);
  return allLocations.filter(loc => loc.drivingTimeMinutes <= maxDrivingMinutes);
};
