import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { emailId } = await req.json()
    if (!emailId) return NextResponse.json({ error: 'emailId required' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    await supabase.from('emails').update({ estado: 'rechazado' }).eq('id', emailId)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
