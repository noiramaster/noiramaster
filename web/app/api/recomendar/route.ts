import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { nombre, email, negocio, mensaje } = await req.json()

    if (!nombre || !email || !negocio) {
      return NextResponse.json({ error: 'nombre, email y negocio son obligatorios' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { error } = await supabase.from('recomendaciones').insert({
      nombre_recomendante: nombre,
      email_recomendante: email,
      negocio_recomendado: negocio,
      ubicacion_o_info: mensaje || null,
    })

    if (error) {
      console.error('Error guardando recomendación:', error)
      return NextResponse.json({ error: 'Error al guardar la recomendación' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
