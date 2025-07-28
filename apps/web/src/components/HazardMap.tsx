import { useRef, useEffect, useState } from 'react'
import Map, { Marker, NavigationControl, ScaleControl } from 'react-map-gl/mapbox'
import type { MapRef } from 'react-map-gl/mapbox'
import { MapPin } from 'lucide-react'
import type { LocationResult } from '@/hooks/useLocationSearch'

interface HazardMapProps {
  selectedLocation: LocationResult | null
  className?: string
}

export function HazardMap({ selectedLocation, className = '' }: HazardMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [viewState, setViewState] = useState({
    latitude: 39.8283, // Center of USA
    longitude: -98.5795,
    zoom: 4
  })
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fly to location when selected
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedLocation.longitude, selectedLocation.latitude],
        zoom: 12,
        duration: 2000
      })
    }
  }, [selectedLocation])

  return (
    <div className={`w-full h-full bg-gray-100 ${className}`}>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
          <div className="text-red-600">Map Error: {error}</div>
        </div>
      )}
      {!mapLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        onLoad={() => {
          console.log('Map loaded successfully')
          setMapLoaded(true)
        }}
        onError={(evt) => {
          console.error('Map error:', evt)
          setError(evt.error?.message || 'Failed to load map')
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken="pk.eyJ1IjoibXNjaG9jazEiLCJhIjoiY202d2s3cjN6MGs5MDJrcHZiMWpnam95ayJ9.DdQXGrfBbc_nF0P48cOk9w"
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" />

        {selectedLocation && (
          <Marker
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
            anchor="bottom"
          >
            <div className="relative">
              <MapPin className="h-8 w-8 text-primary fill-primary animate-bounce" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover px-2 py-1 rounded shadow-md whitespace-nowrap text-sm">
                {selectedLocation.display}
              </div>
            </div>
          </Marker>
        )}
      </Map>
    </div>
  )
}