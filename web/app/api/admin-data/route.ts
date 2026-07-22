import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { actualizarRampa } from '@/lib/ramp'

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type')
  if (!type) return NextResponse.json({ error: 'type param required' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  try {
    switch (type) {
      case 'webs': {
        const { data } = await supabase
          .from('webs_generadas')
          .select('*, leads!inner(*)')
          .eq('estado', 'aprobada')
          .order('created_at', { ascending: false })
          .limit(50)
        return NextResponse.json(data || [])
      }

      case 'emails': {
        const { data } = await supabase
          .from('emails')
          .select('*, leads!inner(*)')
          .eq('estado', 'enviado')
          .order('fecha_enviado', { ascending: false })
          .limit(50)
        return NextResponse.json(data || [])
      }

      case 'stats': {
        const [leads, webs, enviados, respondidos] = await Promise.all([
          supabase.from('leads').select('*', { count: 'exact', head: true }),
          supabase.from('webs_generadas').select('*', { count: 'exact', head: true }),
          supabase.from('emails').select('*', { count: 'exact', head: true }).eq('estado', 'enviado'),
          supabase.from('emails').select('*', { count: 'exact', head: true }).eq('estado', 'respondido'),
        ])
        return NextResponse.json({
          total_leads: leads.count || 0,
          webs_generadas: webs.count || 0,
          emails_enviados: enviados.count || 0,
          respuestas: respondidos.count || 0,
        })
      }

      case 'config': {
        await actualizarRampa()
        const { data } = await supabase.from('config_envio').select('*').eq('id', 1).single()
        return NextResponse.json(data)
      }

      default:
        return NextResponse.json({ error: 'unknown type' }, { status: 400 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
