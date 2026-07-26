// NOIRA — Cleanup de webs self-service expiradas (24h)
// Ejecutar como cron/GitHub Action: borra webs cuyo estado_pago='demo' y fecha_caducidad < NOW()

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function main() {
  console.log(`[${new Date().toISOString()}] 🔍 Checking expired self-service webs...`)

  const { data: expired, error } = await supabase
    .from('webs_selfservice')
    .select('id, nombre_negocio, usuario_id')
    .eq('estado_pago', 'demo')
    .lt('fecha_caducidad', new Date().toISOString())

  if (error) {
    console.error('✗ Query error:', error.message)
    process.exit(1)
  }

  if (!expired || expired.length === 0) {
    console.log('✅ No expired webs found.')
    return
  }

  console.log(`Found ${expired.length} expired webs, deleting...`)

  for (const web of expired) {
    const { error: delErr } = await supabase
      .from('webs_selfservice')
      .delete()
      .eq('id', web.id)

    if (delErr) {
      console.error(`✗ Failed to delete ${web.id} (${web.nombre_negocio}): ${delErr.message}`)
    } else {
      console.log(`✓ Deleted expired web: ${web.nombre_negocio}`)
    }
  }

  console.log('✅ Cleanup done.')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
