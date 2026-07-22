import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '')
}
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 })

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session & { subscription: string }
      const webId = session.metadata?.webId
      const subscriptionId = session.subscription
      if (webId && subscriptionId) {
        await supabase.from('webs_generadas').update({
          estado_pago: 'activa',
          stripe_subscription_id: subscriptionId,
        }).eq('id', webId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const { data: web } = await supabase.from('webs_generadas').select('id').eq('stripe_subscription_id', subscription.id).maybeSingle()
      if (web) {
        await supabase.from('webs_generadas').update({ estado_pago: 'cancelada' }).eq('id', web.id)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & { subscription: string }
      const subscriptionId = invoice.subscription
      if (subscriptionId) {
        const { data: web } = await supabase.from('webs_generadas').select('id').eq('stripe_subscription_id', subscriptionId).maybeSingle()
        if (web) {
          await supabase.from('webs_generadas').update({ estado_pago: 'impagada' }).eq('id', web.id)
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
