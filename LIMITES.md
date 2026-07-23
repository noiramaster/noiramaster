# Límites gratuitos — NOIRA

Este documento registra los techos de los servicios gratuitos que usa NOIRA,
y el comportamiento del sistema cuando se acerca a ellos.

---

## 1. GitHub Actions — 2 000 min/mes

| Threshold | Acción |
|-----------|--------|
| < 80% (1 600 min) | ✅ Normal |
| ≥ 80% (1 600 min) | ⚠️ Warning en log del workflow |
| ≥ 95% (1 900 min) | 🔴 Pipeline se PAUSA (exit code 2). No se ejecutan scraper ni generator |

**Cada ejecución del scraper**: ~5-8 min (incluye instalación de Chromium)
**Cada ejecución del generator**: ~1-2 min
**Cada ejecución del límite-check**: ~30s

Cálculo realista: con 8 ejecuciones/día (scraper cada 6h + generator cada 3h) ≈ 30-60 min/día ≈ 900-1800 min/mes.
**Con 50 negocios activos pagando**, el sistema procesaría más leads → más ejecuciones → se acercaría al límite.

Para liberar minutos: cachear `node_modules` y Chromium en las Actions.

---

## 2. Supabase Free Tier

| Recurso | Límite gratuito | Warning | Crítico (PAUSA) |
|---------|----------------|---------|-----------------|
| Filas totales | ~100 000 | 50 000 | 95 000 |
| Almacenamiento DB | 500 MB | 200 MB | 450 MB |

⚠️ **Importante**: Supabase free tier PAUSA proyectos tras 7 días sin actividad.
NOIRA tiene actividad diaria (workflows), pero si se detienen los workflows, el proyecto entraría en pausa.
Al pausar: la DB no responde hasta que se reanuda manualmente desde el dashboard.

**Con 50 negocios activos**: cada negocio genera ~3 filas (lead + web + email) ≈ 150 filas/mes.
No hay riesgo de filas en varios años. El almacenamiento tampoco es problema.

---

## 3. Vercel Free Tier (Hobby)

| Recurso | Límite | Nota |
|---------|--------|------|
| Invocaciones serverless/día | 100.000 | Suficiente incluso con 50 negocios |
| Ancho de banda | 100 GB/mes | ~2 GB por cada 10.000 visitas |
| Builds/mes | 6.000 minutos | Suficiente |
| **Cold starts** | — | Las funciones serverless se duermen tras ~5 min sin uso. Primer request tras inactividad tarda 2-5s extra. **Normal**, no es un bug. |

---

## 4. Gmail SMTP (gratuito)

| Recurso | Límite | Warning | Crítico (PAUSA) |
|---------|--------|---------|-----------------|
| Emails/día | ~500 (límite Google) | 350/día | 500/día |
| Emails/destinatario | ~100/día (protección spam) | — | — |

NOIRA envía todos los emails **a noiramaster@gmail.com** (modo desarrollo).
Al cambiar a destinatarios reales, respetar estos límites.

**Si un email rebota o falla**: el sistema marca el email como `error_envio`.
**Si el contador diario se excede**: los nuevos emails se guardan como `borrador`.

⚠️ **Con 50 negocios activos**: cada ciclo del generator podría enviar hasta 5 emails.
Incluso con 50 negocios, el límite diario no se alcanza. El problema es la reputación del remitente,
no el límite técnico.

---

## 5. Overpass API (gratuita)

Sin límite duro documentado, pero solicitudes masivas (>100/min) pueden ser
rate-limitadas. NOIRA respeta un delay aleatorio entre 3-8s entre queries.

---

## 6. Gemini API

La API key actual no tiene cuota disponible (429/403). El sistema usa fallback
sin IA: copia genérica + email plantilla. Funcionalidad completa cuando la key
tenga cuota.

La cuota gratuita de Gemini es generosa (60 requests/minuto, sin límite diario duro).
Si se activa, no debería ser un cuello de botella.

---

## 7. Stripe (pagos)

Sin límite gratuito real. Stripe cobra ~2.9% + 0.30€ por transacción.
Con 50 suscripciones a 19€/mes: ingresos ~950€/mes, comisiones ~57,55€/mes.

---

## ¿Qué hacer si el pipeline se pausa?

1. Revisar los logs de la última ejecución del workflow `limits-check`
2. Identificar qué servicio alcanzó el límite crítico
3. Según el caso:
   - **GitHub Actions**: migrar a plan de pago ($8/mes por 1 000 min extra) o cachear dependencias
   - **Supabase**: migrar a plan Pro ($25/mes) o limpiar datos antiguos
   - **Gmail**: crear cuentas Gmail adicionales o usar un servicio de email transaccional (SendGrid, Resend)
4. Una vez resuelto, la siguiente ejecución programada reanudará el pipeline automáticamente
