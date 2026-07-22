import { CITIES, CATEGORIES, MAX_LEADS_PER_RUN } from './config'
import { queryOverpass } from './overpass'
import { enrichWithGoogleData } from './google'
import { saveLeads } from './supabase'
import { DiscoveredBusiness } from './types'

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

async function main() {
  log('🔍 NOIRA Scraper - Starting discovery')
  log(`Cities: ${CITIES.length} | Categories: ${CATEGORIES.length} | Max leads: ${MAX_LEADS_PER_RUN}`)

  const allDiscovered: DiscoveredBusiness[] = []

  for (const city of CITIES) {
    for (const category of CATEGORIES) {
      log(`Querying ${city.name} / ${category.name}...`)

      try {
        const results = await queryOverpass(city, category)
        log(`  → ${results.length} businesses found (no website)`)

        allDiscovered.push(...results)
      } catch (err) {
        log(`  ✗ Overpass error: ${err}`)
      }
    }
  }

  log(`Total discovered without website: ${allDiscovered.length}`)

  let verified: DiscoveredBusiness[] = []
  if (allDiscovered.length > 0) {
    log('Verifying on Google Maps...')
    try {
      verified = await enrichWithGoogleData(allDiscovered)
      log(`Verified on Google Maps: ${verified.length}`)
    } catch (err) {
      log(`✗ Google Maps verification failed: ${err}`)
    }
  } else {
    log('Skipping Google verification — no businesses discovered.')
  }

  const limited = verified.slice(0, MAX_LEADS_PER_RUN)
  let saved = 0
  try {
    saved = await saveLeads(limited)
  } catch (err) {
    log(`✗ Failed to save leads: ${err}`)
  }

  log(`✅ Done. ${saved} new leads saved to Supabase.`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
