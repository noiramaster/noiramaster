import Link from 'next/link'

export default function TerminosPage() {
  return (
    <div style={{ background: '#0A0A0F', color: '#F5F3FF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: '80px 24px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', lineHeight: 1.8 }}>
        <Link href="/" style={{ color: '#6C4CE0', fontSize: 14, marginBottom: 24, display: 'inline-block' }}>← Volver a NOIRA</Link>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Términos de uso</h1>
        <p style={{ color: '#8B85A8', fontSize: 13, marginBottom: 32 }}>Última actualización: julio 2026</p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>1. Servicio</h2>
        <p style={{ color: '#8B85A8' }}>NOIRA genera sitios web de demostración para negocios locales sin presencia online. La web de demo es gratuita durante 7 días. Pasado ese plazo, se requiere una suscripción de pago (19€/mes) gestionada a través de Stripe para mantener la web activa.</p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>2. Suscripciones y pagos</h2>
        <p style={{ color: '#8B85A8' }}>Los pagos se procesan exclusivamente a través de Stripe. No almacenamos datos de tarjetas bancarias. La suscripción se renueva mensualmente de forma automática. El usuario puede cancelar en cualquier momento desde su panel de Stripe; al cancelar, la web se desactiva al final del periodo facturado.</p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>3. Uso de datos de terceros</h2>
        <p style={{ color: '#8B85A8' }}>NOIRA recopila información de negocios locales a través de fuentes públicas (OpenStreetMap, Google Maps, reseñas públicas). No almacenamos datos personales sensibles ni compartimos información con terceros no especificados en esta política.</p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>4. Limitación de responsabilidad</h2>
        <p style={{ color: '#8B85A8' }}>NOIRA proporciona el servicio "tal cual", sin garantías de disponibilidad continua. No nos hacemos responsables del uso que los negocios den a las webs generadas, ni de pérdidas derivadas de la interrupción del servicio.</p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>5. Baja y contacto</h2>
        <p style={{ color: '#8B85A8' }}>Los negocios pueden solicitar la baja de su web respondiendo "BAJA" al email de NOIRA. Para cualquier consulta: noiramaster@gmail.com</p>

        <p style={{ color: '#6C4CE0', fontSize: 13, marginTop: 40, padding: 16, border: '1px solid #2A2640', borderRadius: 8, background: '#15131F' }}>
          ⚖ Esta es una plantilla genérica. Recomendamos revisión por un profesional legal antes de operar a gran escala.
        </p>
      </div>
    </div>
  )
}
