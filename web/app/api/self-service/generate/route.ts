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
  restaurante: { name: 'fuego', accentColor: '#ff6b35', heroGradient: 'linear-gradient(135deg, #2b0d04 0%, #6b2410 55%, #3a1205 100%)' },
  peluqueria: { name: 'rosa', accentColor: '#ff4fa3', heroGradient: 'linear-gradient(135deg, #20061a 0%, #4d1236 55%, #2a0a21 100%)' },
  abogado: { name: 'acero', accentColor: '#4f8cff', heroGradient: 'linear-gradient(135deg, #050a1c 0%, #122a5c 55%, #081027 100%)' },
  gimnasio: { name: 'energia', accentColor: '#ffd60a', heroGradient: 'linear-gradient(135deg, #141400 0%, #3d3d00 55%, #1a1a00 100%)' },
  taller: { name: 'ambar', accentColor: '#ffb020', heroGradient: 'linear-gradient(135deg, #1c1105 0%, #4a2c0a 55%, #241505 100%)' },
  clinica: { name: 'cian', accentColor: '#22d3ee', heroGradient: 'linear-gradient(135deg, #02141b 0%, #0a3442 55%, #031923 100%)' },
  tienda: { name: 'violeta', accentColor: '#b45cff', heroGradient: 'linear-gradient(135deg, #130524 0%, #371366 55%, #18092e 100%)' },
  generico: { name: 'noira', accentColor: '#39ff14', heroGradient: 'linear-gradient(135deg, #000000 0%, #0d1a00 55%, #000000 100%)' },
}

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
}

function buildHtmlPage(copies: Record<string, any> | null, nombre: string, telefono: string, categoria: string, style: any, langs: string[], direccion?: string, horario?: string, servicios?: string[], webId?: string): string {
  if (!copies) copies = {}
  const L = (key: string, lang: string) => {
    const c = copies[lang]
    if (key === 'hero_title') return c?.hero_title || nombre
    if (key === 'hero_subtitle') return c?.hero_subtitle || ''
    if (key === 'about') return c?.about || ''
    if (key === 'cta') return c?.cta || 'Contáctanos'
    if (key === 'services') return c?.services || servicios || ['Servicio 1', 'Servicio 2', 'Servicio 3', 'Servicio 4']
    if (key === 'nav_services') return lang === 'fr' ? 'Nos services' : lang === 'pt' ? 'Nossos serviços' : lang === 'de' ? 'Unsere Dienstleistungen' : lang === 'it' ? 'I nostri servizi' : lang === 'ar' ? 'خدماتنا' : lang === 'en' ? 'Our services' : 'Nuestros servicios'
    if (key === 'nav_about') return lang === 'fr' ? 'À propos' : lang === 'pt' ? 'Sobre nós' : lang === 'de' ? 'Über uns' : lang === 'it' ? 'Chi siamo' : lang === 'ar' ? 'معلومات عنا' : lang === 'en' ? 'About us' : 'Sobre nosotros'
    if (key === 'footer') return lang === 'fr' ? 'Site créé par NOIRA' : lang === 'pt' ? 'Site criado por NOIRA' : lang === 'de' ? 'Website erstellt von NOIRA' : lang === 'it' ? 'Sito creato da NOIRA' : lang === 'ar' ? 'تم إنشاء الموقع بواسطة NOIRA' : lang === 'en' ? 'Website created by NOIRA' : 'Web creada por NOIRA'
    if (key === 'book_title') return lang === 'fr' ? 'Demander un rendez-vous' : lang === 'pt' ? 'Solicitar um orçamento' : lang === 'de' ? 'Termin anfragen' : lang === 'it' ? 'Richiedi un appuntamento' : lang === 'ar' ? 'طلب موعد' : lang === 'en' ? 'Request an appointment' : 'Pide tu cita'
    if (key === 'book_name') return lang === 'fr' ? 'Nom' : lang === 'pt' ? 'Nome' : lang === 'de' ? 'Name' : lang === 'it' ? 'Nome' : lang === 'ar' ? 'الاسم' : lang === 'en' ? 'Name' : 'Nombre'
    if (key === 'book_phone') return lang === 'fr' ? 'Téléphone' : lang === 'pt' ? 'Telefone' : lang === 'de' ? 'Telefon' : lang === 'it' ? 'Telefono' : lang === 'ar' ? 'الهاتف' : lang === 'en' ? 'Phone' : 'Teléfono'
    if (key === 'book_msg') return lang === 'fr' ? 'Message' : lang === 'pt' ? 'Mensagem' : lang === 'de' ? 'Nachricht' : lang === 'it' ? 'Messaggio' : lang === 'ar' ? 'رسالة' : lang === 'en' ? 'Message' : 'Mensaje'
    if (key === 'book_send') return lang === 'fr' ? 'Envoyer' : lang === 'pt' ? 'Enviar' : lang === 'de' ? 'Senden' : lang === 'it' ? 'Invia' : lang === 'ar' ? 'إرسال' : lang === 'en' ? 'Send' : 'Enviar'
    if (key === 'open_now') return lang === 'fr' ? 'Ouvert maintenant' : lang === 'pt' ? 'Aberto agora' : lang === 'de' ? 'Jetzt geöffnet' : lang === 'it' ? 'Aperto ora' : lang === 'ar' ? 'مفتوح الآن' : lang === 'en' ? 'Open now' : 'Abierto ahora'
    if (key === 'closed') return lang === 'fr' ? 'Fermé' : lang === 'pt' ? 'Fechado' : lang === 'de' ? 'Geschlossen' : lang === 'it' ? 'Chiuso' : lang === 'ar' ? 'مغلق' : lang === 'en' ? 'Closed' : 'Cerrado'
    return ''
  }
  const primaryLang = langs[0] || 'es'
  const servicesArr = L('services', primaryLang)
  const waLink = telefono ? `https://wa.me/${telefono.replace(/\s/g,'')}` : ''
  const mapsQuery = encodeURIComponent(`${nombre} ${direccion || ''}`)
  const langOptions = langs.map(l => `{"code":"${l}","label":"${l.toUpperCase()}","name":"${l}"}`).join(',')

  return `<!DOCTYPE html><html lang="${primaryLang}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${nombre}</title>
  <script>const LANGS=${JSON.stringify(langs)};const COPIES=${JSON.stringify(copies)};function switchLang(l){document.querySelectorAll('[data-lang]').forEach(el=>{el.style.display=el.dataset.lang===l?'':'none'});localStorage.setItem('noira_demo_lang',l)}const saved=localStorage.getItem('noira_demo_lang');if(saved&&LANGS.includes(saved))switchLang(saved)</script>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#000;color:#e0e0e0;font-family:Inter,sans-serif;min-height:100vh}
    nav{background:#000;border-bottom:1px solid #222;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;max-width:1100;margin:0 auto;flex-wrap:wrap;gap:8px}
    nav .brand{font-weight:700;font-size:18;color:${style.accentColor}}
    .lang-picker{display:flex;gap:4px}
    .lang-picker button{background:none;border:1px solid #333;color:#666;padding:2px 6px;border-radius:4px;cursor:pointer;font-size:11px;font-family:monospace}
    .lang-picker button.active{border-color:${style.accentColor};color:${style.accentColor}}
    .hero{padding:80px 24px;text-align:center;background:${style.heroGradient}}
    .hero h1{font-size:42px;font-weight:700;margin-bottom:16px;line-height:1.2}
    .hero p{font-size:18px;opacity:.8;margin-bottom:32px}
    .hero .btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .btn{display:inline-flex;align-items:center;gap:6px;padding:12px 28px;border-radius:8;text-decoration:none;font-weight:600;border:none;cursor:pointer;font-size:15px}
    .btn-primary{background:${style.accentColor};color:#000}
    .btn-outline{border:1px solid #222;color:#e0e0e0;background:transparent}
    .services{padding:64px 24px;background:#111;border-top:1px solid #222}
    .services h2{font-size:28px;font-weight:700;text-align:center;margin-bottom:40px}
    .services .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;max-width:900px;margin:0 auto}
    .services .card{padding:24px;border-radius:12px;background:#111;border:1px solid #222;text-align:center;font-weight:500}
    .about{padding:64px 24px;text-align:center;max-width:700px;margin:0 auto;line-height:1.8;font-size:16px;opacity:.85}
    .about h2{font-size:28px;font-weight:700;margin-bottom:24px}
    .info-row{display:flex;justify-content:center;gap:24px;flex-wrap:wrap;padding:24px;max-width:700px;margin:0 auto;font-size:14px;color:#999}
    .info-row a{color:${style.accentColor};text-decoration:none}
    .map{padding:32px 24px;text-align:center}
    .map iframe{width:100%;max-width:600px;height:300px;border:1px solid #222;border-radius:12px}
    .booking{padding:64px 24px;background:#111;border-top:1px solid #222;max-width:500px;margin:0 auto}
    .booking h2{font-size:22px;font-weight:700;text-align:center;margin-bottom:24px}
    .booking input,.booking textarea{width:100%;padding:12px;margin-bottom:12px;background:#000;border:1px solid #222;border-radius:8;color:#e0e0e0;font-size:14px}
    .booking button{width:100%;padding:12px;background:${style.accentColor};color:#000;border:none;border-radius:8;font-weight:600;cursor:pointer;font-size:15px}
    footer{border-top:1px solid #222;padding:32px 24px;text-align:center;font-size:13px;opacity:.5}
    .open-badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}
    .open-badge.open{background:#00aa4a20;color:#00aa4a;border:1px solid #00aa4a}
    .open-badge.closed{background:#aa000020;color:#ff4444;border:1px solid #ff4444}
    [data-lang]{display:none}
    [data-lang="${primaryLang}"]{display:block}
  </style></head><body>
    <nav><span class="brand">${nombre}</span>
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        ${langs.length > 1 ? `<div class="lang-picker">${langs.map(l => `<button class="${l === primaryLang ? 'active' : ''}" onclick="switchLang('${l}')">${l.toUpperCase()}</button>`).join('')}</div>` : ''}
        ${telefono ? `<a href="${waLink}" target="_blank" class="btn btn-primary" style="padding:6px 14px;font-size:13px">WhatsApp</a>` : ''}
      </div>
    </nav>
    ${langs.map(l => `
    <div data-lang="${l}">
      <section class="hero">
        <div><h1>${L('hero_title', l)}</h1><p>${L('hero_subtitle', l)}</p>
          <div class="btns">
            ${telefono ? `<a href="tel:${telefono.replace(/\s/g,'')}" class="btn btn-primary">${telefono}</a>` : ''}
            ${direccion ? `<a href="https://maps.google.com/?q=${mapsQuery}" target="_blank" class="btn btn-outline">📍 ${l === 'fr' ? 'Itinéraire' : l === 'en' ? 'Directions' : 'Cómo llegar'}</a>` : ''}
          </div>
        </div>
      </section>
      <section class="services"><h2>${L('nav_services', l)}</h2>
        <div class="grid">${(Array.isArray(servicesArr) ? servicesArr : []).map((s: string) => `<div class="card">${s}</div>`).join('')}</div>
      </section>
      <section class="about"><h2>${L('nav_about', l)}</h2><p>${L('about', l)}</p></section>
      ${direccion ? `<section class="map"><iframe loading="lazy" src="https://maps.google.com/maps?q=${mapsQuery}&output=embed"></iframe></section>` : ''}
      <section class="booking">
        <h2>${L('book_title', l)}</h2>
        <form onsubmit="event.preventDefault();const f=this;fetch('/api/self-service/booking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({webId:'${webId || ''}',nombre:f.name.value,telefono:f.phone.value,mensaje:f.msg.value})}).then(r=>r.json()).then(d=>{if(d.ok){f.innerHTML='<p style=\"color:${style.accentColor};text-align:center\">✓ ${l === 'fr' ? 'Envoyé' : l === 'en' ? 'Sent' : 'Enviado'}</p>'}})">
          <input name="name" placeholder="${L('book_name', l)}" required>
          <input name="phone" placeholder="${L('book_phone', l)}" required>
          <textarea name="msg" rows="3" placeholder="${L('book_msg', l)}"></textarea>
          <button type="submit">${L('book_send', l)}</button>
        </form>
      </section>
    </div>`).join('')}
    <footer><p>&copy; ${new Date().getFullYear()} ${nombre} &mdash; ${L('footer', primaryLang)}</p></footer>
  </body></html>`
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { nombre, categoria, descripcion, telefono, direccion, horario, servicios, idiomas } = await req.json()
  const langs = idiomas?.length ? idiomas : ['es']
  if (!nombre || !categoria) return NextResponse.json({ error: 'Nombre y categoría son obligatorios' }, { status: 400 })

  const supabase = getDb()
  const { data: usuario } = await supabase
    .from('usuarios_selfservice')
    .select('id, groq_key_cifrada')
    .eq('email', session.user.email)
    .maybeSingle()

  let apiKey = process.env.GROQ_DEFAULT_API_KEY || ''
  if (usuario?.groq_key_cifrada) {
    try { apiKey = decrypt(usuario.groq_key_cifrada) } catch {}
  }
  if (!apiKey) {
    if (usuario?.groq_key_cifrada) return NextResponse.json({ error: 'Error descifrando la clave. Conéctala de nuevo.' }, { status: 500 })
    return NextResponse.json({ error: 'Conecta tu clave de Groq primero o espera a que el administrador configure una clave por defecto.' }, { status: 400 })
  }

  let copies: Record<string, any> | null
  let rateLimit: any
  let genError: string | undefined
  ;({ copy: copies, rateLimit, error: genError } = await generateWebCopy(apiKey, { nombre, categoria, descripcion, telefono, direccion, horario, servicios, idiomas: langs }))
  if (genError) return NextResponse.json({ error: genError, rateLimit }, { status: 400 })
  if (!copies) return NextResponse.json({ error: 'Error generando contenido' }, { status: 500 })

  const style = STYLES[categoria] || STYLES.generico

  const pagina_html = buildHtmlPage(copies, nombre, telefono || '', categoria, style, langs, direccion, horario, servicios, '')
  const estilo_aplicado = JSON.stringify({ style: style.name, accentColor: style.accentColor, heroGradient: style.heroGradient, copy: copies, direccion, horario, servicios, idiomas: langs })

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  const { data: web, error: dbError } = await supabase.from('webs_selfservice').insert({
    usuario_id: usuario!.id,
    nombre_negocio: nombre,
    categoria,
    descripcion: descripcion || null,
    telefono: telefono || null,
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
