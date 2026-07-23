import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import nodemailer from 'nodemailer'
import { getSupabaseAdmin } from '@/lib/supabase'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || '')
}

function getTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER || 'noiramaster@gmail.com',
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

async function enviarEmailPausa(destinatario: string, nombreNegocio: string, checkoutUrl: string, idioma: string) {
  const direccion = process.env.DIRECCION_FISICA || 'Ferrol, 15404, España'
  if (idioma === 'fr') {
    const asunto = `Le site de ${nombreNegocio} a été suspendu — réactivez-le`
    const cuerpo = `Bonjour,

Le site web de ${nombreNegocio} a été suspendu car l'abonnement n'est plus actif.

Pour le réactiver, cliquez sur ce lien :
${checkoutUrl}

Une fois le paiement effectué, votre site sera de nouveau en ligne instantanément.

Si vous avez la moindre question, répondez à cet email.

---
Noira Webs — Nous chassons les commerces invisibles
${direccion}
noiramaster@gmail.com

Si vous ne souhaitez plus recevoir d'emails, répondez "BAJA"`
    try {
      await getTransporter().sendMail({
        from: '"Noira Webs" <noiramaster@gmail.com>',
        to: destinatario,
        subject: asunto,
        text: cuerpo,
      })
    } catch (err) {
      console.error('Erreur envoi email suspension:', err)
    }
    return
  }
  const asunto = `Tu web de ${nombreNegocio} está pausada — reactívala`
  const cuerpo = `Hola,

Tu web de ${nombreNegocio} ha sido pausada porque la suscripción no está activa.

Para reactivarla, haz clic en este enlace:
${checkoutUrl}

Una vez realizado el pago, tu web volverá a estar online al instante.

Si tienes cualquier duda, responde a este email.

---
Noira Webs — Cazamos negocios invisibles
${direccion}
noiramaster@gmail.com

Si no quieres recibir más emails, responde "BAJA"`
  try {
    await getTransporter().sendMail({
      from: '"Noira Webs" <noiramaster@gmail.com>',
      to: destinatario,
      subject: asunto,
      text: cuerpo,
    })
  } catch (err) {
    console.error('Error enviando email de pausa:', err)
  }
}

async function eventoYaProcesado(supabase: any, eventId: string): Promise<boolean> {
  const { data } = await supabase.from('webhook_eventos').select('id').eq('id', eventId).maybeSingle()
  return !!data
}

async function marcarEventoProcesado(supabase: any, eventId: string, tipo: string) {
  await supabase.from('webhook_eventos').insert({ id: eventId, tipo }).select().single()
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Falta firma' }, { status: 400 })

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET no configurado')
    return NextResponse.json({ error: 'Error de configuración' }, { status: 500 })
  }

  let body: string
  try {
    body = await req.text()
  } catch {
    return NextResponse.json({ error: 'Error leyendo cuerpo' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error('Firma inválida:', err.message)
    return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Idempotencia: si ya procesamos este evento, lo ignoramos
  const yaProcesado = await eventoYaProcesado(supabase, event.id)
  if (yaProcesado) {
    return NextResponse.json({ received: true, duplicated: true })
  }

  const stripe = getStripe()
  const domain = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://noira-smoky.vercel.app'

  try {
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

      case 'customer.subscription.deleted':
      case 'invoice.payment_failed': {
        let subscriptionId: string
        if (event.type === 'customer.subscription.deleted') {
          const subscription = event.data.object as Stripe.Subscription
          subscriptionId = subscription.id
        } else {
          const invoice = event.data.object as Stripe.Invoice & { subscription: string }
          subscriptionId = invoice.subscription
        }

        if (!subscriptionId) break

        const { data: web } = await supabase.from('webs_generadas').select('*, leads(*)').eq('stripe_subscription_id', subscriptionId).maybeSingle()
        if (!web) break

        const nuevoEstado = event.type === 'customer.subscription.deleted' ? 'cancelada' : 'impagada'
        await supabase.from('webs_generadas').update({ estado_pago: nuevoEstado }).eq('id', web.id)

        // Crear nueva sesión de pago y enviar email al negocio
        const priceId = process.env.STRIPE_PRICE_ID
        if (priceId) {
          try {
            const session = await stripe.checkout.sessions.create({
              mode: 'subscription',
              payment_method_types: ['card'],
              line_items: [{ price: priceId, quantity: 1 }],
              metadata: { webId: web.id, slug: web.url_demo?.split('/').pop() || '', negocio: web.leads?.nombre_negocio || '' },
              success_url: `${domain}/cliente/${web.url_demo?.split('/').pop() || ''}?payment=success`,
              cancel_url: `${domain}/cliente/${web.url_demo?.split('/').pop() || ''}?payment=cancelled`,
            })
            const destinatario = process.env.GMAIL_USER || 'noiramaster@gmail.com'
            const idiomaLead = web.leads?.idioma || 'es'
            await enviarEmailPausa(destinatario, web.leads?.nombre_negocio || 'tu negocio', session.url || '', idiomaLead)
          } catch (err) {
            console.error('Error creando sesión de reactivación:', err)
          }
        }
        break
      }
    }

    await marcarEventoProcesado(supabase, event.id, event.type)
  } catch (err: any) {
    console.error('Error procesando webhook:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
