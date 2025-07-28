import type { HazardType, Severity } from '@risk-dashboard/db'

export interface HazardData {
  type: HazardType
  severity: Severity
  data: Record<string, any>
  source: string
  timestamp: Date
}

export interface LocationBounds {
  latitude: number
  longitude: number
  radiusKm?: number
}

export interface FIRMSFirePoint {
  latitude: number
  longitude: number
  brightness: number
  scan: number
  track: number
  acq_date: string
  acq_time: string
  satellite: string
  instrument: string
  confidence: number
  version: string
  bright_t31: number
  frp: number
  daynight: string
}

export interface AirNowObservation {
  DateObserved: string
  HourObserved: number
  LocalTimeZone: string
  ReportingArea: string
  StateCode: string
  Latitude: number
  Longitude: number
  ParameterName: string
  AQI: number
  Category: {
    Number: number
    Name: string
  }
}