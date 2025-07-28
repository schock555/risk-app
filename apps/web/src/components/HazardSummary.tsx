import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Flame, Wind, AlertTriangle } from 'lucide-react'
import { useHazardData } from '@/hooks/useHazardData'
import { Skeleton } from '@/components/ui/skeleton'

interface HazardSummaryProps {
  zipCode: string
}

export function HazardSummary({ zipCode }: HazardSummaryProps) {
  const { hazardData, isLoading, error } = useHazardData(zipCode)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !hazardData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to fetch hazard data. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  const riskColors = {
    low: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    extreme: 'bg-red-100 text-red-800'
  }

  const severityColors = {
    NONE: 'bg-gray-100 text-gray-800',
    LOW: 'bg-green-100 text-green-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-orange-100 text-orange-800',
    EXTREME: 'bg-red-100 text-red-800'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Risk Assessment</CardTitle>
          <Badge className={riskColors[hazardData.overallRisk]}>
            {hazardData.overallRisk.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {hazardData.hazards.map((hazard: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hazard.type === 'WILDFIRE' && <Flame className="h-5 w-5 text-orange-600" />}
                {hazard.type === 'AIR_QUALITY' && <Wind className="h-5 w-5 text-blue-600" />}
                <h3 className="font-semibold">
                  {hazard.type === 'WILDFIRE' ? 'Wildfire' : 'Air Quality'}
                </h3>
              </div>
              <Badge className={severityColors[hazard.severity]}>
                {hazard.severity}
              </Badge>
            </div>

            {hazard.type === 'WILDFIRE' && hazard.data.fireCount > 0 && (
              <div className="text-sm text-gray-600">
                <p>{hazard.data.fireCount} active fires detected within {hazard.data.searchRadiusKm}km</p>
                {hazard.data.fires.slice(0, 3).map((fire: any, i: number) => (
                  <div key={i} className="mt-1 text-xs">
                    • Fire detected {fire.detectedAt} ({fire.confidence}% confidence)
                  </div>
                ))}
              </div>
            )}

            {hazard.type === 'AIR_QUALITY' && hazard.data.aqi !== undefined && (
              <div className="text-sm text-gray-600">
                <p>AQI: {hazard.data.aqi} ({hazard.data.category})</p>
                <p>Primary pollutant: {hazard.data.primaryPollutant}</p>
                <p className="mt-2 text-xs">{hazard.data.healthMessage}</p>
              </div>
            )}
          </div>
        ))}

        <div className="text-xs text-gray-500 text-right">
          Last updated: {new Date(hazardData.lastUpdated).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}