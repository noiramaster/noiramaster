import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { webId } = await req.json()
    if (!webId) return NextResponse.json({ error: 'webId required' }, { status: 400 })

    const supabase = getSupabaseAdmin()

    const { data: web } = await supabase
      .from('webs_generadas')
      .select('*, leads(*)')
      .eq('id', webId)
      .single()

    if (!web) return NextResponse.json({ error: 'Web not found' }, { status: 404 })

    await supabase.from('webs_generadas').update({ estado: 'aprobada' }).eq('id', webId)

    await supabase
      .from('leads')
      .update({ estado: 'email_listo' })
      .eq('id', web.lead_id)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
