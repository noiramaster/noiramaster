import Link from 'next/link'

export default function PrivacidadPage() {
  return (
    <div style={{ background: '#0A0A0F', color: '#F5F3FF', minHeight: '100vh', fontFamily: 'Inter, sans-serif', padding: '80px 24px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', lineHeight: 1.8 }}>
        <Link href="/" style={{ color: '#6C4CE0', fontSize: 14, marginBottom: 24, display: 'inline-block' }}>← Volver a NOIRA</Link>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Política de privacidad</h1>
        <p style={{ color: '#8B85A8', fontSize: 13, marginBottom: 32 }}>Última actualización: julio 2026</p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>1. Datos que recogemos</h2>
        <p style={{ color: '#8B85A8' }}>Recogemos información de contacto (nombre, email) cuando un usuario rellena el formulario de recomendación. También recogemos datos de negocios locales desde fuentes públicas (nombre, categoría, ubicación, teléfono, reseñas) para generar las webs de demostración.</p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>2. Uso de los datos</h2>
        <p style={{ color: '#8B85A8' }}>Los datos se utilizan exclusivamente para: (a) generar y alojar webs de demostración, (b) contactar a los negocios vía email para ofrecerles la web generada, (c) mejorar nuestro sistema de detección de negocios sin web.</p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>3. Pagos</h2>
        <p style={{ color: '#8B85A8' }}>Los pagos se procesan a través de Stripe. NOIRA no almacena números de tarjeta, datos bancarios ni información de pago. Stripe gestiona todos los datos de pago según su propia política de privacidad.</p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>4. Retención de datos</h2>
        <p style={{ color: '#8B85A8' }}>Los datos de leads y webs generadas se conservan mientras el servicio esté activo. Los usuarios pueden solicitar la eliminación de sus datos contactando a noiramaster@gmail.com.</p>

        <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>5. Derechos del usuario</h2>
        <p style={{ color: '#8B85A8' }}>Los usuarios tienen derecho a acceder, rectificar y eliminar sus datos personales en cualquier momento. Para ejercer estos derechos, escribe a noiramaster@gmail.com. También puedes solicitar la baja de cualquier comunicación respondiendo "BAJA" al email recibido.</p>

        <p style={{ color: '#6C4CE0', fontSize: 13, marginTop: 40, padding: 16, border: '1px solid #2A2640', borderRadius: 8, background: '#15131F' }}>
          ⚖ Esta es una plantilla genérica. Recomendamos revisión por un profesional legal antes de operar a gran escala.
        </p>
      </div>
    </div>
  )
}
