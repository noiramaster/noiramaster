import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { generateWebForLead } from './generate'
import { generateEmailForLead } from './email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function main() {
  const mode = process.argv[2] || 'all'

  let leads: any[] | null
  try {
    const result = await supabase
      .from('leads')
      .select('*')
      .eq('estado', 'nuevo')
      .limit(5)
    leads = result.data
    if (result.error) {
      console.error(`✗ Supabase query error: ${result.error.message}`)
      return
    }
  } catch (err: any) {
    console.error(`✗ Supabase connection error: ${err.message || err}`)
    return
  }

  if (!leads || leads.length === 0) {
    console.log('⚠ No leads in "nuevo" state. Nothing to process.')
    return
  }

  console.log(`Found ${leads.length} leads to process\n`)

  for (const lead of leads) {
    try {
      if (mode === 'all' || mode === 'web') {
        const web = await generateWebForLead(lead)
        if (web) {
          const { error: updErr } = await supabase
            .from('leads')
            .update({ estado: 'web_generada' })
            .eq('id', lead.id)
          if (updErr) console.error(`  ✗ Failed to update lead ${lead.id} to web_generada: ${updErr.message}`)
        }
      }

      if (mode === 'all' || mode === 'email') {
        await generateEmailForLead(lead)
        const { error: updErr } = await supabase
          .from('leads')
          .update({ estado: 'email_listo' })
          .eq('id', lead.id)
        if (updErr) console.error(`  ✗ Failed to update lead ${lead.id} to email_listo: ${updErr.message}`)
      }
    } catch (err) {
      console.error(`✗ Lead ${lead.id} (${lead.nombre_negocio}) failed: ${err}`)
    }
  }

  console.log('\n✅ Generator finished.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
