import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

const prisma = new PrismaClient()

interface ZipRow {
  zip: string
  lat: string
  lng: string
  city: string
  state_id: string
  state_name: string
  county_name: string
  timezone: string
}

async function main() {
  console.log('🌎 Starting ZIP code import...')
  
  const zipCodes: any[] = []
  const csvPath = path.join(__dirname, '../data/uszips.csv')
  
  // Read and parse CSV
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: ZipRow) => {
        // Skip invalid entries
        if (!row.zip || !row.lat || !row.lng) return
        
        zipCodes.push({
          code: row.zip.padStart(5, '0'), // Ensure 5 digits
          latitude: parseFloat(row.lat),
          longitude: parseFloat(row.lng),
          city: row.city,
          state: row.state_id,
          county: row.county_name || null,
          timezone: row.timezone || 'America/New_York'
        })
      })
      .on('end', resolve)
      .on('error', reject)
  })
  
  console.log(`📊 Found ${zipCodes.length} valid ZIP codes`)
  
  // Clear existing data
  console.log('🗑️  Clearing existing ZIP codes...')
  await prisma.zipCode.deleteMany()
  
  // Import in batches for better performance
  const batchSize = 1000
  for (let i = 0; i < zipCodes.length; i += batchSize) {
    const batch = zipCodes.slice(i, i + batchSize)
    await prisma.zipCode.createMany({
      data: batch,
      skipDuplicates: true
    })
    console.log(`✅ Imported ${Math.min(i + batchSize, zipCodes.length)} / ${zipCodes.length}`)
  }
  
  // Verify import
  const count = await prisma.zipCode.count()
  console.log(`🎉 Successfully imported ${count} ZIP codes!`)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })