import { createClient } from '@supabase/supabase-js'
import { generateWebForLead } from './generate'
import { generateEmailForLead } from './email'
import { LeadData } from './types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function main() {
  const testLead: LeadData = {
    id: '',
    nombre_negocio: 'Carnicería El Toro',
    categoria: 'restaurante',
    telefono: '+34 952 123 456',
    ubicacion: 'Calle Mayor 15, Málaga, España',
    pais: 'ES',
    idioma: 'es',
    num_resenas: 0,
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
    console.error('Error inserting test lead:', error.message)
    return
  }

  console.log('✓ Test lead inserted:', data.id)
  testLead.id = data.id

  const web = await generateWebForLead(testLead)
  if (web) {
    console.log('\n✓ Web generated:', web.url_demo)
    await supabase.from('leads').update({ estado: 'web_generada' }).eq('id', testLead.id)
  }

  await generateEmailForLead(testLead)
  await supabase.from('leads').update({ estado: 'email_listo' }).eq('id', testLead.id)

  console.log('\n✅ Test complete. Check Supabase for results.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
