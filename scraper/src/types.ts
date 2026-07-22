export interface DiscoveredBusiness {
  nombre_negocio: string
  categoria: string
  telefono?: string
  ubicacion: string
  pais: 'ES' | 'MA'
  idioma: 'es' | 'fr'
  num_resenas: number
  tiene_web: boolean
  lat: number
  lng: number
}

export interface CityConfig {
  name: string
  pais: 'ES' | 'MA'
  idioma: 'es' | 'fr'
  bbox: [number, number, number, number]
}

export interface CategoryConfig {
  name: string
  osmTags: string[]
  googleCategory: string
}
