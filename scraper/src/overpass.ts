import { DiscoveredBusiness, CityConfig, CategoryConfig } from './types'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

function buildQuery(city: CityConfig, category: CategoryConfig): string {
  const [minLng, minLat, maxLng, maxLat] = city.bbox
  const nodeLines = category.osmTags.map(t => `node${t}(${minLat},${minLng},${maxLat},${maxLng});`).join('\n      ')
  const wayLines = category.osmTags.map(t => `way${t}(${minLat},${minLng},${maxLat},${maxLng});`).join('\n      ')

  return `[out:json][timeout:60];\n(\n      ${nodeLines}\n      ${wayLines}\n);\nout center;`
}

export async function queryOverpass(
  city: CityConfig,
  category: CategoryConfig
): Promise<DiscoveredBusiness[]> {
  const query = buildQuery(city, category)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 70000)

  let res: Response
  try {
    res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ data: query }),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!res.ok) {
    throw new Error(`Overpass error: ${res.status} ${await res.text()}`)
  }

  const data: { elements: any[] } = await res.json()
  const elements = data.elements

  return elements
    .filter((el) => {
      const tags = el.tags || {}
      return !tags.website && !tags.phone
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
}
