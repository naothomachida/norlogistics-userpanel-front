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
    if (!mapRef.current) return

    console.log('Processing polyline:', { polyline, originCoords, destCoords })

    // If we have polyline, decode and fit bounds
    if (polyline) {
      try {
        console.log('Decoding polyline with Mapbox library...')
        const decoded = polylineDecoder.decode(polyline)
        console.log(`Polyline decoded: ${decoded.length} points`)
        console.log('First 3 points:', decoded.slice(0, 3))
        console.log('First point detailed:', decoded[0])
        console.log('Last point detailed:', decoded[decoded.length - 1])

        // Fix coordinates - seems like they are 10x larger than expected
        const googleLatLngs = decoded.map(([lat, lng]) => ({
          lat: lat / 10,
          lng: lng / 10
        }))
        console.log('Fixed first point:', googleLatLngs[0])
        console.log('Fixed last point:', googleLatLngs[googleLatLngs.length - 1])
        setDecodedPath(googleLatLngs)

        if (googleLatLngs.length > 0) {
          // Get first and last points to create simple bounds
          const firstPoint = googleLatLngs[0]
          const lastPoint = googleLatLngs[googleLatLngs.length - 1]

          console.log('Setting center and zoom based on route endpoints')
          console.log('First point:', firstPoint)
          console.log('Last point:', lastPoint)
          console.log('Total polyline points:', googleLatLngs.length)

          // Calculate center point
          const centerLat = (firstPoint.lat + lastPoint.lat) / 2
          const centerLng = (firstPoint.lng + lastPoint.lng) / 2

          console.log('Center calculated:', { lat: centerLat, lng: centerLng })

          // Set center and zoom
          mapRef.current.setCenter({ lat: centerLat, lng: centerLng })
          mapRef.current.setZoom(9)

          console.log('Map centered and zoomed to level 12')
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
      mapRef.current.setZoom(12)

      console.log('Markers map centered and zoomed to level 12')
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
          zoom={4}
          onLoad={onMapLoad}
          options={mapOptions}
          onError={(error) => console.error('GoogleMap error:', error)}
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

