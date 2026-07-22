import { CITIES, CATEGORIES, MAX_LEADS_PER_RUN } from './config'
import { queryOverpass } from './overpass'
import { enrichWithGoogleData } from './google'
import { saveLeads } from './supabase'
import { DiscoveredBusiness } from './types'

async function main() {
  console.log('🔍 NOIRA Scraper - Starting discovery')
  console.log(`Cities: ${CITIES.length} | Categories: ${CATEGORIES.length} | Max leads: ${MAX_LEADS_PER_RUN}\n`)

  const allDiscovered: DiscoveredBusiness[] = []

  for (const city of CITIES) {
    for (const category of CATEGORIES) {
      console.log(`Querying ${city.name} / ${category.name}...`)

      try {
        const results = await queryOverpass(city, category)
        console.log(`  → ${results.length} businesses found (no website)`)

        allDiscovered.push(...results)
      } catch (err) {
        console.error(`  ✗ Error: ${err}`)
      }
    }
  }

  console.log(`\nTotal discovered without website: ${allDiscovered.length}`)
  console.log('Verifying on Google Maps...\n')

  const verified = await enrichWithGoogleData(allDiscovered)

  console.log(`\nVerified on Google Maps: ${verified.length}`)

  const limited = verified.slice(0, MAX_LEADS_PER_RUN)
  const saved = await saveLeads(limited)

  console.log(`\n✅ Done. ${saved} new leads saved to Supabase.`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
