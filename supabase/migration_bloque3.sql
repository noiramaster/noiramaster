-- Función para incrementar el contador de emails enviados hoy
CREATE OR REPLACE FUNCTION incrementar_contador_envio()
RETURNS void AS $$
BEGIN
  IF (SELECT fecha_ultimo_reset FROM config_envio WHERE id = 1) < CURRENT_DATE THEN
    UPDATE config_envio
    SET emails_enviados_hoy = 1,
        fecha_ultimo_reset = CURRENT_DATE,
        updated_at = NOW()
    WHERE id = 1;
  ELSE
    UPDATE config_envio
    SET emails_enviados_hoy = emails_enviados_hoy + 1,
        updated_at = NOW()
    WHERE id = 1;
  END IF;
END;
$$ LANGUAGE plpgsql;
