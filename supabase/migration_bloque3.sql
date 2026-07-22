-- Función para incrementar el contador de emails enviados hoy
CREATE OR REPLACE FUNCTION incrementar_contador_envio()
RETURNS void AS $$
BEGIN
  UPDATE config_envio
  SET emails_enviados_hoy = emails_enviados_hoy + 1,
      updated_at = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;
