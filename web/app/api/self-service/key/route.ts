import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createClient } from '@supabase/supabase-js'
import { encrypt } from '@/lib/crypto'
import { validateGroqKey } from '@/lib/groq'

async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { apiKey } = await req.json()
  if (!apiKey || !apiKey.startsWith('gsk_')) {
    return NextResponse.json({ error: 'La clave debe empezar por gsk_' }, { status: 400 })
  }

  const validation = await validateGroqKey(apiKey)
  if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 })

  let encrypted: string
  try {
    encrypted = encrypt(apiKey)
  } catch (cipherErr: any) {
    console.error('[key/route] encrypt failed:', cipherErr?.stack || cipherErr?.message || cipherErr)
    return NextResponse.json({ error: 'Error interno de cifrado. Contacta al administrador.' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
  const { data: existing } = await supabase
    .from('usuarios_selfservice')
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle()

  let dbError: any
  if (existing) {
    const { error } = await supabase
      .from('usuarios_selfservice')
      .update({ groq_key_cifrada: encrypted, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    dbError = error
  } else {
    const { error } = await supabase
      .from('usuarios_selfservice')
      .insert({
        google_id: session.user.email,
        email: session.user.email,
        nombre: session.user.name || '',
        groq_key_cifrada: encrypted,
      })
    dbError = error
  }

  if (dbError) {
    console.error('[key/route] db error:', dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
  const { data } = await supabase
    .from('usuarios_selfservice')
    .select('groq_key_cifrada, email, nombre')
    .eq('email', session.user.email)
    .maybeSingle()

  return NextResponse.json({ hasKey: !!data?.groq_key_cifrada, email: data?.email, nombre: data?.nombre })
}

export { POST, GET }
