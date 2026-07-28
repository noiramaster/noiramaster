import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )

  try {
    const { webId, nombre, telefono, mensaje } = await req.json()
    if (!nombre || !telefono) return NextResponse.json({ error: 'Nombre y teléfono son obligatorios' }, { status: 400 })

    const { error } = await supabase.from('solicitudes_cliente').insert({
      web_id: webId || null,
      nombre_cliente: nombre,
      telefono,
      mensaje: mensaje || null,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
