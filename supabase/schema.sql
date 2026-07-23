-- ============================================================
-- NOIRA — Schema de Base de Datos (Supabase)
-- Bloques 1+: leads, webs_generadas, emails, config_envio
-- ============================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: leads
-- ============================================================
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_negocio  TEXT NOT NULL,
  categoria       TEXT,
  telefono        TEXT,
  ubicacion       TEXT,
  pais            TEXT NOT NULL CHECK (pais IN ('ES', 'MA')),
  idioma          TEXT NOT NULL DEFAULT 'es' CHECK (idioma IN ('es', 'fr')),
  num_resenas     INT DEFAULT 0,
  tiene_web       BOOLEAN DEFAULT FALSE,
  fecha_encontrado TIMESTAMPTZ DEFAULT NOW(),
  estado          TEXT NOT NULL DEFAULT 'nuevo' CHECK (estado IN (
                    'nuevo',
                    'web_generada',
                    'email_listo',
                    'contactado',
                    'respondido',
                    'descartado'
                  )),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: webs_generadas
-- ============================================================
CREATE TABLE webs_generadas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  url_demo        TEXT,
  estilo_aplicado TEXT,
  estado          TEXT NOT NULL DEFAULT 'pendiente_revision' CHECK (estado IN (
                    'pendiente_revision',
                    'aprobada',
                    'rechazada'
                  )),
  fecha_caducidad TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  estado_pago     TEXT DEFAULT 'demo' CHECK (estado_pago IN ('demo', 'activa', 'cancelada', 'impagada')),
  fecha           TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: emails
-- ============================================================
CREATE TABLE emails (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  asunto          TEXT,
  cuerpo          TEXT,
  estado          TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN (
                    'borrador',
                    'listo',
                    'enviado',
                    'respondido',
                    'rechazado'
                  )),
  fecha_generado  TIMESTAMPTZ DEFAULT NOW(),
  fecha_enviado   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: config_envio (fila única id=1)
-- ============================================================
CREATE TABLE config_envio (
  id                    INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  semana_actual         INT NOT NULL DEFAULT 1,
  limite_diario_actual  INT NOT NULL DEFAULT 20,
  emails_enviados_hoy   INT NOT NULL DEFAULT 0,
  fecha_ultimo_reset    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar la fila única
INSERT INTO config_envio (id, semana_actual, limite_diario_actual, emails_enviados_hoy, fecha_ultimo_reset)
VALUES (1, 1, 20, 0, CURRENT_DATE);

-- ============================================================
-- FUNCIÓN: reset diario del contador de emails
-- ============================================================
CREATE OR REPLACE FUNCTION resetear_contador_diario()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fecha_ultimo_reset <> OLD.fecha_ultimo_reset THEN
    NEW.emails_enviados_hoy := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_resetear_contador
  BEFORE UPDATE ON config_envio
  FOR EACH ROW
  EXECUTE FUNCTION resetear_contador_diario();

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_leads_estado ON leads(estado);
CREATE INDEX idx_leads_pais ON leads(pais);
CREATE INDEX idx_leads_fecha_encontrado ON leads(fecha_encontrado);

CREATE INDEX idx_webs_generadas_estado ON webs_generadas(estado);
CREATE INDEX idx_webs_generadas_lead_id ON webs_generadas(lead_id);

CREATE INDEX idx_emails_estado ON emails(estado);
CREATE INDEX idx_emails_lead_id ON emails(lead_id);

-- ============================================================
-- TABLA: recomendaciones (formulario público)
-- ============================================================
CREATE TABLE recomendaciones (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre_recomendante TEXT NOT NULL,
  email_recomendante  TEXT NOT NULL,
  negocio_recomendado TEXT NOT NULL,
  ubicacion_o_info    TEXT,
  fecha               TIMESTAMPTZ DEFAULT NOW(),
  estado              TEXT NOT NULL DEFAULT 'nueva' CHECK (estado IN ('nueva', 'contactada', 'cerrada', 'descartada')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recomendaciones_estado ON recomendaciones(estado);

-- ============================================================
-- TABLA: webhook_eventos (idempotencia Stripe)
-- ============================================================
-- ============================================================
-- TABLA: webhook_eventos (idempotencia Stripe)
-- ============================================================
CREATE TABLE IF NOT EXISTS webhook_eventos (
  id              TEXT PRIMARY KEY,
  tipo            TEXT NOT NULL,
  procesado_en    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLA: disputas_log (chargebacks de Stripe)
-- ============================================================
CREATE TABLE IF NOT EXISTS disputas_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id      TEXT NOT NULL,
  charge_id       TEXT,
  amount          NUMERIC(10,2),
  motivo          TEXT,
  estado          TEXT,
  creado_en       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (activada, SIN políticas para anon)
-- ============================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE webs_generadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE config_envio ENABLE ROW LEVEL SECURITY;
ALTER TABLE recomendaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputas_log ENABLE ROW LEVEL SECURITY;

-- Nota: no se crean políticas para 'anon' porque todo el acceso
-- será vía service_role key desde el servidor / GitHub Actions.
-- Service_role bypasses RLS automáticamente.
