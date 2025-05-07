import { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export function useGoogleMapsLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Prevent multiple script loads
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      return;
    }

    // Validate API key
    if (!API_KEY) {
      setError(new Error('Google Maps API key is missing'));
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Handle successful script loading
    script.onload = () => {
      // Additional check to ensure Google Maps is actually loaded
      const checkGoogleMapsLoaded = () => {
        if (window.google?.maps) {
          setIsLoaded(true);
        } else {
          // If not loaded after a delay, set an error
          setError(new Error('Google Maps script loaded but API not available'));
        }
      };

      // Wait a short time to ensure script is fully processed
      setTimeout(checkGoogleMapsLoaded, 500);
    };

    // Handle script loading error
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      setError(new Error('Failed to load Google Maps script'));
    };

    // Append script to document
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return { isLoaded, error };
} 