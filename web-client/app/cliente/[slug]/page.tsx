import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

interface PageProps {
  params: { slug: string }
}

interface LeadData {
  id: string
  nombre_negocio: string
  categoria: string
  telefono?: string
  ubicacion: string
  pais: string
  idioma: string
}

interface WebData {
  id: string
  lead_id: string
  url_demo: string
  estilo_aplicado: string
  estado: string
}

async function getLeadData(slug: string): Promise<{
  lead: LeadData
  web: WebData
  copy: any
} | null> {
  const supabase = getSupabase()
  if (!supabase) return null

  const { data: webs } = await supabase
    .from('webs_generadas')
    .select('*, leads(*)')
    .ilike('url_demo', `%/cliente/${slug}`)
    .limit(1)

  if (!webs || webs.length === 0) return null

  const web = webs[0]
  const lead = web.leads as any as LeadData

  let copy: any = {}
  try {
    const sb = getSupabase()
    if (!sb) throw new Error('no supabase')
    const { data: raw } = await sb
      .from('webs_generadas')
      .select('estilo_aplicado')
      .ilike('url_demo', `%/cliente/${slug}`)
      .limit(1)
    if (raw && raw[0]?.estilo_aplicado) {
      const extra = JSON.parse(raw[0].estilo_aplicado)
      copy = extra.copy || {}
    }
  } catch {}

  return { lead, web, copy }
}

export default async function ClientPage({ params }: PageProps) {
  const data = await getLeadData(params.slug)
  if (!data) notFound()

  const { lead, copy } = data
  const name = lead.nombre_negocio
  const tel = lead.telefono
  const location = lead.ubicacion
  const category = lead.categoria

  const heroTitle = copy.hero_title || name
  const heroSub = copy.hero_subtitle || `Tu ${category} de confianza en ${location}`
  const services = copy.services || [
    'Atención personalizada',
    'Calidad garantizada',
    'Precios justos',
    'Horario flexible',
  ]
  const about = copy.about || `En ${name} llevamos años ofreciendo el mejor servicio a nuestros clientes en ${location}.`
  const cta = copy.cta || 'Contáctanos hoy'

  const styles = getStyleForCategory(category)

  return (
    <div style={{ background: styles.bg, color: styles.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <nav style={{ background: styles.navBg, borderBottom: `1px solid ${styles.border}` }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '16px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: styles.accent }}>{name}</span>
          <a
            href={`https://wa.me/${tel?.replace(/\s/g, '')}`}
            style={{
              background: styles.accent, color: '#fff', padding: '8px 20px',
              borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600
            }}
          >
            WhatsApp
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: styles.heroBg
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{
            fontSize: 42, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: 16, lineHeight: 1.2
          }}>
            {heroTitle}
          </h1>
          <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 32, lineHeight: 1.6 }}>
            {heroSub}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={`tel:${tel?.replace(/\s/g, '')}`}
              style={{
                background: styles.accent, color: '#fff', padding: '12px 28px',
                borderRadius: 8, textDecoration: 'none', fontWeight: 600
              }}
            >
              {tel || cta}
            </a>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(name + ' ' + location)}`}
              style={{
                border: `1px solid ${styles.border}`, color: styles.text,
                padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600
              }}
            >
              Cómo llegar
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section style={{
        padding: '64px 24px', background: styles.sectionBg,
        borderTop: `1px solid ${styles.border}`
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: 40, textAlign: 'center'
          }}>
            Nuestros servicios
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16
          }}>
            {services.map((s: string, i: number) => (
              <div key={i} style={{
                padding: 24, borderRadius: 12,
                background: styles.cardBg,
                border: `1px solid ${styles.border}`,
                textAlign: 'center',
                fontWeight: 500,
              }}>
                {s}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section style={{ padding: '64px 24px' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto', textAlign: 'center',
          lineHeight: 1.8, fontSize: 16, opacity: 0.85
        }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif',
            marginBottom: 24
          }}>
            Sobre nosotros
          </h2>
          <p>{about}</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${styles.border}`,
        padding: '32px 24px', textAlign: 'center', fontSize: 13, opacity: 0.5
      }}>
        <p>&copy; {new Date().getFullYear()} {name} &mdash; Web creada por NOIRA</p>
      </footer>
    </div>
  )
}

function getStyleForCategory(category: string): CategoryStyle {
  return STYLES[category.toLowerCase()] || STYLES['genérico']
}

interface CategoryStyle {
  bg: string
  text: string
  accent: string
  border: string
  navBg: string
  heroBg: string
  sectionBg: string
  cardBg: string
}

const STYLES: Record<string, CategoryStyle> = {
  restaurante: {
    bg: '#0A0A0F', text: '#F5F3FF', accent: '#E85D3A',
    border: '#2A2640', navBg: '#0A0A0F',
    heroBg: 'linear-gradient(135deg, #0A0A0F 0%, #1A0F0D 100%)',
    sectionBg: '#15131F', cardBg: '#1A181F',
  },
  peluqueria: {
    bg: '#0A0A0F', text: '#F5F3FF', accent: '#D946EF',
    border: '#2A2640', navBg: '#0A0A0F',
    heroBg: 'linear-gradient(135deg, #0A0A0F 0%, #1A0D1A 100%)',
    sectionBg: '#15131F', cardBg: '#1A181F',
  },
  abogado: {
    bg: '#0A0A0F', text: '#F5F3FF', accent: '#4F6F8F',
    border: '#2A2640', navBg: '#0A0A0F',
    heroBg: 'linear-gradient(135deg, #0A0A0F 0%, #0D111A 100%)',
    sectionBg: '#15131F', cardBg: '#1A181F',
  },
  gimnasio: {
    bg: '#0A0A0F', text: '#F5F3FF', accent: '#39FF88',
    border: '#2A2640', navBg: '#0A0A0F',
    heroBg: 'linear-gradient(135deg, #0A0A0F 0%, #0D1A11 100%)',
    sectionBg: '#15131F', cardBg: '#1A181F',
  },
  taller: {
    bg: '#0A0A0F', text: '#F5F3FF', accent: '#F59E0B',
    border: '#2A2640', navBg: '#0A0A0F',
    heroBg: 'linear-gradient(135deg, #0A0A0F 0%, #1A140D 100%)',
    sectionBg: '#15131F', cardBg: '#1A181F',
  },
  clinica: {
    bg: '#0A0A0F', text: '#F5F3FF', accent: '#06B6D4',
    border: '#2A2640', navBg: '#0A0A0F',
    heroBg: 'linear-gradient(135deg, #0A0A0F 0%, #0D151A 100%)',
    sectionBg: '#15131F', cardBg: '#1A181F',
  },
  tienda: {
    bg: '#0A0A0F', text: '#F5F3FF', accent: '#8B5CF6',
    border: '#2A2640', navBg: '#0A0A0F',
    heroBg: 'linear-gradient(135deg, #0A0A0F 0%, #140D1A 100%)',
    sectionBg: '#15131F', cardBg: '#1A181F',
  },
  genérico: {
    bg: '#0A0A0F', text: '#F5F3FF', accent: '#6C4CE0',
    border: '#2A2640', navBg: '#0A0A0F',
    heroBg: 'linear-gradient(135deg, #0A0A0F 0%, #13101A 100%)',
    sectionBg: '#15131F', cardBg: '#1A181F',
  },
}
