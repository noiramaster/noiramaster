export interface LeadData {
  id: string
  nombre_negocio: string
  categoria: string
  telefono?: string
  ubicacion: string
  pais: string
  idioma: string
  num_resenas: number
}

export interface GeneratedCopy {
  hero_title: string
  hero_subtitle: string
  services: string[]
  about: string
  cta: string
}

export interface StylePreset {
  name: string
  categories: string[]
  accentColor: string
  heroGradient: string
}

export interface GeneratedWeb {
  lead_id: string
  url_demo: string
  estilo_aplicado: string
  estado: 'pendiente_revision'
}
