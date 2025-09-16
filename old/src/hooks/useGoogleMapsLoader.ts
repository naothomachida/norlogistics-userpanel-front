import { useState, useEffect } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Singleton to prevent multiple script loads
let scriptLoadPromise: Promise<void> | null = null;

export function useGoogleMapsLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Extensive logging for debugging
    console.log('Google Maps Loader: Starting initialization');
    console.log('Existing Google Maps:', !!window.google?.maps);
    console.log('API Key:', API_KEY ? 'Provided' : 'Missing');

    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      console.log('Google Maps already loaded');
      setIsLoaded(true);
      return;
    }

    // Validate API key (ensure it's a non-empty string)
    if (!API_KEY || typeof API_KEY !== 'string' || API_KEY.trim() === '') {
      const missingKeyError = new Error('Google Maps API key is missing or invalid');
      console.error(missingKeyError);
      setError(missingKeyError);
      return;
    }

    // Use singleton pattern to prevent multiple script loads
    if (!scriptLoadPromise) {
      scriptLoadPromise = new Promise<void>((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          console.log('Google Maps script already exists in DOM');
          resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    // Handle successful script loading
    script.onload = () => {
          console.log('Google Maps script onload triggered');
          
          // Ensure Google Maps is loaded with multiple checks
          const checkMapsLoaded = () => {
            console.log('Checking Google Maps loaded state');
            console.log('window.google:', !!window.google);
            console.log('window.google.maps:', !!window.google?.maps);
            
        if (window.google?.maps) {
              console.log('Google Maps successfully loaded');
              resolve();
        } else {
              console.error('Google Maps script loaded but API not available');
              reject(new Error('Google Maps script loaded but API not available'));
        }
      };

          // Multiple checks to ensure loading
          setTimeout(checkMapsLoaded, 100);
          setTimeout(checkMapsLoaded, 500);
          setTimeout(checkMapsLoaded, 1000);
    };

    // Handle script loading error
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
          reject(new Error('Failed to load Google Maps script'));
    };

    // Append script to document
    document.head.appendChild(script);
      });
    }

    // Handle script loading
    scriptLoadPromise
      .then(() => {
        console.log('Google Maps loader promise resolved');
        setIsLoaded(true);
      })
      .catch((loadError) => {
        console.error('Google Maps loading error:', loadError);
        setError(loadError);
      });

    // Cleanup function
    return () => {
      console.log('Google Maps loader cleanup');
    };
  }, []);

  return { isLoaded, error };
} 