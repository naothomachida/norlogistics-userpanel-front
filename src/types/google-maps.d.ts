// Type definitions for Google Maps JavaScript API

declare namespace google {
  namespace maps {
    class Geocoder {
      geocode(
        request: { address: string },
        callback: (
          results: GeocoderResult[] | null, 
          status: GeocoderStatus
        ) => void
      ): void;
    }

    class DistanceMatrixService {
      getDistanceMatrix(
        request: {
          origins: LatLng[];
          destinations: LatLng[];
          travelMode: TravelMode;
          unitSystem: UnitSystem;
        },
        callback: (
          response: DistanceMatrixResponse | null, 
          status: DistanceMatrixStatus
        ) => void
      ): void;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface GeocoderResult {
      geometry: {
        location: LatLng;
      };
    }

    interface DistanceMatrixResponse {
      rows: {
        elements: {
          status: string;
          distance: { value: number };
          duration: { value: number };
        }[];
      }[];
    }

    enum GeocoderStatus {
      OK = 'OK',
      ERROR = 'ERROR',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      ZERO_RESULTS = 'ZERO_RESULTS'
    }

    enum DistanceMatrixStatus {
      OK = 'OK',
      INVALID_REQUEST = 'INVALID_REQUEST',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      ZERO_RESULTS = 'ZERO_RESULTS',
      NOT_FOUND = 'NOT_FOUND'
    }

    enum TravelMode {
      DRIVING = 'DRIVING',
      WALKING = 'WALKING',
      BICYCLING = 'BICYCLING',
      TRANSIT = 'TRANSIT'
    }

    enum UnitSystem {
      METRIC = 0,
      IMPERIAL = 1
    }
  }
}

// Extend Window interface to include Google Maps
interface Window {
  google?: {
    maps: typeof google.maps;
  };
} 