const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const VERCEL_TOKEN = process.env.VERCEL_TOKEN
const PROJECT_REF = SUPABASE_URL ? SUPABASE_URL.replace('https://', '').split('.')[0] : ''

async function runSQL(sql) {
  // Install pg at runtime
  const { Client } = require('pg')
  const connString = `postgresql://postgres:${encodeURIComponent(SUPABASE_KEY)}@db.${PROJECT_REF}.supabase.co:5432/postgres`
  const client = new Client({ connectionString: connString, family: 4, ssl: { rejectUnauthorized: false } })
  await client.connect()
  await client.query(sql)
  await client.end()
  const client = new Client({ connectionString: connString })
  await client.connect()
  try {
    await client.query(sql)
  } finally {
    await client.end()
  }
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
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    })
    if (!res.ok) { const t = await res.text(); throw new Error('PATCH: ' + t) }
  } else {
    const res = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${VERCEL_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, target: ['production'], type: 'sensitive' }),
    })
    if (!res.ok) { const t = await res.text(); throw new Error('POST: ' + t) }
  }
}

async function main() {
  console.log('STARTING...')
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
      await runSQL(sql)
      console.log('MIGRATION_OK')
    } catch (e) {
      errors.push('SQL: ' + e.message.split('\n')[0])
      console.log('SQL_TO_RUN_MANUALLY:')
      console.log(sql)
    }
  }

  if (VERCEL_TOKEN && SUPABASE_KEY) {
    for (const proj of [
      { id: 'prj_GzAPwBiiohy844KpygHF9AIx9yhW', name: 'noira' },
      { id: 'prj_2gMDbmpWyC5sOPwgx1xD4tQ9H2sB', name: 'noira-demos' },
    ]) {
      try {
        await setVercelEnv(proj.id, 'SUPABASE_SERVICE_ROLE_KEY', SUPABASE_KEY)
        console.log('VERCEL_OK ' + proj.name)
      } catch (e) { errors.push('Vercel ' + proj.name + ': ' + e.message) }
    }
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
