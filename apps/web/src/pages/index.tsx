import Head from 'next/head'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import { SearchBar } from '@/components/SearchBar'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HazardSummary } from '@/components/HazardSummary'
import type { LocationResult } from '@/hooks/useLocationSearch'

// Dynamic import to avoid SSR issues with Mapbox
const HazardMap = dynamic(
  () => import('@/components/HazardMap').then(mod => mod.HazardMap),
  { 
    ssr: false,
    loading: () => <Skeleton className="w-full h-full" />
  }
)

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<LocationResult | null>(null)

  const handleLocationSelect = (location: LocationResult) => {
    setSelectedLocation(location)
  }

  return (
    <>
      <Head>
        <title>Earth Risk Dashboard</title>
        <meta name="description" content="Check real-time environmental and disaster risks for any location" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b z-20">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-center mb-2">
              Earth Risk Dashboard
            </h1>
            <p className="text-center text-gray-600 mb-4">
              Check real-time environmental and disaster risks for any location
            </p>
            <div className="flex justify-center">
              <SearchBar onLocationSelect={handleLocationSelect} />
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative overflow-hidden">
          <HazardMap 
            selectedLocation={selectedLocation} 
            className=""
          />

          {/* Location Info and Hazard Cards */}
          {selectedLocation && (
            <div className="absolute top-4 left-4 z-10 space-y-4 max-w-sm">
              <Card className="p-4 shadow-lg">
                <h2 className="text-lg font-semibold mb-2">Location Details</h2>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Location:</span> {selectedLocation.display}</p>
                  <p><span className="font-medium">Coordinates:</span> {selectedLocation.latitude.toFixed(4)}°, {selectedLocation.longitude.toFixed(4)}°</p>
                  {selectedLocation.county && (
                    <p><span className="font-medium">County:</span> {selectedLocation.county}</p>
                  )}
                </div>
              </Card>
              
              <HazardSummary zipCode={selectedLocation.code} />
            </div>
          )}
        </div>
      </main>
    </>
  )
}