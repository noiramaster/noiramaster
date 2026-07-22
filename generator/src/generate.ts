import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { LeadData, GeneratedCopy, GeneratedWeb } from './types'
import { getStyleForCategory } from './styles'
import { generateCopy } from './gemini'

async function validateWeb(url: string, businessName: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) {
      console.warn(`  ⚠ Validation: HTTP ${res.status} for ${url}`)
      return false
    }
    const text = await res.text()
    if (!text.includes(businessName)) {
      console.warn(`  ⚠ Validation: "${businessName}" not found in page content`)
      return false
    }
    console.log(`  ✓ Validation: ${url} loads OK and contains business name`)
    return true
  } catch (err: any) {
    console.warn(`  ⚠ Validation failed: ${err.message}`)
    return false
  }
}

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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export async function generateWebForLead(lead: LeadData): Promise<GeneratedWeb | null> {
  console.log(`\n🎨 Generating web for: ${lead.nombre_negocio}`)

  const style = getStyleForCategory(lead.categoria)
  console.log(`  Style: ${style.name} (${style.accentColor})`)

  let copy: GeneratedCopy
  try {
    copy = await generateCopy(lead)
    console.log(`  Copy generated: "${copy.hero_title}"`)
  } catch (err) {
    console.error(`  ✗ Gemini error: ${err}`)
    console.log('  Using fallback copy')
    copy = {
      hero_title: lead.nombre_negocio,
      hero_subtitle: `Tu ${lead.categoria} de confianza en ${lead.ubicacion.split(',')[0] || lead.ubicacion}`,
      services: ['Atención personalizada', 'Calidad garantizada', 'Precios justos', 'Horario flexible'],
      about: `En ${lead.nombre_negocio} llevamos años ofreciendo el mejor servicio a nuestros clientes en ${lead.ubicacion}. Visítanos y descubre por qué somos la mejor opción.`,
      cta: 'Contáctanos hoy',
    }
  }

  const slug = slugify(lead.nombre_negocio)
  const url_demo = `https://noira-demos.vercel.app/cliente/${slug}`

  const estilo_aplicado = JSON.stringify({
    style: style.name,
    accentColor: style.accentColor,
    heroGradient: style.heroGradient,
    copy,
  })

  const webData = {
    lead_id: lead.id,
    url_demo,
    estilo_aplicado,
    estado: 'aprobada' as const,
  }

  const { error, data } = await getDb()
    .from('webs_generadas')
    .insert(webData)
    .select()
    .single()

  if (error) {
    console.error(`  ✗ Supabase error: ${error.message}`)
    const { error: err2 } = await getDb().from('webs_generadas').insert(webData)
    if (err2) {
      console.error(`  ✗ Supabase error (retry): ${err2.message}`)
      return null
    }
  }

  // Auto-validation before publishing
  const valid = await validateWeb(url_demo, lead.nombre_negocio)
  if (!valid) {
    console.warn(`  ⚠ Web auto-approved despite validation warning — check manually: ${url_demo}`)
  } else {
    console.log(`  🟢 Web auto-approved and validated: ${url_demo}`)
  }

  // Advance lead to email_listo (same as old approve-web API did)
  await getDb().from('leads').update({ estado: 'email_listo' }).eq('id', lead.id)

  if (data) {
    console.log(`  ✓ Web saved: ${url_demo}`)
    return data as GeneratedWeb
  }

  return { lead_id: lead.id, url_demo, estilo_aplicado, estado: 'aprobada' }
}
