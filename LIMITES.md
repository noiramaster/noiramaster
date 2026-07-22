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

**Cada ejecución del scraper**: ~3-5 min (incluye instalación de Chromium vía npx)
**Cada ejecución del generator**: ~1-2 min

Para liberar minutos: cachear `node_modules` y Chromium en las Actions.

---

## 2. Supabase Free Tier

| Recurso | Límite gratuito | Warning | Crítico (PAUSA) |
|---------|----------------|---------|-----------------|
| Filas totales | ~100 000 | 50 000 | 95 000 |
| Almacenamiento DB | 500 MB | 200 MB | 450 MB |

Al pausar: el scraper y generator seguirán ejecutándose pero **no insertarán nuevos leads**.

---

## 3. Gmail (SMTP gratuito)

| Recurso | Límite | Warning | Crítico (PAUSA) |
|---------|--------|---------|-----------------|
| Emails/día | ~500 (límite Google) | 350/día | 500/día |
| Emails/destinatario | ~100/día (protección spam) | — | — |

NOIRA envía todos los emails **a noiramaster@gmail.com** (modo desarrollo).
Al cambiar a destinatarios reales, respetar estos límites.

**Si un email rebota o falla**: el sistema marca el email como `error_envio`.
**Si el contador diario se excede**: los nuevos emails se guardan como `borrador`
y se envían al día siguiente cuando el contador se resetea.

---

## 4. Overpass API (gratuita)

Sin límite duro documentado, pero solicitudes masivas (>100/min) pueden ser
rate-limitadas. NOIRA respeta un delay aleatorio entre 3-8s entre queries.

---

## 5. Gemini API

La API key actual no tiene cuota disponible (429/403). El sistema usa fallback
sin IA: copia genérica + email plantilla. Funcionalidad completa cuando la key
tenga cuota.

---

## ¿Qué hacer si el pipeline se pausa?

1. Revisar los logs de la última ejecución del workflow `limits-check`
2. Identificar qué servicio alcanzó el límite crítico
3. Según el caso:
   - **GitHub Actions**: migrar a plan de pago ($8/mes por 1 000 min extra) o cachear dependencias
   - **Supabase**: migrar a plan Pro ($25/mes) o limpiar datos antiguos
   - **Gmail**: crear cuentas Gmail adicionales o usar un servicio de email transaccional (SendGrid, Resend)
4. Una vez resuelto, la siguiente ejecución programada reanudará el pipeline automáticamente
