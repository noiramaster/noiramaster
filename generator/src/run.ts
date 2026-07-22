import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { generateWebForLead } from './generate'
import { generateEmailForLead } from './email'
import { LeadData } from './types'

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )

  const mode = process.argv[2] || 'all'

  if (mode === 'test') {
    const testLead: LeadData = {
      id: '',
      nombre_negocio: 'Carnicería El Toro',
      categoria: 'restaurante',
      telefono: '+34 952 123 456',
      ubicacion: 'Calle Mayor 15, Málaga, España',
      pais: 'ES',
      idioma: 'es',
      num_resenas: 45,
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        nombre_negocio: testLead.nombre_negocio,
        categoria: testLead.categoria,
        telefono: testLead.telefono,
        ubicacion: testLead.ubicacion,
        pais: testLead.pais,
        idioma: testLead.idioma,
        num_resenas: 45,
        tiene_web: false,
        estado: 'nuevo',
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error.message)
      return
    }
    console.log('✓ Lead inserted:', data.id)
    testLead.id = data.id

    const web = await generateWebForLead(testLead)
    if (web) {
      await supabase.from('leads').update({ estado: 'web_generada' }).eq('id', testLead.id)
    }

    await generateEmailForLead(testLead)
    await supabase.from('leads').update({ estado: 'email_listo' }).eq('id', testLead.id)

    console.log('\n✅ Test complete.')
    return
  }

  // Normal mode: process leads with estado = 'nuevo'
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
        await supabase.from('leads').update({ estado: 'web_generada' }).eq('id', lead.id)
      }
    }

    if (mode === 'all' || mode === 'email') {
      await generateEmailForLead(lead)
      await supabase.from('leads').update({ estado: 'email_listo' }).eq('id', lead.id)
    }
  }

  console.log('\n✅ Generator finished.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
