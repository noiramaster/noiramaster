import { createClient } from '@supabase/supabase-js'
import { DiscoveredBusiness } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, serviceRoleKey)

export async function existsByPhone(telefono?: string): Promise<boolean> {
  if (!telefono) return false
  const { data } = await supabase
    .from('leads')
    .select('id')
    .eq('telefono', telefono)
    .limit(1)
  return (data?.length ?? 0) > 0
}

export async function saveLead(lead: DiscoveredBusiness): Promise<boolean> {
  if (lead.telefono) {
    const exists = await existsByPhone(lead.telefono)
    if (exists) return false
  }

  const { error } = await supabase.from('leads').insert({
    nombre_negocio: lead.nombre_negocio,
    categoria: lead.categoria,
    telefono: lead.telefono || null,
    ubicacion: lead.ubicacion,
    pais: lead.pais,
    idioma: lead.idioma,
    num_resenas: lead.num_resenas,
    tiene_web: lead.tiene_web,
    estado: 'nuevo',
  })

  if (error) {
    console.error('Error saving lead:', error.message)
    return false
  }

  console.log(`✓ Saved lead: ${lead.nombre_negocio} (${lead.pais})`)
  return true
}

export async function saveLeads(leads: DiscoveredBusiness[]): Promise<number> {
  let saved = 0
  for (const lead of leads) {
    const ok = await saveLead(lead)
    if (ok) saved++
  }
  console.log(`\nSaved ${saved}/${leads.length} leads`)
  return saved
}
