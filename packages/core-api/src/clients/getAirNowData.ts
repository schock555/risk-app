import axios from 'axios'
import { HazardType, Severity } from '@risk-dashboard/db'
import type { AirNowObservation, HazardData } from '../types/hazard'

const AIRNOW_BASE_URL = 'https://www.airnowapi.org/aq/observation/zipCode/current'

export async function getAirNowData(zipCode: string): Promise<HazardData | null> {
  const params = new URLSearchParams({
    format: 'application/json',
    zipCode: zipCode,
    API_KEY: process.env.EPA_AIRNOW_API_KEY || ''
  })
  
  try {
    const response = await axios.get<AirNowObservation[]>(
      `${AIRNOW_BASE_URL}?${params}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Earth-Risk-Dashboard/1.0'
        },
        timeout: 10000
      }
    )
    
    if (!response.data || response.data.length === 0) {
      return {
        type: HazardType.AIR_QUALITY,
        severity: Severity.NONE,
        data: {
          message: 'No air quality data available for this location'
        },
        source: 'EPA_AIRNOW',
        timestamp: new Date()
      }
    }
    
    // Find the primary pollutant (highest AQI)
    const primaryPollutant = response.data.reduce((prev, current) => 
      (current.AQI > prev.AQI) ? current : prev
    )
    
    const severity = calculateAQISeverity(primaryPollutant.AQI)
    
    return {
      type: HazardType.AIR_QUALITY,
      severity,
      data: {
        aqi: primaryPollutant.AQI,
        category: primaryPollutant.Category.Name,
        primaryPollutant: primaryPollutant.ParameterName,
        reportingArea: primaryPollutant.ReportingArea,
        stateCode: primaryPollutant.StateCode,
        observations: response.data.map(obs => ({
          pollutant: obs.ParameterName,
          aqi: obs.AQI,
          category: obs.Category.Name,
          dateObserved: obs.DateObserved,
          hour: obs.HourObserved
        })),
        healthMessage: getHealthMessage(primaryPollutant.AQI)
      },
      source: 'EPA_AIRNOW',
      timestamp: new Date()
    }
  } catch (error) {
    console.error('AirNow API error:', error)
    return null
  }
}

function calculateAQISeverity(aqi: number): Severity {
  if (aqi <= 50) return Severity.NONE        // Good
  if (aqi <= 100) return Severity.LOW        // Moderate
  if (aqi <= 150) return Severity.MODERATE   // Unhealthy for Sensitive Groups
  if (aqi <= 200) return Severity.HIGH       // Unhealthy
  return Severity.EXTREME                     // Very Unhealthy to Hazardous
}

function getHealthMessage(aqi: number): string {
  if (aqi <= 50) {
    return 'Air quality is good. It\'s a great day to be outside!'
  } else if (aqi <= 100) {
    return 'Air quality is moderate. Unusually sensitive people should consider limiting prolonged outdoor exertion.'
  } else if (aqi <= 150) {
    return 'Unhealthy for sensitive groups. People with heart or lung disease, older adults, and children should limit prolonged outdoor exertion.'
  } else if (aqi <= 200) {
    return 'Unhealthy. Everyone should avoid prolonged outdoor exertion; sensitive groups should avoid all outdoor exertion.'
  } else if (aqi <= 300) {
    return 'Very unhealthy. Everyone should avoid all outdoor exertion.'
  } else {
    return 'Hazardous. Everyone should avoid all outdoor activities.'
  }
}