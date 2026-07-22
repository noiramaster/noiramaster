import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { actualizarRampa, verificarLimiteDiario } from '@/lib/ramp'
import { sendEmail } from '@/lib/smtp'

export async function POST(req: Request) {
  try {
    const { emailId } = await req.json()
    if (!emailId) return NextResponse.json({ error: 'emailId required' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    await actualizarRampa()

    const puedeEnviar = await verificarLimiteDiario()
    if (!puedeEnviar) {
      return NextResponse.json({
        ok: false,
        cola: true,
        error: 'Límite diario alcanzado. El email queda en cola para mañana.',
      })
    }

    const { data: email } = await supabase
      .from('emails')
      .select('*, leads(*)')
      .eq('id', emailId)
      .single()

    if (!email) return NextResponse.json({ error: 'Email not found' }, { status: 404 })

    const result = await sendEmail(email.lead_id, emailId)

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
