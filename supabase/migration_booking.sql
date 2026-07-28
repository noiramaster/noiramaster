-- Booking requests from self-service generated websites
CREATE TABLE IF NOT EXISTS solicitudes_cliente (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  web_id          UUID REFERENCES webs_selfservice(id) ON DELETE CASCADE,
  nombre_cliente  TEXT NOT NULL,
  telefono        TEXT NOT NULL,
  mensaje         TEXT,
  fecha           TIMESTAMPTZ DEFAULT NOW(),
  leido           BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_web ON solicitudes_cliente(web_id);

-- Extractions from Google Maps (for async GitHub Actions flow)
CREATE TABLE IF NOT EXISTS extracciones_pendientes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maps_url        TEXT NOT NULL,
  usuario_id      UUID REFERENCES usuarios_selfservice(id) ON DELETE CASCADE,
  estado          TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'procesando', 'completada', 'error')),
  resultado       JSONB,
  error_msg       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
