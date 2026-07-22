import { getSupabaseAdmin } from './supabase'

const RAMP_LIMITS = [0, 15, 30, 50, 80]

export function getLimitForWeek(semana: number): number {
  if (semana < 1) return RAMP_LIMITS[1]
  if (semana >= RAMP_LIMITS.length) return RAMP_LIMITS[RAMP_LIMITS.length - 1]
  return RAMP_LIMITS[semana]
}

export async function actualizarRampa(): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { data: config } = await supabase
    .from('config_envio')
    .select('*')
    .eq('id', 1)
    .single()

  if (!config) return

  const { data: firstEmail } = await supabase
    .from('emails')
    .select('fecha_enviado')
    .eq('estado', 'enviado')
    .order('fecha_enviado', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!firstEmail?.fecha_enviado) {
    // No emails sent yet — keep week 1
    const limit = getLimitForWeek(1)
    if (config.limite_diario_actual !== limit) {
      await supabase.from('config_envio').update({ limite_diario_actual: limit }).eq('id', 1)
    }
    return
  }

  const start = new Date(firstEmail.fecha_enviado)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const semana = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1
  const newLimit = getLimitForWeek(semana)

  if (config.semana_actual !== semana || config.limite_diario_actual !== newLimit) {
    await supabase
      .from('config_envio')
      .update({ semana_actual: semana, limite_diario_actual: newLimit })
      .eq('id', 1)
  }
}

export async function verificarLimiteDiario(): Promise<boolean> {
  const supabase = getSupabaseAdmin()

  const { data: config } = await supabase
    .from('config_envio')
    .select('*')
    .eq('id', 1)
    .single()

  if (!config) return false

  const today = new Date().toISOString().split('T')[0]
  if (config.fecha_ultimo_reset !== today) {
    await supabase
      .from('config_envio')
      .update({
        emails_enviados_hoy: 0,
        fecha_ultimo_reset: today,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1)
    return true
  }

  return config.emails_enviados_hoy < config.limite_diario_actual
}
