import axios from 'axios'
import { HazardType, Severity } from '@risk-dashboard/db'
import type { FIRMSFirePoint, LocationBounds, HazardData } from '../types/hazard'

const FIRMS_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv'

export async function getFIRMSData(
  bounds: LocationBounds
): Promise<HazardData | null> {
  const { latitude, longitude, radiusKm = 50 } = bounds
  
  // NASA FIRMS expects format: west,south,east,north
  // Create a bounding box from center point and radius
  const kmToDegrees = radiusKm / 111 // Rough conversion
  const west = longitude - kmToDegrees
  const east = longitude + kmToDegrees
  const south = latitude - kmToDegrees
  const north = latitude + kmToDegrees
  
  const bbox = `${west},${south},${east},${north}`
  
  // Get data from last 24 hours
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0]
  
  const params = new URLSearchParams({
    source: 'VIIRS_SNPP_NRT',
    date: dateStr,
    area: bbox
  })
  
  const url = `${FIRMS_BASE_URL}/${process.env.NASA_FIRMS_API_KEY}/VIIRS_SNPP_NRT/${bbox}/1/${dateStr}`
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Earth-Risk-Dashboard/1.0'
      },
      timeout: 10000
    })
    
    // Parse CSV response
    const fires = parseFiresCSV(response.data)
    
    // Filter fires within actual radius (CSV returns rectangle)
    const nearbyFires = fires.filter(fire => {
      const distance = calculateDistance(
        latitude, longitude,
        fire.latitude, fire.longitude
      )
      return distance <= radiusKm
    })
    
    // Calculate severity based on fire count and proximity
    const severity = calculateFireSeverity(nearbyFires, latitude, longitude)
    
    return {
      type: HazardType.WILDFIRE,
      severity,
      data: {
        fireCount: nearbyFires.length,
        fires: nearbyFires.map(fire => ({
          lat: fire.latitude,
          lng: fire.longitude,
          brightness: fire.brightness,
          confidence: fire.confidence,
          frp: fire.frp, // Fire Radiative Power
          satellite: fire.satellite,
          detectedAt: `${fire.acq_date} ${fire.acq_time}`
        })),
        searchRadiusKm: radiusKm
      },
      source: 'NASA_FIRMS',
      timestamp: new Date()
    }
  } catch (error) {
    console.error('FIRMS API error:', error)
    return null
  }
}

function parseFiresCSV(csvText: string): FIRMSFirePoint[] {
  const lines = csvText.trim().split('\n')
  if (lines.length < 2) return []
  
  const headers = lines[0].split(',')
  const fires: FIRMSFirePoint[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    const fire: any = {}
    
    headers.forEach((header, index) => {
      const value = values[index]
      if (header === 'latitude' || header === 'longitude' || 
          header === 'brightness' || header === 'bright_t31' || 
          header === 'frp' || header === 'scan' || header === 'track') {
        fire[header] = parseFloat(value)
      } else if (header === 'confidence' || header === 'version') {
        fire[header] = parseFloat(value)
      } else {
        fire[header] = value
      }
    })
    
    fires.push(fire as FIRMSFirePoint)
  }
  
  return fires
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function calculateFireSeverity(fires: FIRMSFirePoint[], centerLat: number, centerLng: number): Severity {
  if (fires.length === 0) return Severity.NONE
  
  // Consider both count and proximity
  let severityScore = 0
  
  fires.forEach(fire => {
    const distance = calculateDistance(centerLat, centerLng, fire.latitude, fire.longitude)
    const proximity = Math.max(0, 50 - distance) / 50 // 0-1 scale
    const intensity = fire.frp ? Math.min(fire.frp / 100, 1) : 0.5 // Normalize FRP
    
    severityScore += proximity * intensity * (fire.confidence / 100)
  })
  
  // Thresholds
  if (severityScore >= 5 || fires.length >= 20) return Severity.EXTREME
  if (severityScore >= 2 || fires.length >= 10) return Severity.HIGH
  if (severityScore >= 0.5 || fires.length >= 3) return Severity.MODERATE
  return Severity.LOW
}