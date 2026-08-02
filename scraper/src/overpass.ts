import { DiscoveredBusiness, CityConfig, CategoryConfig } from './types'

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

function buildQuery(city: CityConfig, category: CategoryConfig): string {
  const [minLng, minLat, maxLng, maxLat] = city.bbox
  const nodeLines = category.osmTags.map(t => `node[${t}](${minLat},${minLng},${maxLat},${maxLng});`).join('\n      ')
  const wayLines = category.osmTags.map(t => `way[${t}](${minLat},${minLng},${maxLat},${maxLng});`).join('\n      ')

  return `[out:json][timeout:60];\n(\n      ${nodeLines}\n      ${wayLines}\n);\nout center;`
}

async function queryEndpoint(
  url: string,
  query: string,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'noira-scraper/1.0' },
      body: new URLSearchParams({ data: query }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

export async function queryOverpass(
  city: CityConfig,
  category: CategoryConfig
): Promise<DiscoveredBusiness[]> {
  const query = buildQuery(city, category)
  const lastError: Error = new Error('All Overpass endpoints failed')

  for (let attempt = 1; attempt <= 2; attempt++) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const res = await queryEndpoint(endpoint, query, 70000)
        if (!res.ok) {
          const body = await res.text()
          lastError.message = `Overpass error: HTTP ${res.status} — ${body.substring(0, 200)}`
          console.error(`  [retry] ${endpoint} returned HTTP ${res.status}, trying next...`)
          continue
        }
        let data: { elements: any[] }
        try {
          data = await res.json()
        } catch (parseErr: any) {
          const raw = await res.text()
          lastError.message = `Overpass JSON parse error: ${parseErr.message}. Raw response (first 300 chars): ${raw.substring(0, 300)}`
          continue
        }
        const elements = data.elements

        return elements
          .filter((el) => {
            const tags = el.tags || {}
            return !tags.website
          })
          .map((el) => {
            const tags = el.tags || {}
            const lat = el.lat || el.center?.lat || 0
            const lng = el.lon || el.center?.lon || 0

            return {
              nombre_negocio: tags.name || 'Sin nombre',
              categoria: category.name,
              telefono: tags.phone || undefined,
              ubicacion: [tags['addr:street'], tags['addr:housenumber'], tags['addr:city'], tags['addr:postcode']]
                .filter(Boolean)
                .join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              pais: city.pais,
              idioma: city.idioma,
              num_resenas: 0,
              tiene_web: false,
              lat,
              lng,
            }
          })
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err))
        lastError.message = e.message
        console.error(`  [retry] ${endpoint} failed (${e.message}), trying next...`)
      }
    }
  }

  throw lastError
}
