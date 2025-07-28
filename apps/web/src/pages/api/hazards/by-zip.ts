import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@risk-dashboard/db'
import { getHazardsByZip } from '@risk-dashboard/core-api/src/services/hazardService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { zip } = req.query

  if (!zip || typeof zip !== 'string') {
    return res.status(400).json({ error: 'ZIP code is required' })
  }

  // Validate ZIP format
  if (!/^\d{5}$/.test(zip)) {
    return res.status(400).json({ error: 'Invalid ZIP code format' })
  }

  try {
    // Look up ZIP code in database
    const zipCode = await prisma.zipCode.findUnique({
      where: { code: zip }
    })

    if (!zipCode) {
      return res.status(404).json({ error: 'ZIP code not found' })
    }

    // Get hazard data
    const hazardSummary = await getHazardsByZip(zipCode)

    // Cache for 30 minutes
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate')
    
    return res.status(200).json(hazardSummary)
  } catch (error) {
    console.error('Hazards API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}