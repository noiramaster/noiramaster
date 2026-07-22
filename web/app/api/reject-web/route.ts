import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { webId } = await req.json()
    if (!webId) return NextResponse.json({ error: 'webId required' }, { status: 400 })

    const supabase = getSupabaseAdmin()
    await supabase.from('webs_generadas').update({ estado: 'rechazada' }).eq('id', webId)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
