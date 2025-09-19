'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api'
import polylineDecoder from '@mapbox/polyline'

const GOOGLE_MAPS_API_KEY = 'AIzaSyB2DImKHfFUTwXMi5I_CTDxn_JQgDpi93w'

interface GoogleRouteMapProps {
  polyline?: string
  originAddress?: string
  destinationAddress?: string
  originCoords?: [number, number]
  destCoords?: [number, number]
  className?: string
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
}

const defaultCenter = {
  lat: -15.7942,
  lng: -47.8822
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true,
}

export default function GoogleRouteMap({
  polyline,
  originAddress,
  destinationAddress,
  originCoords,
  destCoords,
  className = "h-96 w-full rounded-lg"
}: GoogleRouteMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const [decodedPath, setDecodedPath] = useState<{lat: number, lng: number}[]>([])

  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded successfully')
    mapRef.current = map
  }, [])

  // Handle polyline and bounds in useEffect
  useEffect(() => {
    // Add a small delay to ensure the map is fully ready
    const updateMap = () => {
      if (!mapRef.current) return

      console.log('Processing polyline:', { polyline, originCoords, destCoords })

      // If we have polyline, decode and fit bounds
      if (polyline) {
        try {
          console.log('Decoding polyline with Mapbox library...')
          const decoded = polylineDecoder.decode(polyline)
          console.log(`Polyline decoded: ${decoded.length} points`)

          // Fix coordinates - seems like they are 10x larger than expected
          const googleLatLngs = decoded.map(([lat, lng]) => ({
            lat: lat / 10,
            lng: lng / 10
          }))
          console.log('Fixed first point:', googleLatLngs[0])
          console.log('Fixed last point:', googleLatLngs[googleLatLngs.length - 1])
          setDecodedPath(googleLatLngs)

          if (googleLatLngs.length > 0) {
            // Use fitBounds for better automatic zoom and center
            const bounds = new google.maps.LatLngBounds()

            // Add all points to bounds (sample every 10th point for performance)
            const samplePoints = googleLatLngs.filter((_, index) => index % 10 === 0 || index === 0 || index === googleLatLngs.length - 1)
            samplePoints.forEach(point => {
              bounds.extend(new google.maps.LatLng(point.lat, point.lng))
            })

            console.log('Fitting bounds to route with', samplePoints.length, 'sample points')

            // Fit bounds with padding
            mapRef.current.fitBounds(bounds, {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50
            })

            // Set a minimum zoom level after fitBounds
            setTimeout(() => {
              if (mapRef.current) {
                const currentZoom = mapRef.current.getZoom()
                if (currentZoom !== undefined && currentZoom > 13) {
                  mapRef.current.setZoom(13)
                } else if (currentZoom !== undefined && currentZoom < 9) {
                  mapRef.current.setZoom(9)
                }
              }
            }, 100)

            console.log('Map bounds fitted to route')
          }
        } catch (error) {
          console.error('Error decoding polyline:', error)
        }
      } else if (originCoords && destCoords) {
        console.log('Setting center and zoom for markers')

        // Calculate center point between origin and destination
        const centerLat = (originCoords[0] + destCoords[0]) / 2
        const centerLng = (originCoords[1] + destCoords[1]) / 2

        // Set center and zoom for markers
        mapRef.current.setCenter({ lat: centerLat, lng: centerLng })
        mapRef.current.setZoom(11)

        console.log('Markers map centered and zoomed to level 11')
      }
    }

    // Try immediately first
    updateMap()

    // If map reference isn't ready, try again in a moment
    if (!mapRef.current) {
      const timeout = setTimeout(updateMap, 200)
      return () => clearTimeout(timeout)
    }
  }, [polyline, originCoords, destCoords])

  return (
    <div className={className}>
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        onLoad={() => console.log('LoadScript loaded')}
        onError={(error) => console.error('LoadScript error:', error)}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={9}
          onLoad={onMapLoad}
          options={mapOptions}
        >
          {/* Origin Marker */}
          {originCoords && (
            <Marker
              position={{
                lat: originCoords[0],
                lng: originCoords[1]
              }}
              title={`Origem: ${originAddress || 'Ponto de origem'}`}
            />
          )}

          {/* Destination Marker */}
          {destCoords && (
            <Marker
              position={{
                lat: destCoords[0],
                lng: destCoords[1]
              }}
              title={`Destino: ${destinationAddress || 'Ponto de destino'}`}
            />
          )}

          {/* Polyline Route */}
          {decodedPath.length > 0 && (
            <Polyline
              path={decodedPath}
              options={{
                strokeColor: '#3b82f6', // Azul bonito
                strokeOpacity: 0.8,
                strokeWeight: 4,
              }}
              onLoad={() => console.log('Polyline component loaded with', decodedPath.length, 'points')}
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  )
}

