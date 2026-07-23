async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) { console.log('MISSING_ENV'); process.exit(0) }

  const projectRef = url.replace('https://', '').split('.')[0]
  const sql = `
CREATE TABLE IF NOT EXISTS webhook_eventos (
  id              TEXT PRIMARY KEY,
  tipo            TEXT NOT NULL,
  procesado_en    TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS disputas_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id      TEXT NOT NULL,
  charge_id       TEXT,
  amount          NUMERIC(10,2),
  motivo          TEXT,
  estado          TEXT,
  creado_en       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE webs_generadas ADD COLUMN IF NOT EXISTS fecha_caducidad TIMESTAMPTZ;
ALTER TABLE webs_generadas ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE webs_generadas ADD COLUMN IF NOT EXISTS estado_pago TEXT DEFAULT 'demo';
ALTER TABLE disputas_log ENABLE ROW LEVEL SECURITY;
`

  const regions = ['eu-west-1','eu-west-2','eu-central-1','us-east-1','us-east-2','us-west-1','us-west-2','ca-central-1','ap-southeast-1','ap-southeast-2','ap-northeast-1','sa-east-1']

  for (const region of regions) {
    try {
      const { Client } = require('pg')
      const connString = `postgresql://postgres.${projectRef}:${encodeURIComponent(key)}@aws-0-${region}.pooler.supabase.com:6543/postgres?pgbouncer=true`
      const client = new Client({ connectionString: connString })
      await client.connect()
      await client.query('SET search_path TO public')
      await client.query(sql)
      await client.end()
      console.log('MIGRATION_OK region=' + region)
      return
    } catch (e) {
      // Try next region
    }
  }

  console.log('ALL_REGIONS_FAILED')
}

main()
