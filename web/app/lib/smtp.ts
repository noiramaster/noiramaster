import nodemailer from 'nodemailer'
import { getSupabaseAdmin } from './supabase'

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

function buildRgpdBody(cuerpoOriginal: string): string {
  const footer = `
---
Noira Webs — Cazamos negocios invisibles
[DIRECCIÓN FÍSICA DE NOIRA]
noiramaster@gmail.com

Si no quieres recibir más emails, responde a este correo con "BAJA" en el asunto.
`
  return cuerpoOriginal + footer
}

export async function sendEmail(leadId: string, emailId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin()

  const { data: email } = await supabase
    .from('emails')
    .select('*, leads(*)')
    .eq('id', emailId)
    .single()

  if (!email) return { ok: false, error: 'Email not found' }

  const lead = email.leads as any
  const destinatario = process.env.GMAIL_USER || 'noiramaster@gmail.com'

  const transporter = getTransporter()

  try {
    await transporter.sendMail({
      from: '"Noira Webs" <noiramaster@gmail.com>',
      to: destinatario,
      subject: email.asunto,
      text: buildRgpdBody(email.cuerpo),
    })

    const now = new Date().toISOString()

    await supabase
      .from('emails')
      .update({ estado: 'enviado', fecha_enviado: now })
      .eq('id', emailId)

    await supabase
      .from('leads')
      .update({ estado: 'contactado' })
      .eq('id', leadId)

    await supabase.rpc('incrementar_contador_envio')

    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err.message }
  }
}
