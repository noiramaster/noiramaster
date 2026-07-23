import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

interface PageProps { params: { slug: string } }

const LANG: Record<string, Record<string, string>> = {
  es: {
    expired_title: 'Demo caducada',
    expired_desc: 'Esta web de demostración ya no está disponible. Si quieres seguir publicando tu web, puedes contratarla ahora.',
    expired_cta: 'Contratar web — 19€/mes',
    expired_note: 'Pago único mensual, cancelable cuando quieras.',
    pay_btn: 'Pagar con tarjeta',
    nav_whatsapp: 'WhatsApp',
    nav_directions: 'Cómo llegar',
    services_title: 'Nuestros servicios',
    about_title: 'Sobre nosotros',
    footer: 'Web creada por NOIRA',
    demo_label: 'Demo — caduca el',
    demo_no_date: '7 días de prueba',
  },
  fr: {
    expired_title: 'Démo expirée',
    expired_desc: 'Cette démonstration de site web n\'est plus disponible. Si vous souhaitez continuer à publier votre site, vous pouvez le souscrire maintenant.',
    expired_cta: 'Souscrire — 19€/mois',
    expired_note: 'Paiement mensuel unique, annulable à tout moment.',
    pay_btn: 'Payer par carte',
    nav_whatsapp: 'WhatsApp',
    nav_directions: 'Itinéraire',
    services_title: 'Nos services',
    about_title: 'À propos de nous',
    footer: 'Site web créé par NOIRA',
    demo_label: 'Démo — expire le',
    demo_no_date: '7 jours d\'essai',
  },
}

async function getLeadData(slug: string) {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data: webs } = await supabase
    .from('webs_generadas')
    .select('*, leads(*)')
    .ilike('url_demo', `%/cliente/${slug}`)
    .limit(1)
  if (!webs || webs.length === 0) return null
  const web = webs[0]
  const lead = web.leads as any
  let copy: any = {}
  try {
    const { data: raw } = await supabase
      .from('webs_generadas')
      .select('estilo_aplicado')
      .ilike('url_demo', `%/cliente/${slug}`)
      .limit(1)
    if (raw && raw[0]?.estilo_aplicado) {
      copy = JSON.parse(raw[0].estilo_aplicado).copy || {}
    }
  } catch {}
  return { lead, web, copy }
}

function getStyleForCategory(category: string) {
  const styles: Record<string, any> = {
    restaurante: { bg: '#0A0A0F', text: '#F5F3FF', accent: '#E85D3A', border: '#2A2640', navBg: '#0A0A0F', heroBg: 'linear-gradient(135deg, #0A0A0F 0%, #1A0F0D 100%)', sectionBg: '#15131F', cardBg: '#1A181F' },
    peluqueria: { bg: '#0A0A0F', text: '#F5F3FF', accent: '#D946EF', border: '#2A2640', navBg: '#0A0A0F', heroBg: 'linear-gradient(135deg, #0A0A0F 0%, #1A0D1A 100%)', sectionBg: '#15131F', cardBg: '#1A181F' },
    generico: { bg: '#0A0A0F', text: '#F5F3FF', accent: '#6C4CE0', border: '#2A2640', navBg: '#0A0A0F', heroBg: 'linear-gradient(135deg, #0A0A0F 0%, #13101A 100%)', sectionBg: '#15131F', cardBg: '#1A181F' },
  }
  return styles[category?.toLowerCase()] || styles.generico
}

export default async function ClientPage({ params }: PageProps) {
  const data = await getLeadData(params.slug)
  if (!data) notFound()

  const { lead, web, copy } = data
  const isExpired = web.fecha_caducidad && new Date(web.fecha_caducidad) < new Date() && web.estado_pago !== 'activa'
  const isPaid = web.estado_pago === 'activa'
  const lang = lead.idioma === 'fr' ? 'fr' : 'es'
  const t = LANG[lang]
  const styles = getStyleForCategory(lead.categoria)
  const name = lead.nombre_negocio
  const tel = lead.telefono
  const location = lead.ubicacion

  if (isExpired || (web.estado_pago === 'cancelada' || web.estado_pago === 'impagada')) {
    return (
      <html lang={lang}>
        <head><meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>NOIRA — {t.expired_title}</title></head>
        <body style={{ margin: 0, background: '#0A0A0F', color: '#F5F3FF', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', maxWidth: 480, padding: 40 }}>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 700, marginBottom: 16 }}>{t.expired_title}</h1>
            <p style={{ color: '#8B85A8', lineHeight: 1.6, marginBottom: 24 }}>{t.expired_desc}</p>
            <p style={{ color: '#6C4CE0', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{t.expired_cta}</p>
            <p style={{ color: '#8B85A8', fontSize: 13, marginBottom: 24 }}>{t.expired_note}</p>
            <form action="/api/create-checkout-session" method="POST" style={{ display: 'inline-block' }}>
              <input type="hidden" name="webId" value={web.id} />
              <button type="submit" style={{ background: '#6C4CE0', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>{t.pay_btn}</button>
            </form>
          </div>
        </body>
      </html>
    )
  }

  const heroTitle = copy.hero_title || name
  const heroSub = copy.hero_subtitle || `Tu ${lead.categoria} de confianza en ${location}`
  const services = copy.services || ['Atención personalizada', 'Calidad garantizada', 'Precios justos', 'Horario flexible']
  const about = copy.about || `En ${name} llevamos años ofreciendo el mejor servicio a nuestros clientes en ${location}.`
  const cta = copy.cta || 'Contáctanos hoy'

  if (isPaid) {
    return (
      <div style={{ background: styles.bg, color: styles.text, fontFamily: 'Inter, sans-serif' }}>
        <nav style={{ background: styles.navBg, borderBottom: `1px solid ${styles.border}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: styles.accent }}>{name}</span>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {tel && <a href={`https://wa.me/${tel.replace(/\s/g, '')}`} style={{ background: styles.accent, color: '#fff', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>{t.nav_whatsapp}</a>}
            </div>
          </div>
        </nav>

        <section style={{ padding: '80px 24px', textAlign: 'center', background: styles.heroBg }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <h1 style={{ fontSize: 42, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 16, lineHeight: 1.2 }}>{heroTitle}</h1>
            <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 32, lineHeight: 1.6 }}>{heroSub}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`tel:${tel?.replace(/\s/g, '')}`} style={{ background: styles.accent, color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>{tel || cta}</a>
              <a href={`https://maps.google.com/?q=${encodeURIComponent(name + ' ' + location)}`} style={{ border: `1px solid ${styles.border}`, color: styles.text, padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>{t.nav_directions}</a>
            </div>
          </div>
        </section>

        <section style={{ padding: '64px 24px', background: styles.sectionBg, borderTop: `1px solid ${styles.border}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 40, textAlign: 'center' }}>{t.services_title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {services.map((s: string, i: number) => (
                <div key={i} style={{ padding: 24, borderRadius: 12, background: styles.cardBg, border: `1px solid ${styles.border}`, textAlign: 'center', fontWeight: 500 }}>{s}</div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '64px 24px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', lineHeight: 1.8, fontSize: 16, opacity: 0.85 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 24 }}>{t.about_title}</h2>
            <p>{about}</p>
          </div>
        </section>

        <footer style={{ borderTop: `1px solid ${styles.border}`, padding: '32px 24px', textAlign: 'center', fontSize: 13, opacity: 0.5 }}>
          <p>&copy; {new Date().getFullYear()} {name} &mdash; {t.footer}</p>
        </footer>
      </div>
    )
  }

  // Demo mode (state = 'demo' and not expired yet)
  return (
    <div style={{ background: styles.bg, color: styles.text, fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ background: styles.navBg, borderBottom: `1px solid ${styles.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: styles.accent }}>{name}</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {tel && <a href={`https://wa.me/${tel.replace(/\s/g, '')}`} style={{ background: styles.accent, color: '#fff', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>{t.nav_whatsapp}</a>}
          </div>
        </div>
      </nav>

      <div style={{ background: '#1A1A2E', borderBottom: '1px solid #6C4CE0', padding: '8px 24px', textAlign: 'center', fontSize: 12, color: '#9B84F0' }}>
        {t.demo_label} {web.fecha_caducidad ? new Date(web.fecha_caducidad).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'es-ES') : t.demo_no_date}
      </div>

      <section style={{ padding: '80px 24px', textAlign: 'center', background: styles.heroBg }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 16, lineHeight: 1.2 }}>{heroTitle}</h1>
          <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 32, lineHeight: 1.6 }}>{heroSub}</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`tel:${tel?.replace(/\s/g, '')}`} style={{ background: styles.accent, color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>{tel || cta}</a>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(name + ' ' + location)}`} style={{ border: `1px solid ${styles.border}`, color: styles.text, padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>{t.nav_directions}</a>
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 24px', background: styles.sectionBg, borderTop: `1px solid ${styles.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 40, textAlign: 'center' }}>{t.services_title}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {services.map((s: string, i: number) => (
              <div key={i} style={{ padding: 24, borderRadius: 12, background: styles.cardBg, border: `1px solid ${styles.border}`, textAlign: 'center', fontWeight: 500 }}>{s}</div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '64px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', lineHeight: 1.8, fontSize: 16, opacity: 0.85 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif', marginBottom: 24 }}>{t.about_title}</h2>
          <p>{about}</p>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${styles.border}`, padding: '32px 24px', textAlign: 'center', fontSize: 13, opacity: 0.5 }}>
        <p>&copy; {new Date().getFullYear()} {name} &mdash; {t.footer}</p>
      </footer>
    </div>
  )
}
