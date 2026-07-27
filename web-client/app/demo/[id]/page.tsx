import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export default async function DemoPage({ params }: { params: { id: string } }) {
  const supabase = getSupabase()
  if (!supabase) return <div>Error de configuración</div>

  const { data: web } = await supabase
    .from('webs_selfservice')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!web) notFound()

  const isExpired = web.fecha_caducidad && new Date(web.fecha_caducidad) < new Date() && web.estado_pago !== 'activa'

  const isPaid = web.estado_pago === 'activa'
  if (isExpired || web.estado_pago === 'cancelada' || web.estado_pago === 'impagada') {
    const lang = web.idioma || 'es'
    const title = lang === 'fr' ? 'Démo expirée' : 'Demo caducada'
    const desc = lang === 'fr'
      ? 'Cette démonstration de site web n\'est plus disponible.'
      : 'Esta web de demostración ya no está disponible.'
    return (
      <html lang={lang}><body style={{ margin: 0, background: '#000', color: '#e0e0e0', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: 480, padding: 40 }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 700, marginBottom: 16 }}>{title}</h1>
          <p style={{ color: '#666', lineHeight: 1.6, marginBottom: 24 }}>{desc}</p>
        </div>
      </body></html>
    )
  }

  if (web.pagina_html) {
    return <div dangerouslySetInnerHTML={{ __html: web.pagina_html }} />
  }

  let copy: any = {}
  try { copy = JSON.parse(web.estilo_aplicado || '{}').copy || {} } catch {}
  let style: any = {}
  try { style = JSON.parse(web.estilo_aplicado || '{}') } catch {}

  const accent = style.accentColor || '#39ff14'
  const heroGradient = style.heroGradient || 'linear-gradient(135deg, #000 0%, #0a0a0a 100%)'
  const services = copy.services || ['Atención personalizada', 'Calidad garantizada', 'Precios justos', 'Horario flexible']

  return (
    <html lang={web.idioma || 'es'}>
      <body style={{ margin: 0, background: '#000', color: '#e0e0e0', fontFamily: 'Inter, sans-serif' }}>
        <nav style={{ background: '#000', borderBottom: '1px solid #222', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1100, margin: '0 auto' }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: accent }}>{web.nombre_negocio}</span>
          {web.telefono && <a href={`https://wa.me/${web.telefono.replace(/\s/g,'')}`} style={{ background: accent, color: '#000', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>WhatsApp</a>}
        </nav>
        <section style={{ padding: '80px 24px', textAlign: 'center', background: heroGradient }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <h1 style={{ fontSize: 42, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 16, lineHeight: 1.2 }}>{copy.hero_title || web.nombre_negocio}</h1>
            <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 32, lineHeight: 1.6 }}>{copy.hero_subtitle || ''}</p>
            {web.telefono && <a href={`tel:${web.telefono.replace(/\s/g,'')}`} style={{ background: accent, color: '#000', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>{web.telefono}</a>}
          </div>
        </section>
        <section style={{ padding: '64px 24px', background: '#111', borderTop: '1px solid #222' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 40, textAlign: 'center' }}>{web.idioma === 'fr' ? 'Nos services' : 'Nuestros servicios'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {services.map((s: string, i: number) => (
                <div key={i} style={{ padding: 24, borderRadius: 12, background: '#111', border: '1px solid #222', textAlign: 'center', fontWeight: 500 }}>{s}</div>
              ))}
            </div>
          </div>
        </section>
        <section style={{ padding: '64px 24px', textAlign: 'center', maxWidth: 700, margin: '0 auto', lineHeight: 1.8, fontSize: 16, opacity: 0.85 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 24 }}>{web.idioma === 'fr' ? 'À propos' : 'Sobre nosotros'}</h2>
          <p>{copy.about || ''}</p>
        </section>
        <footer style={{ borderTop: '1px solid #222', padding: '32px 24px', textAlign: 'center', fontSize: 13, opacity: 0.5 }}>
          <p>&copy; {new Date().getFullYear()} {web.nombre_negocio} &mdash; {web.idioma === 'fr' ? 'Site créé par NOIRA' : 'Web creada por NOIRA'}</p>
        </footer>
      </body>
    </html>
  )
}
