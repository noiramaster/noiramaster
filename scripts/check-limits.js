// NOIRA Free Tier Limits Monitor
// Runs at start of each workflow. Exits with code 0 (ok), 1 (warning), or 2 (critical/pause).
// PAUSED workflows should still run but skip their main logic.

const https = require('https')

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const GITHUB_REPO = process.env.GITHUB_REPOSITORY || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const LIMITS = {
  GITHUB_ACTIONS_MINUTES_MONTH: 2000,
  GITHUB_ACTIONS_WARN_AT: 0.8, // 80%
  GITHUB_ACTIONS_CRITICAL_AT: 0.95, // 95%
  SUPABASE_ROWS_WARN: 50000,
  SUPABASE_ROWS_CRITICAL: 95000,
  SUPABASE_STORAGE_MB_WARN: 200,
  SUPABASE_STORAGE_MB_CRITICAL: 450,
  GMAIL_DAILY_LIMIT: 500,
  GMAIL_WARN_AT: 0.7,
}

async function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: options.headers || {}, ...options }, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { resolve(data) }
      })
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

async function checkGitHubActions() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) return { ok: true, msg: 'GITHUB_TOKEN not set, skipping' }
  const now = new Date()
  const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  let minutesUsed = 0

  // Método 1: endpoint oficial de usage (requiere admin; suele dar 403 con GITHUB_TOKEN)
  try {
    const data = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/usage`, {
      headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'User-Agent': 'noira-limits' }
    })
    minutesUsed = data?.billable?.UBUNTU?.total_ms
      ? Math.round(data.billable.UBUNTU.total_ms / 60000)
      : 0
  } catch (err) {
    console.log(`  (usage endpoint falló: ${err.message}, usando fallback)`)
  }

  // Método 2 (fallback): sumar run_duration_ms de las runs de este mes
  // (requiere solo permisos de lectura de Actions, que GITHUB_TOKEN sí tiene)
  if (!minutesUsed) {
    try {
      let page = 1
      const nowMs = Date.now()
      while (page <= 5) {
        const data = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=100&page=${page}`,
          { headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'User-Agent': 'noira-limits' } }
        )
        const runs = Array.isArray(data?.workflow_runs) ? data.workflow_runs : []
        if (runs.length === 0) break
        for (const run of runs) {
          const created = Date.parse(run.created_at || '')
          if (!created || created < monthStart) { page = 99; break }
          let durationMs = run.run_duration_ms || 0
          if (!durationMs && run.status === 'completed') {
            const finished = Date.parse(run.updated_at || '')
            if (finished > created) durationMs = finished - created
          }
          if (durationMs) minutesUsed += durationMs / 60000
        }
        if (runs.length < 100) break
        page++
      }
      minutesUsed = Math.round(minutesUsed)
      console.log(`  (fallback: ${minutesUsed} min calculados de las runs del mes)`)
    } catch (err) {
      return { ok: true, msg: `GitHub Actions check failed: ${err.message}` }
    }
  }

  const ratio = minutesUsed / LIMITS.GITHUB_ACTIONS_MINUTES_MONTH
  if (ratio >= LIMITS.GITHUB_ACTIONS_CRITICAL_AT) {
    return { ok: false, level: 'critical', msg: `GitHub Actions: ${minutesUsed}/${LIMITS.GITHUB_ACTIONS_MINUTES_MONTH} min (${Math.round(ratio*100)}%) — PAUSING` }
  }
  if (ratio >= LIMITS.GITHUB_ACTIONS_WARN_AT) {
    return { ok: true, level: 'warn', msg: `GitHub Actions: ${minutesUsed}/${LIMITS.GITHUB_ACTIONS_MINUTES_MONTH} min (${Math.round(ratio*100)}%) — near limit` }
  }
  return { ok: true, msg: `GitHub Actions: ${minutesUsed} min used this month` }
}

async function checkSupabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return { ok: true, msg: 'Supabase not configured, skipping' }
  try {
    const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0]
    const data = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/size`, {
      headers: { 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }
    })
    return { ok: true, msg: `Supabase size check attempted (API may need management key)` }
  } catch {
    // Fallback: estimate row counts from tables
    try {
      const tables = ['leads', 'webs_generadas', 'emails', 'config_envio']
      let totalRows = 0
      for (const table of tables) {
        const { createClient } = require('@supabase/supabase-js')
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
        totalRows += count || 0
      }
      if (totalRows >= LIMITS.SUPABASE_ROWS_CRITICAL) {
        return { ok: false, level: 'critical', msg: `Supabase: ~${totalRows} rows — PAUSING (limit ~100k)` }
      }
      if (totalRows >= LIMITS.SUPABASE_ROWS_WARN) {
        return { ok: true, level: 'warn', msg: `Supabase: ~${totalRows} rows — approaching limit` }
      }
      return { ok: true, msg: `Supabase: ~${totalRows} rows used` }
    } catch (err) {
      return { ok: true, msg: `Supabase check failed: ${err.message}` }
    }
  }
}

async function checkGmail() {
  if (!process.env.GMAIL_APP_PASSWORD) return { ok: true, msg: 'Gmail not configured, skipping' }
  try {
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { data } = await supabase.from('config_envio').select('emails_enviados_hoy').eq('id', 1).single()
    const sentToday = data?.emails_enviados_hoy || 0
    const ratio = sentToday / LIMITS.GMAIL_DAILY_LIMIT
    if (ratio >= 1) {
      return { ok: false, level: 'critical', msg: `Gmail: ${sentToday} sent today — PAUSING (daily limit ~${LIMITS.GMAIL_DAILY_LIMIT})` }
    }
    if (ratio >= LIMITS.GMAIL_WARN_AT) {
      return { ok: true, level: 'warn', msg: `Gmail: ${sentToday}/${LIMITS.GMAIL_DAILY_LIMIT} today` }
    }
    return { ok: true, msg: `Gmail: ${sentToday} sent today` }
  } catch (err) {
    return { ok: true, msg: `Gmail check failed: ${err.message}` }
  }
}

async function main() {
  console.log(`[${new Date().toISOString()}] NOIRA Limits Check`)
  console.log('─'.repeat(50))

  const results = await Promise.all([
    checkGitHubActions(),
    checkSupabase(),
    checkGmail(),
  ])

  let hasCritical = false
  let hasWarn = false

  for (const r of results) {
    const icon = r.level === 'critical' ? '🔴' : r.level === 'warn' ? '🟡' : '🟢'
    console.log(`${icon} ${r.msg}`)
    if (r.level === 'critical') hasCritical = true
    if (r.level === 'warn') hasWarn = true
  }

  console.log('─'.repeat(50))
  if (hasCritical) {
    console.log('🔴 CRITICAL: Pipeline PAUSED. Check limits before next run.')
    process.exit(2)
  }
  if (hasWarn) {
    console.log('🟡 WARNING: Some limits near threshold. Continue with caution.')
    process.exit(1)
  }
  console.log('🟢 All limits OK.')
  process.exit(0)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(0) // Don't block pipeline on script failure
})
