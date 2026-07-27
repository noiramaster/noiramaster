// Extrae datos de negocio desde un link de Google Maps sin API key
// Usa parseo de URL + Nominatim (OpenStreetMap) como fuente de datos estructurados
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

function parseMapsUrl(url: string): { query?: string; lat?: string; lng?: string } {
  try {
    const u = new URL(url)
    // Format: https://www.google.com/maps/place/Name/@lat,lng,zoom
    const placeMatch = u.pathname.match(/\/place\/([^/@]+)/)
    const coordsMatch = u.pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    // Format: https://maps.google.com/?q=Name
    const qParam = u.searchParams.get('q')
    return {
      query: placeMatch ? decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')) : qParam || undefined,
      lat: coordsMatch ? coordsMatch[1] : undefined,
      lng: coordsMatch ? coordsMatch[2] : undefined,
    }
  } catch {
    return {}
  }
}

function guessCategory(name: string): string {
  const kw: Record<string, string[]> = {
    restaurante: ['restaurant', 'restaurante', 'cafe', 'bar', 'comida', 'pizza', 'food', 'grill', 'tapas'],
    peluqueria: ['peluquer', 'barber', 'salon', 'beauty', 'hair', 'estética', 'uñas'],
    abogado: ['abogado', 'lawyer', 'notaría', 'bufete', 'legal', 'jurídico'],
    gimnasio: ['gym', 'gimnasio', 'fitness', 'crossfit', 'yoga', 'pilates', 'sport'],
    taller: ['taller', 'mecánico', 'auto', 'repair', 'garage', 'car'],
    clinica: ['clínica', 'clinic', 'dentist', 'dentista', 'doctor', 'health', 'salud', 'farmacia'],
    tienda: ['tienda', 'store', 'shop', 'boutique', 'retail', 'supermercado', 'bakery'],
  }
  const lower = name.toLowerCase()
  for (const [cat, words] of Object.entries(kw)) {
    if (words.some(w => lower.includes(w))) return cat
  }
  return 'generico'
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { mapsUrl } = await req.json()
  if (!mapsUrl) return NextResponse.json({ error: 'Pega el enlace de Google Maps' }, { status: 400 })

  const parsed = parseMapsUrl(mapsUrl)
  if (!parsed.query && !parsed.lat) return NextResponse.json({ error: 'No se pudo interpretar el enlace. Asegúrate de copiar el enlace completo de Google Maps.' }, { status: 400 })

  let nombre = parsed.query || ''
  let direccion = ''
  let telefono = ''
  let categoria = 'generico'

  try {
    const searchQuery = parsed.lat && parsed.lng
      ? `https://nominatim.openstreetmap.org/reverse?lat=${parsed.lat}&lon=${parsed.lng}&format=json&accept-language=es`
      : `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(nombre)}&format=json&limit=1&accept-language=es`

    const nomRes = await fetch(searchQuery, { headers: { 'User-Agent': 'noira-selfservice/1.0' } })
    if (nomRes.ok) {
      const nomData = await nomRes.json()
      const place = Array.isArray(nomData) ? nomData[0] : nomData
      if (place) {
        if (!nombre) nombre = place.name || place.display_name?.split(',')[0] || ''
        direccion = place.display_name || ''
        const address = place.address || {}
        categoria = guessCategory(nombre || address.shop || address.amenity || address.office || address.leisure || '')
      }
    }
  } catch {}

  if (!nombre) return NextResponse.json({ error: 'No se encontró el negocio en el enlace. Puedes rellenar los datos manualmente.' }, { status: 404 })

  categoria = guessCategory(nombre)

  return NextResponse.json({
    nombre_negocio: nombre,
    categoria,
    direccion,
    telefono,
    horario: '',
    servicios: [] as string[],
    descripcion: '',
  })
}
