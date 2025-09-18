'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet's default icons issue in Next.js
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface RouteMapProps {
  polyline?: string
  originAddress?: string
  destinationAddress?: string
  originCoords?: [number, number]
  destCoords?: [number, number]
  className?: string
}

export default function RouteMap({
  polyline,
  originAddress,
  destinationAddress,
  originCoords,
  destCoords,
  className = "h-96 w-full rounded-lg"
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const routeLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map if not already created
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([-23.5505, -46.6333], 10) // São Paulo center

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current)

      routeLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)
    }

    // Clear existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers()
    }

    const map = mapInstanceRef.current
    const routeLayer = routeLayerRef.current

    if (!routeLayer) return

    // Add markers and route if data is available
    if (originCoords && destCoords) {
      // Add origin marker
      const originMarker = L.marker(originCoords)
        .bindPopup(`<strong>Origem:</strong><br>${originAddress || 'Ponto de origem'}`)
      routeLayer.addLayer(originMarker)

      // Add destination marker
      const destMarker = L.marker(destCoords)
        .bindPopup(`<strong>Destino:</strong><br>${destinationAddress || 'Ponto de destino'}`)
      routeLayer.addLayer(destMarker)

      // If polyline is available, decode and display it
      if (polyline) {
        try {
          const decodedPath = decodePolyline(polyline)
          const routeLine = L.polyline(decodedPath, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.7
          })
          routeLayer.addLayer(routeLine)

          // Fit map to show the entire route
          const group = L.featureGroup([originMarker, destMarker, routeLine])
          map.fitBounds(group.getBounds(), { padding: [20, 20] })
        } catch (error) {
          console.error('Erro ao decodificar polyline:', error)
          // Fallback: just show markers and fit to them
          const group = L.featureGroup([originMarker, destMarker])
          map.fitBounds(group.getBounds(), { padding: [50, 50] })
        }
      } else {
        // No polyline: fit map to show both markers
        const group = L.featureGroup([originMarker, destMarker])
        map.fitBounds(group.getBounds(), { padding: [50, 50] })
      }
    }

    // Cleanup function
    return () => {
      if (routeLayerRef.current) {
        routeLayerRef.current.clearLayers()
      }
    }
  }, [polyline, originAddress, destinationAddress, originCoords, destCoords])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  return (
    <div className={className}>
      <div ref={mapRef} className="h-full w-full rounded-lg" />
    </div>
  )
}

// Polyline decoder (simplified implementation)
function decodePolyline(encoded: string): [number, number][] {
  const poly: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let b: number
    let shift = 0
    let result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
    lat += dlat

    shift = 0
    result = 0

    do {
      b = encoded.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)

    const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
    lng += dlng

    poly.push([lat / 1e5, lng / 1e5])
  }

  return poly
}