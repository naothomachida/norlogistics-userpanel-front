import { useState, useEffect } from 'react';

const API_KEY = 'AIzaSyB2DImKHfFUTwXMi5I_CTDxn_JQgDpi93c';

export function useGoogleMapsLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Handle successful script loading
    script.onload = () => {
      setIsLoaded(true);
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