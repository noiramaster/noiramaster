import { GoogleGenerativeAI } from '@google/generative-ai'
import { LeadData, GeneratedCopy } from './types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateCopy(lead: LeadData): Promise<GeneratedCopy> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `Eres un redactor profesional de webs para negocios locales.
Genera contenido para la web de "${lead.nombre_negocio}", un negocio de tipo "${lead.categoria}" ubicado en "${lead.ubicacion}" (${lead.pais}).
El idioma debe ser ${lead.idioma === 'fr' ? 'francés' : 'español'}.
No uses emojis. Responde SOLO con JSON válido con esta estructura exacta:
{
  "hero_title": "Título principal impactante (máx 8 palabras)",
  "hero_subtitle": "Frase de subtítulo descriptiva (máx 15 palabras)",
  "services": ["Servicio 1", "Servicio 2", "Servicio 3", "Servicio 4"],
  "about": "Párrafo corto de unos 30-40 palabras sobre el negocio",
  "cta": "Llamada a la acción corta (máx 5 palabras)"
}`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No valid JSON in Gemini response')

  const copy: GeneratedCopy = JSON.parse(jsonMatch[0])

  copy.hero_title = copy.hero_title || lead.nombre_negocio
  copy.hero_subtitle = copy.hero_subtitle || (lead.idioma === 'fr' ? `Votre ${lead.categoria} de confiance` : `Tu ${lead.categoria} de confianza`)
  copy.services = copy.services || (lead.idioma === 'fr'
    ? ['Service personnalisé', 'Qualité garantie', 'Prix justes', 'Horaires flexibles']
    : ['Atención personalizada', 'Calidad garantizada', 'Precios justos', 'Horario flexible'])
  copy.about = copy.about || (lead.idioma === 'fr'
    ? `${lead.nombre_negocio} propose des services de ${lead.categoria} à ${lead.ubicacion}.`
    : `${lead.nombre_negocio} ofrece servicios de ${lead.categoria} en ${lead.ubicacion}.`)
  copy.cta = copy.cta || (lead.idioma === 'fr' ? 'Contactez-nous' : 'Contáctanos')

  return copy
}
