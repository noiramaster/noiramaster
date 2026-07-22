import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { LeadData } from './types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

let _supabase: SupabaseClient | null = null
function getDb(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
  }
  return _supabase
}

export async function generateEmailForLead(lead: LeadData): Promise<void> {
  console.log(`\n✉️  Generating email for: ${lead.nombre_negocio}`)

  const slug = lead.nombre_negocio
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

  const webUrl = `https://noiramaster-web-client.vercel.app/cliente/${slug}`

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `Eres un asistente de ventas para NOIRA, una agencia que crea webs para negocios locales.

Genera un email corto y persuasivo para el dueño de "${lead.nombre_negocio}" (${lead.categoria} en ${lead.ubicacion}).
El idioma debe ser ${lead.idioma === 'fr' ? 'francés' : 'español'}.

Requisitos:
- MÁXIMO 1-2 emojis en todo el email
- Incluye este enlace a su web ya creada: ${webUrl}
- Incluye este enlace a la agencia NOIRA: https://noiramaster-web-client.vercel.app
- Incluye un texto de baja: "Si no quieres recibir más emails, responde BAJA"
- Remitente identificado: "NOIRA — Cazamos negocios invisibles"
- Dirección física (placeholder): [DIRECCIÓN FÍSICA DE NOIRA]
- Tono cercano pero profesional
- Extensión máxima: 150 palabras

Responde SOLO con JSON:
{
  "asunto": "línea de asunto (máx 10 palabras)",
  "cuerpo": "cuerpo del email en texto plano"
}`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No valid JSON in Gemini response')

    const email = JSON.parse(jsonMatch[0])

    const { error } = await getDb().from('emails').insert({
      lead_id: lead.id,
      asunto: email.asunto,
      cuerpo: email.cuerpo,
      estado: 'borrador',
    })

    if (error) {
      console.error(`  ✗ Supabase error: ${error.message}`)
    } else {
      console.log(`  ✓ Email saved: "${email.asunto}"`)
    }
  } catch (err) {
    console.error(`  ✗ Gemini error: ${err}`)

    // Fallback: generate a basic email without AI
    const asunto = `¿${lead.nombre_negocio} sin web? Te tenemos cubierto`
    const cuerpo = `Hola,\n\nSomos NOIRA, una agencia que ayuda a negocios locales como ${lead.nombre_negocio} a tener presencia online.\n\nHemos preparado una web profesional para ti:\n${webUrl}\n\nEs gratis y sin compromiso. Solo tienes que decirnos si quieres publicarla.\n\nMás info: https://noiramaster-web-client.vercel.app\n\n[DIRECCIÓN FÍSICA DE NOIRA]\nSi no quieres recibir más emails, responde BAJA\n\nUn saludo,\nNOIRA`

    const { error } = await getDb().from('emails').insert({
      lead_id: lead.id,
      asunto,
      cuerpo,
      estado: 'borrador',
    })

    if (error) {
      console.error(`  ✗ Supabase fallback error: ${error.message}`)
    } else {
      console.log(`  ✓ Fallback email saved: "${asunto}"`)
    }
  }
}
