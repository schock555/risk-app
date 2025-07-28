import { getFIRMSData } from '../clients/getFIRMSData'
import { getAirNowData } from '../clients/getAirNowData'
import type { HazardData } from '../types/hazard'
import type { ZipCode } from '@risk-dashboard/db'

export interface HazardSummary {
  zipCode: string
  location: {
    city: string
    state: string
    county: string | null
    coordinates: {
      latitude: number
      longitude: number
    }
  }
  hazards: HazardData[]
  overallRisk: 'low' | 'moderate' | 'high' | 'extreme'
  lastUpdated: Date
}

export async function getHazardsByZip(
  zipCode: ZipCode
): Promise<HazardSummary> {
  // Fetch all hazard data in parallel
  const [wildfireData, airQualityData] = await Promise.all([
    getFIRMSData({
      latitude: zipCode.latitude,
      longitude: zipCode.longitude,
      radiusKm: 50
    }),
    getAirNowData(zipCode.code)
  ])
  
  const hazards: HazardData[] = []
  
  if (wildfireData) hazards.push(wildfireData)
  if (airQualityData) hazards.push(airQualityData)
  
  // Calculate overall risk level
  const overallRisk = calculateOverallRisk(hazards)
  
  return {
    zipCode: zipCode.code,
    location: {
      city: zipCode.city,
      state: zipCode.state,
      county: zipCode.county,
      coordinates: {
        latitude: zipCode.latitude,
        longitude: zipCode.longitude
      }
    },
    hazards,
    overallRisk,
    lastUpdated: new Date()
  }
}

function calculateOverallRisk(hazards: HazardData[]): 'low' | 'moderate' | 'high' | 'extreme' {
  if (hazards.length === 0) return 'low'
  
  // Map severity to numeric values
  const severityValues = {
    NONE: 0,
    LOW: 1,
    MODERATE: 2,
    HIGH: 3,
    EXTREME: 4
  }
  
  // Get the highest severity among all hazards
  const maxSeverity = Math.max(
    ...hazards.map(h => severityValues[h.severity])
  )
  
  // Count high-severity hazards
  const highSeverityCount = hazards.filter(
    h => severityValues[h.severity] >= 3
  ).length
  
  // If multiple high-severity hazards, bump up the risk
  if (highSeverityCount >= 2) {
    return 'extreme'
  }
  
  // Map back to risk levels
  if (maxSeverity >= 4) return 'extreme'
  if (maxSeverity >= 3) return 'high'
  if (maxSeverity >= 2) return 'moderate'
  return 'low'
}