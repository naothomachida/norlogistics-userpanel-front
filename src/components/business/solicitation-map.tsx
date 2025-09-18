'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface SolicitationMapProps {
  origem: string
  destino: string
  retorno?: string
  className?: string
}

export function SolicitationMap({ origem, destino, retorno, className }: SolicitationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  // Function to geocode address using OpenStreetMap Nominatim
  const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      }
      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  useEffect(() => {
    if (!mapRef.current) return

    // Initialize map centered on Brazil
    const map = L.map(mapRef.current).setView([-14.235, -51.9253], 4)
    mapInstanceRef.current = map

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Function to add markers and fit bounds
    const addMarkersAndFitBounds = async () => {
      const markers: L.Marker[] = []
      const bounds = L.latLngBounds([])

      // Add origin marker
      const origemCoords = await geocodeAddress(origem)
      if (origemCoords) {
        const origemMarker = L.marker(origemCoords)
          .addTo(map)
          .bindPopup(`<strong>Origem:</strong><br>${origem}`)
        markers.push(origemMarker)
        bounds.extend(origemCoords)
      }

      // Add destination marker
      const destinoCoords = await geocodeAddress(destino)
      if (destinoCoords) {
        const destinoMarker = L.marker(destinoCoords)
          .addTo(map)
          .bindPopup(`<strong>Destino:</strong><br>${destino}`)
        markers.push(destinoMarker)
        bounds.extend(destinoCoords)
      }

      // Add return marker if exists
      if (retorno) {
        const retornoCoords = await geocodeAddress(retorno)
        if (retornoCoords) {
          const retornoMarker = L.marker(retornoCoords)
            .addTo(map)
            .bindPopup(`<strong>Retorno:</strong><br>${retorno}`)
          markers.push(retornoMarker)
          bounds.extend(retornoCoords)
        }
      }

      // Draw lines between points if we have coordinates
      if (origemCoords && destinoCoords) {
        const line = L.polyline([origemCoords, destinoCoords], {
          color: '#3b82f6',
          weight: 3,
          opacity: 0.7
        }).addTo(map)

        if (retorno) {
          const retornoCoords = await geocodeAddress(retorno)
          if (retornoCoords) {
            const returnLine = L.polyline([destinoCoords, retornoCoords], {
              color: '#ef4444',
              weight: 3,
              opacity: 0.7,
              dashArray: '10, 10'
            }).addTo(map)
          }
        }
      }

      // Fit map to show all markers
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] })
      }
    }

    addMarkersAndFitBounds()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [origem, destino, retorno])

  return (
    <div
      ref={mapRef}
      className={`h-64 w-full rounded-lg ${className || ''}`}
      style={{ minHeight: '300px' }}
    />
  )
}