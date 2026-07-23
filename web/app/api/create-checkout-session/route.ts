import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '')
}

function getSlug(web: any): string {
  try {
    const parts = (web.url_demo || '').split('/')
    return parts[parts.length - 1] || ''
  } catch {
    return ''
  }
}

export async function POST(req: Request) {
  try {
    const { webId } = await req.json()
    if (!webId) return NextResponse.json({ error: 'Falta el identificador de la web' }, { status: 400 })

    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      console.error('STRIPE_PRICE_ID no configurado')
      return NextResponse.json({ error: 'Error de configuración del sistema' }, { status: 500 })
    }

    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      console.error('STRIPE_SECRET_KEY no configurado')
      return NextResponse.json({ error: 'Error de configuración del sistema' }, { status: 500 })
    }

    const supabase = getSupabaseAdmin()
    const { data: web, error: webError } = await supabase.from('webs_generadas').select('*, leads(*)').eq('id', webId).single()
    if (webError || !web) return NextResponse.json({ error: 'Web no encontrada' }, { status: 404 })

    const slug = getSlug(web)
    const domain = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://noira-smoky.vercel.app'

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { webId, slug, negocio: web.leads?.nombre_negocio || '' },
      success_url: slug ? `${domain}/cliente/${slug}?payment=success` : `${domain}?payment=success`,
      cancel_url: `${domain}${slug ? `/cliente/${slug}` : ''}?payment=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Error creando sesión de pago:', err)
    return NextResponse.json({ error: 'Error al preparar el pago. Inténtalo de nuevo.' }, { status: 500 })
  }
}
