import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/crypto'
import { generateWebCopy } from '@/lib/groq'

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

const STYLES: Record<string, any> = {
  restaurante: { name: 'fuego', accentColor: '#39ff14', heroGradient: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)' },
  peluqueria: { name: 'rosa', accentColor: '#39ff14', heroGradient: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)' },
  abogado: { name: 'acero', accentColor: '#39ff14', heroGradient: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)' },
  gimnasio: { name: 'verde', accentColor: '#39ff14', heroGradient: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)' },
  taller: { name: 'ambar', accentColor: '#39ff14', heroGradient: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)' },
  clinica: { name: 'cian', accentColor: '#39ff14', heroGradient: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)' },
  tienda: { name: 'violeta', accentColor: '#39ff14', heroGradient: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)' },
  generico: { name: 'noira', accentColor: '#39ff14', heroGradient: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)' },
}

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

function buildHtmlPage(copy: any, nombre: string, telefono: string, categoria: string, style: any, idioma: string): string {
  const services = copy.services || []
  return `<!DOCTYPE html><html lang="${idioma}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${nombre}</title><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#000;color:#e0e0e0;font-family:Inter,sans-serif;min-height:100vh}
    nav{background:#000;border-bottom:1px solid #222;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;max-width:1100;margin:0 auto}
    nav span{font-weight:700;font-size:18;color:${style.accentColor}}
    .hero{padding:80px 24px;text-align:center;background:${style.heroGradient}}
    .hero h1{font-size:42px;font-weight:700;margin-bottom:16px;line-height:1.2}
    .hero p{font-size:18px;opacity:.8;margin-bottom:32px}
    .hero a{display:inline-block;background:${style.accentColor};color:#000;padding:12px 28px;border-radius:8;text-decoration:none;font-weight:600;margin:4px}
    .hero a.outline{border:1px solid #222;color:#e0e0e0;background:transparent}
    .services{padding:64px 24px;background:#111;border-top:1px solid #222}
    .services h2{font-size:28px;font-weight:700;text-align:center;margin-bottom:40px}
    .services .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;max-width:900px;margin:0 auto}
    .services .card{padding:24px;border-radius:12px;background:#111;border:1px solid #222;text-align:center;font-weight:500}
    .about{padding:64px 24px;text-align:center;max-width:700px;margin:0 auto;line-height:1.8;font-size:16px;opacity:.85}
    .about h2{font-size:28px;font-weight:700;margin-bottom:24px}
    footer{border-top:1px solid #222;padding:32px 24px;text-align:center;font-size:13px;opacity:.5}
  </style></head><body>
    <nav><span>${nombre}</span>${telefono ? `<a href="tel:${telefono.replace(/\s/g,'')}" style="background:${style.accentColor};color:#000;padding:8px 20px;border-radius:8;text-decoration:none;font-size:14;font-weight:600">${telefono}</a>` : ''}</nav>
    <section class="hero"><div><h1>${copy.hero_title || nombre}</h1><p>${copy.hero_subtitle || ''}</p>
      ${telefono ? `<a href="tel:${telefono.replace(/\s/g,'')}">${telefono}</a>` : ''}</div></section>
    <section class="services"><h2>${idioma === 'fr' ? 'Nos services' : 'Nuestros servicios'}</h2>
      <div class="grid">${services.map((s: string) => `<div class="card">${s}</div>`).join('')}</div></section>
    <section class="about"><h2>${idioma === 'fr' ? 'À propos' : 'Sobre nosotros'}</h2><p>${copy.about || ''}</p></section>
    <footer><p>&copy; ${new Date().getFullYear()} ${nombre} &mdash; ${idioma === 'fr' ? 'Site créé par NOIRA' : 'Web creada por NOIRA'}</p></footer>
  </body></html>`
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { nombre, categoria, descripcion, telefono, idioma } = await req.json()
  if (!nombre || !categoria) return NextResponse.json({ error: 'Nombre y categoría son obligatorios' }, { status: 400 })

  const supabase = getDb()
  const { data: usuario } = await supabase
    .from('usuarios_selfservice')
    .select('id, groq_key_cifrada')
    .eq('email', session.user.email)
    .maybeSingle()

  if (!usuario?.groq_key_cifrada) return NextResponse.json({ error: 'Conecta tu clave de Groq primero' }, { status: 400 })

  let apiKey: string
  try { apiKey = decrypt(usuario.groq_key_cifrada) } catch {
    return NextResponse.json({ error: 'Error descifrando la clave. Conéctala de nuevo.' }, { status: 500 })
  }

  const { copy, rateLimit, error: genError } = await generateWebCopy(apiKey, nombre, categoria, descripcion || '', idioma || 'es')
  if (genError) return NextResponse.json({ error: genError, rateLimit }, { status: 400 })
  if (!copy) return NextResponse.json({ error: 'Error generando contenido' }, { status: 500 })

  const style = STYLES[categoria] || STYLES.generico

  const pagina_html = buildHtmlPage(copy, nombre, telefono || '', categoria, style, idioma || 'es')
  const estilo_aplicado = JSON.stringify({ style: style.name, accentColor: style.accentColor, heroGradient: style.heroGradient, copy })

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data: web, error: dbError } = await supabase.from('webs_selfservice').insert({
    usuario_id: usuario.id,
    nombre_negocio: nombre,
    categoria,
    descripcion: descripcion || null,
    telefono: telefono || null,
    idioma: idioma || 'es',
    url_demo: '',
    estilo_aplicado,
    pagina_html,
    fecha_caducidad: expiresAt,
    estado_pago: 'demo',
  }).select().single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  const url_demo = `https://noira-demos.vercel.app/demo/${web.id}`

  if (web.url_demo !== url_demo) {
    await supabase.from('webs_selfservice').update({ url_demo }).eq('id', web.id)
  }

  return NextResponse.json({
    ok: true,
    webId: web.id,
    url: url_demo,
    expiraEn: expiresAt,
    rateLimit,
  })
}

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = getDb()
  let { data: usuario } = await supabase
    .from('usuarios_selfservice')
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle()

  if (!usuario) {
    const { data: newUser } = await supabase
      .from('usuarios_selfservice')
      .insert({ google_id: session.user.email, email: session.user.email, nombre: session.user.name || '' })
      .select('id')
      .maybeSingle()
    usuario = newUser
    if (!usuario) return NextResponse.json([])
  }

  const { data: webs } = await supabase
    .from('webs_selfservice')
    .select('*')
    .eq('usuario_id', usuario.id)
    .order('fecha_creacion', { ascending: false })
    .limit(5)

  return NextResponse.json(webs || [])
}
