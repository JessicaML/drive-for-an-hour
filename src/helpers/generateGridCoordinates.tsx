import { Coordinate } from '../types';

/**
 * Generates a grid of coordinates around a center point
 * @param center - The center coordinate
 * @param radiusMiles - The radius in miles to search within
 * @param gridSpacingMiles - The spacing between grid points in miles
 * @returns Array of coordinates in a grid pattern
 */
export const generateGridCoordinates = (
  center: Coordinate,
  radiusMiles: number = 60,
  gridSpacingMiles: number = 15
): Coordinate[] => {
  const coordinates: Coordinate[] = [];

  // Approximate conversion: 1 degree latitude ≈ 69 miles
  // 1 degree longitude varies by latitude, using cos(lat) adjustment
  const latDegreesPerMile = 1 / 69;
  const lonDegreesPerMile = 1 / (69 * Math.cos(center.lat * Math.PI / 180));

  const latSpacing = gridSpacingMiles * latDegreesPerMile;
  const lonSpacing = gridSpacingMiles * lonDegreesPerMile;
  const latRadius = radiusMiles * latDegreesPerMile;
  const lonRadius = radiusMiles * lonDegreesPerMile;

  // Generate grid points
  for (let latOffset = -latRadius; latOffset <= latRadius; latOffset += latSpacing) {
    for (let lonOffset = -lonRadius; lonOffset <= lonRadius; lonOffset += lonSpacing) {
      const newLat = center.lat + latOffset;
      const newLon = center.long + lonOffset;

      // Calculate approximate distance to ensure we're within radius
      const distance = Math.sqrt(
        Math.pow((newLat - center.lat) / latDegreesPerMile, 2) +
        Math.pow((newLon - center.long) / lonDegreesPerMile, 2)
      );

      // Only include points within the radius and skip the center point
      if (distance <= radiusMiles && distance > 1) {
        coordinates.push({
          lat: newLat,
          long: newLon
        });
      }
    }
  }

  return coordinates;
};
