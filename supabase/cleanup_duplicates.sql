-- Cleanup: eliminar leads duplicados de prueba y sus dependencias
-- Se eliminan los 3 registros de "Carnicería El Toro" creados el 21/07/2026

DELETE FROM emails WHERE lead_id IN (
  SELECT id FROM leads WHERE nombre_negocio = 'Carnicería El Toro'
  AND fecha_encontrado >= '2026-07-21' AND fecha_encontrado < '2026-07-22'
);

DELETE FROM webs_generadas WHERE lead_id IN (
  SELECT id FROM leads WHERE nombre_negocio = 'Carnicería El Toro'
  AND fecha_encontrado >= '2026-07-21' AND fecha_encontrado < '2026-07-22'
);

DELETE FROM leads WHERE nombre_negocio = 'Carnicería El Toro'
AND fecha_encontrado >= '2026-07-21' AND fecha_encontrado < '2026-07-22';

-- Actualizar URLs viejas en webs_generadas por si quedan registros con dominio antiguo
UPDATE webs_generadas
SET url_demo = REPLACE(url_demo, 'web-seven-roan-17.vercel.app', 'noira-demos.vercel.app')
WHERE url_demo LIKE '%web-seven-roan-17.vercel.app%';

UPDATE webs_generadas
SET url_demo = REPLACE(url_demo, 'noiramaster-web-client.vercel.app', 'noira-demos.vercel.app')
WHERE url_demo LIKE '%noiramaster-web-client.vercel.app%';

-- Resetear contador de envíos
UPDATE config_envio
SET emails_enviados_hoy = 0,
    fecha_ultimo_reset = CURRENT_DATE,
    updated_at = NOW()
WHERE id = 1;
