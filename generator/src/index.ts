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

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('estado', 'nuevo')
    .limit(5)

  if (!leads || leads.length === 0) {
    console.log('No leads in "nuevo" state.')
    return
  }

  console.log(`Found ${leads.length} leads to process\n`)

  for (const lead of leads) {
    if (mode === 'all' || mode === 'web') {
      const web = await generateWebForLead(lead)
      if (web) {
        await supabase
          .from('leads')
          .update({ estado: 'web_generada' })
          .eq('id', lead.id)
      }
    }

    if (mode === 'all' || mode === 'email') {
      await generateEmailForLead(lead)
      await supabase
        .from('leads')
        .update({ estado: 'email_listo' })
        .eq('id', lead.id)
    }
  }

  console.log('\n✅ Generator finished.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
