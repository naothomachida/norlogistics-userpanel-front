// Type declarations for Google Maps API
declare global {
  interface Window {
    google?: {
      maps: {
        Geocoder: new () => google.maps.Geocoder;
        DistanceMatrixService: new () => google.maps.DistanceMatrixService;
        GeocoderStatus: typeof google.maps.GeocoderStatus;
        DistanceMatrixStatus: typeof google.maps.DistanceMatrixStatus;
        TravelMode: typeof google.maps.TravelMode;
        UnitSystem: typeof google.maps.UnitSystem;
      };
    };
  }
}

import { Client, UnitSystem } from "@googlemaps/google-maps-services-js";

export interface RouteDistanceResult {
  totalDistance: number; // in kilometers
  totalSteps: number;
  distanceDetails: Array<{
    from: string;
    to: string;
    distance: number;
    duration: number;
  }>;
}

export async function calculateRouteDistance(
  addresses: string[], 
  apiKey: string
): Promise<RouteDistanceResult> {
  // Validate inputs
  if (!addresses || addresses.length < 2) {
    throw new Error("At least two addresses are required");
  }

  // Use Google Maps JavaScript API for geocoding and distance calculation
  return new Promise((resolve, reject) => {
    // Ensure Google Maps API is loaded
    if (typeof window === 'undefined' || !window.google?.maps) {
      reject(new Error('Google Maps JavaScript API not loaded'));
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const service = new window.google.maps.DistanceMatrixService();

    // Geocode all addresses
    Promise.all(
      addresses.map(address => 
        new Promise<google.maps.LatLng>((resolveGeocode, rejectGeocode) => {
          geocoder.geocode({ address: address }, (results, status) => {
            if (status === window.google.maps.GeocoderStatus.OK && results?.[0]) {
              resolveGeocode(results[0].geometry.location);
            } else {
              rejectGeocode(new Error(`Geocoding failed for address: ${address}`));
            }
          });
        })
      )
    )
    .then(locations => {
      // Calculate distance matrix
      service.getDistanceMatrix(
        {
          origins: locations,
          destinations: locations.slice(1),
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC
        },
        (response, status) => {
          if (status === window.google.maps.DistanceMatrixStatus.OK) {
            const rows = response?.rows || [];
            
            let totalDistance = 0;
            const distanceDetails: Array<{
              from: string, 
              to: string, 
              distance: number, 
              duration: number
            }> = [];

            rows.forEach((row, index) => {
              const element = row.elements[0];
              if (element.status === 'OK') {
                const distanceInKm = element.distance.value / 1000;
                totalDistance += distanceInKm;

                distanceDetails.push({
                  from: addresses[index],
                  to: addresses[index + 1],
                  distance: distanceInKm,
                  duration: element.duration.value / 60 // Convert to minutes
                });

                console.log(`📍 Segment ${index + 1}: ${addresses[index]} → ${addresses[index + 1]}`);
                console.log(`   Distance: ${distanceInKm.toFixed(2)} km`);
                console.log(`   Duration: ${(element.duration.value / 60).toFixed(1)} minutes`);
              }
            });

            const result = {
              totalDistance: Math.round(totalDistance * 10) / 10,
              totalSteps: addresses.length,
              distanceDetails: distanceDetails
            };

            console.log('🏁 Total Route Summary:');
            console.log(`   Total Distance: ${result.totalDistance} km`);
            console.log(`   Total Steps: ${result.totalSteps}`);

            resolve(result);
          } else {
            reject(new Error(`Distance matrix calculation failed: ${status}`));
          }
        }
      );
    })
    .catch(reject);
  });
} 