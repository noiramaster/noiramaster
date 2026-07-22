async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.log('MISSING_ENV'); process.exit(0) }

  const sql = `
CREATE TABLE IF NOT EXISTS recomendaciones (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  // Try all possible Supabase REST SQL endpoints
  const attempts = [
    { url: `${url}/rest/v1/rpc/exec_sql`, body: { sql } },
    { url: `${url}/rest/v1/rpc/pgm_execute`, body: { query: sql } },
    { url: `${url}/rest/v1/rpc/pgadmin_execute`, body: { query: sql } },
  ]

  for (const a of attempts) {
    try {
      const res = await fetch(a.url, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(a.body),
      })
      if (res.ok || res.status === 200) {
        console.log('MIGRATION_OK')
        return
      }
    } catch {}
  }

  // Final fallback: use the Supabase Management API
  const projectRef = url.replace('https://', '').split('.')[0]
  const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  if (mgmtRes.ok) {
    console.log('MIGRATION_OK')
    return
  }

  console.log('SQL_TO_RUN_MANUALLY:')
  console.log(sql)
}

main()
