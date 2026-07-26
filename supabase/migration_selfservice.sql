-- Self-service users
CREATE TABLE IF NOT EXISTS usuarios_selfservice (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id       TEXT NOT NULL UNIQUE,
  email           TEXT NOT NULL,
  nombre          TEXT NOT NULL,
  groq_key_cifrada TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Self-service webs pendientes (24h demo)
CREATE TABLE IF NOT EXISTS webs_selfservice (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id      UUID NOT NULL REFERENCES usuarios_selfservice(id) ON DELETE CASCADE,
  nombre_negocio  TEXT NOT NULL,
  categoria       TEXT NOT NULL,
  descripcion     TEXT,
  telefono        TEXT,
  idioma          TEXT NOT NULL DEFAULT 'es',
  url_demo        TEXT,
  estilo_aplicado TEXT,
  pagina_html     TEXT,
  fecha_creacion  TIMESTAMPTZ DEFAULT NOW(),
  fecha_caducidad TIMESTAMPTZ NOT NULL,
  estado_pago     TEXT NOT NULL DEFAULT 'demo' CHECK (estado_pago IN ('demo', 'activa', 'cancelada', 'impagada')),
  stripe_subscription_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webs_selfservice_usuario ON webs_selfservice(usuario_id);
CREATE INDEX IF NOT EXISTS idx_webs_selfservice_caducidad ON webs_selfservice(fecha_caducidad) WHERE estado_pago = 'demo';
