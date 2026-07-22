const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const VERCEL_TOKEN = process.env.VERCEL_TOKEN

async function runSQL(supabase, sql) {
  // Try REST API with service_role key
  const url = `${SUPABASE_URL}/rest/v1/`
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'headers-only',
  }
  // Use pg_dump endpoint to execute raw SQL
  const res = await fetch(`${SUPABASE_URL}/pg/v1/sql`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SQL error (${res.status}): ${text}`)
  }
  return res
}

async function setVercelEnv(projectId, key, value) {
  const res = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key,
      value,
      target: ['production'],
      type: 'sensitive',
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Vercel env error for ${key}: ${text}`)
  }
  return res.json()
}

async function main() {
  console.log('STARTING MIGRATION AND CONFIGURATION...')
  const errors = []

  // Step 1: Run SQL migration
  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
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
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
      const { error } = await supabase.rpc('exec_sql', { sql })
      if (error) {
        // Fallback: use pg SQL endpoint
        try {
          await runSQL(supabase, sql)
          console.log('MIGRATION_OK (via pg endpoint)')
        } catch (e) {
          errors.push(`SQL fallback failed: ${e.message}`)
          console.log('SQL_TO_RUN_MANUALLY:')
          console.log(sql)
        }
      } else {
        console.log('MIGRATION_OK (via rpc)')
      }
    } catch (e) {
      errors.push(`Migration error: ${e.message}`)
      console.log('SQL_TO_RUN_MANUALLY:')
      console.log(sql)
    }
  } else {
    errors.push('Missing Supabase env vars')
  }

  // Step 2: Copy SUPABASE_SERVICE_ROLE_KEY to new Vercel projects
  if (VERCEL_TOKEN && SUPABASE_KEY) {
    const newProjects = [
      { id: 'prj_GzAPwBiiohy844KpygHF9AIx9yhW', name: 'noira' },
      { id: 'prj_2gMDbmpWyC5sOPwgx1xD4tQ9H2sB', name: 'noira-demos' },
    ]
    for (const proj of newProjects) {
      try {
        await setVercelEnv(proj.id, 'SUPABASE_SERVICE_ROLE_KEY', SUPABASE_KEY)
        console.log(`VERCEL_ENV_OK ${proj.name}: SUPABASE_SERVICE_ROLE_KEY`)
      } catch (e) {
        errors.push(`Vercel env for ${proj.name} failed: ${e.message}`)
      }
    }
  } else {
    errors.push('Missing Vercel token or Supabase key')
  }

  if (errors.length > 0) {
    console.log('ERRORS:')
    errors.forEach(e => console.log(`  - ${e}`))
    process.exit(1)
  } else {
    console.log('ALL_OK')
  }
}

main()
