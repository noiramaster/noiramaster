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

  const seen = new Set<string>()
  const unique = allDiscovered.filter((lead) => {
    const key = `${lead.nombre_negocio.toLowerCase()}|${lead.ubicacion.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  log(`After in-memory dedup: ${unique.length}`)

  let verified: DiscoveredBusiness[] = []
  const toEnrich = unique.slice(0, MAX_LEADS_PER_RUN)
  if (toEnrich.length > 0) {
    log(`Verifying ${toEnrich.length} on Google Maps...`)
    try {
      verified = await enrichWithGoogleData(toEnrich)
      log(`Verified on Google Maps: ${verified.length}`)
    } catch (err) {
      log(`✗ Google Maps verification failed: ${err}`)
    }
  } else {
    log('⚠ NO businesses discovered — all Overpass queries returned 0 or errored.')
  }

  const enrichedKeys = new Set(verified.map((l) => `${l.nombre_negocio.toLowerCase()}|${l.ubicacion.toLowerCase()}`))
  const unverified = toEnrich.filter((l) => !enrichedKeys.has(`${l.nombre_negocio.toLowerCase()}|${l.ubicacion.toLowerCase()}`))
  if (unverified.length > 0) {
    log(`⚠ ${unverified.length} leads not verified on Google (saving without enrichment)`)
  }
  const limited = [...verified, ...unverified].slice(0, MAX_LEADS_PER_RUN)
  let saved = 0
  try {
    saved = await saveLeads(limited)
  } catch (err) {
    log(`✗ Failed to save leads: ${err}`)
  }

  if (saved === 0) {
    log('⚠⚠⚠ WARNING: 0 new leads saved. Check Overpass/Google logs above.')
  }
  log(`✅ Done. ${saved} new leads saved to Supabase.`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
