import axios from 'axios';

// Mapbox API key
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibmFvdGhvIiwiYSI6ImNtYWU1Y3ByZDA0Y2syam9ncjZ3cGRmdzMifQ.XzLOaXD9UgN47QIBSoD1IA';

export interface RouteDistanceResult {
  totalDistance: number; // in kilometers
  totalDuration: number; // in minutes
  totalSteps: number;
  distanceDetails: Array<{
    from: string;
    to: string;
    distance: number;
    duration: number;
  }>;
}

// Helper function to clean and normalize addresses
function normalizeAddress(address: string): string {
  // Remove extra spaces, commas, and standardize formatting
  return address
    .replace(/,\s*,/g, ',')  // Remove duplicate commas
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .replace(/,$/, '')       // Remove trailing comma
    .trim();
}

export async function calculateRouteDistance(
  addresses: string[], 
  profile: 'driving' | 'driving-traffic' | 'walking' | 'cycling' = 'driving'
): Promise<RouteDistanceResult> {
  // Validate inputs
  if (!addresses || addresses.length < 2) {
    throw new Error("At least two addresses are required");
  }

  try {
    // Geocode addresses to get coordinates
    const geocodedAddresses = await Promise.all(
      addresses.map(async (address) => {
        try {
          // Skip geocoding for toll points
          if (address.includes('Pedágio')) {
            return {
              coordinates: null,
              placeName: address
            };
          }

          const normalizedAddress = normalizeAddress(address);
          
          // Encode the address for URL
          const encodedAddress = encodeURIComponent(normalizedAddress);
          
          const geocodeResponse = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json`, {
            params: {
              access_token: MAPBOX_ACCESS_TOKEN,
              limit: 1,
              types: 'address,poi'
            }
          });

          const features = geocodeResponse.data.features;
          if (!features || features.length === 0) {
            console.warn(`Could not geocode address: ${normalizedAddress}`);
            // Fallback to original address if geocoding fails
            return {
              coordinates: null,
              placeName: normalizedAddress
            };
          }

          return {
            coordinates: features[0].center, // [longitude, latitude]
            placeName: features[0].place_name // Full formatted address
          };
        } catch (error) {
          console.error(`Geocoding error for address ${address}:`, error);
          // Fallback to original address if geocoding fails
          return {
            coordinates: null,
            placeName: address
          };
        }
      })
    );

    // Filter out addresses that couldn't be geocoded and are not toll points
    const validGeocodes = geocodedAddresses.filter(addr => 
      addr.coordinates !== null || addr.placeName.includes('Pedágio')
    );
    
    if (validGeocodes.length < 2) {
      throw new Error("Could not geocode enough addresses to calculate route");
    }

    // Prepare coordinates string for Mapbox Directions API
    const coordinatesString = validGeocodes
      .filter(addr => addr.coordinates !== null)
      .map(addr => addr.coordinates.join(','))
      .join(';');

    // Call Mapbox Directions API
    const directionsResponse = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinatesString}`,
      {
        params: {
          access_token: MAPBOX_ACCESS_TOKEN,
          overview: 'full',
          geometries: 'geojson',
          annotations: 'distance,duration'
        }
      }
    );

    const routes = directionsResponse.data.routes;
    if (!routes || routes.length === 0) {
      throw new Error("No routes found");
    }

    const route = routes[0];
    const distanceDetails: RouteDistanceResult['distanceDetails'] = [];

    // Calculate distance for each route segment
    route.legs.forEach((leg: any, index: number) => {
      const fromAddress = validGeocodes.filter(addr => addr.coordinates !== null)[index].placeName;
      const toAddress = validGeocodes.filter(addr => addr.coordinates !== null)[index + 1].placeName;

      distanceDetails.push({
        from: fromAddress,
        to: toAddress,
        distance: leg.distance / 1000, // convert meters to kilometers
        duration: leg.duration / 60 // convert seconds to minutes
      });
    });

    return {
      totalDistance: route.distance / 1000, // convert meters to kilometers
      totalDuration: route.duration / 60, // convert seconds to minutes
      totalSteps: validGeocodes.length,
      distanceDetails
    };
  } catch (error) {
    console.error('Route calculation error:', error);
    throw error;
  }
} 