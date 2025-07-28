import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@risk-dashboard/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q } = req.query

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' })
  }

  try {
    // Check if it's a ZIP code (5 digits)
    const isZipCode = /^\d{5}$/.test(q.trim())
    
    if (isZipCode) {
      // Direct ZIP code lookup
      const zipCode = await prisma.zipCode.findUnique({
        where: { code: q.trim() }
      })

      if (zipCode) {
        return res.status(200).json({
          results: [{
            type: 'zip',
            code: zipCode.code,
            city: zipCode.city,
            state: zipCode.state,
            county: zipCode.county,
            latitude: zipCode.latitude,
            longitude: zipCode.longitude,
            display: `${zipCode.code} - ${zipCode.city}, ${zipCode.state}`
          }]
        })
      }
    } else {
      // Search by city name (case-insensitive)
      const results = await prisma.zipCode.findMany({
        where: {
          city: {
            contains: q.trim(),
            mode: 'insensitive'
          }
        },
        take: 10,
        orderBy: [
          { state: 'asc' },
          { city: 'asc' }
        ]
      })

      return res.status(200).json({
        results: results.map(zip => ({
          type: 'city',
          code: zip.code,
          city: zip.city,
          state: zip.state,
          county: zip.county,
          latitude: zip.latitude,
          longitude: zip.longitude,
          display: `${zip.city}, ${zip.state} ${zip.code}`
        }))
      })
    }

    return res.status(200).json({ results: [] })
  } catch (error) {
    console.error('Geocode error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}