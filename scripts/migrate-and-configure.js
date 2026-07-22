const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const VERCEL_TOKEN = process.env.VERCEL_TOKEN

async function runSQL(sql) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  // Attempt to call each possible SQL RPC
  const rpcs = ['exec_sql', 'pgm_execute', 'pgexecute', 'sql', 'query']
  for (const rpc of rpcs) {
    try {
      const { data, error } = await supabase.rpc(rpc, { query: sql, sql_text: sql, sql: sql })
      if (!error) return { method: rpc, data }
    } catch (e) {
      // continue
    }
  }
  // Try via custom fetch to postgREST with raw SQL header
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apiKey': SUPABASE_KEY,
      'Accept': 'application/json',
      'X-SQL': sql,
    },
  })
  if (res.ok) return { method: 'X-SQL', data: await res.json() }
  throw new Error('ALL_SQL_METHODS_FAILED')
}

async function getVercelEnvId(projectId, key) {
  const res = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  const env = data.envs.find(e => e.key === key)
  return env ? env.id : null
}

async function setVercelEnv(projectId, key, value) {
  const existingId = await getVercelEnvId(projectId, key)
  if (existingId) {
    const res = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${existingId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`PATCH error: ${text}`)
    }
  } else {
    const res = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value, target: ['production'], type: 'sensitive' }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`POST error: ${text}`)
    }
  }
}

async function main() {
  console.log('STARTING MIGRATION AND CONFIGURATION...')
  const errors = []

  const sql = `
CREATE TABLE IF NOT EXISTS recomendaciones (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_recomendante TEXT NOT NULL,
  email_recomendante  TEXT NOT NULL,
  negocio_recomendado TEXT NOT NULL,
  ubicacion_o_info    TEXT,
  fecha               TIMESTAMPTZ DEFAULT NOW(),
  estado              TEXT NOT NULL DEFAULT 'nueva' CHECK (estado IN ('nueva', 'contactada', 'cerrada', 'descartada')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recomendaciones_estado ON recomendaciones(estado);
ALTER TABLE recomendaciones ENABLE ROW LEVEL SECURITY;
`

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const result = await runSQL(sql)
      console.log('MIGRATION_OK method=' + result.method)
    } catch (e) {
      errors.push(`SQL: ${e.message}`)
      console.log('SQL_TO_RUN_MANUALLY:')
      console.log(sql)
    }
  } else {
    errors.push('Missing Supabase env vars')
  }

  if (VERCEL_TOKEN && SUPABASE_KEY) {
    for (const proj of [
      { id: 'prj_GzAPwBiiohy844KpygHF9AIx9yhW', name: 'noira' },
      { id: 'prj_2gMDbmpWyC5sOPwgx1xD4tQ9H2sB', name: 'noira-demos' },
    ]) {
      try {
        await setVercelEnv(proj.id, 'SUPABASE_SERVICE_ROLE_KEY', SUPABASE_KEY)
        console.log('VERCEL_ENV_OK ' + proj.name + ': SUPABASE_SERVICE_ROLE_KEY')
      } catch (e) {
        errors.push('Vercel env for ' + proj.name + ': ' + e.message)
      }
    }
  } else {
    errors.push('Missing Vercel token or Supabase key')
  }

  if (errors.length > 0) {
    console.log('ERRORS:')
    errors.forEach(e => console.log('  - ' + e))
    process.exit(1)
  } else {
    console.log('ALL_OK')
  }
}

main()
