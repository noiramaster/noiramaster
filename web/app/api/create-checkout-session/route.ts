import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '')
}
const PRICE_ID = process.env.STRIPE_PRICE_ID || ''
const DOMAIN = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://noira-smoky.vercel.app'

export async function POST(req: Request) {
  try {
    const { webId } = await req.json()
    if (!webId) return NextResponse.json({ error: 'webId required' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const { data: web } = await supabase.from('webs_generadas').select('*, leads(*)').eq('id', webId).single()
    if (!web) return NextResponse.json({ error: 'Web not found' }, { status: 404 })

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      metadata: { webId },
      success_url: `${DOMAIN}/cliente/${web.leads?.nombre_negocio ? web.url_demo.split('/').pop() : ''}?payment=success`,
      cancel_url: `${DOMAIN}/cliente/${web.url_demo.split('/').pop() || ''}?payment=cancelled`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
