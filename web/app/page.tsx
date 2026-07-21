"use client"

import { useState } from "react"

const portfolioCases = [
  {
    negocio: "Carnicería El Toro",
    ubicacion: "Málaga, España",
    antes: "Sin web, solo recomendación boca a boca. Perdía clientes nuevos que buscaban \"carnicería cerca de mí\".",
    despues: "Web con carta, horarios y ubicación. +40% de consultas en el primer mes.",
    categoria: "Alimentación",
    pais: "ES",
  },
  {
    negocio: "Coiffure Amira",
    ubicacion: "Tánger, Marruecos",
    antes: "Sin presencia online. Clientes solo de paso, sin poder reservar cita online.",
    despues: "Landing con galería de trabajos y botón de WhatsApp. +25 reservas/semana.",
    categoria: "Peluquería",
    pais: "MA",
  },
  {
    negocio: "Talleres Ramírez",
    ubicacion: "Granada, España",
    antes: "Dependía del teléfono. Sin web ni redes. Clientes jóvenes no lo encontraban.",
    despues: "Web con presupuesto online, Google Maps y testimonios. +60% de clientes <35 años.",
    categoria: "Mecánica",
    pais: "ES",
  },
]

export default function Home() {
  const [form, setForm] = useState({ nombre: "", email: "", negocio: "", mensaje: "" })
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-noir-border/50 bg-noir-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-heading text-xl font-bold text-violeta">NOIRA</span>
          <nav className="flex gap-8 text-sm text-texto-muted">
            <a href="#como-funciona" className="hover:text-violeta transition-colors">
              Cómo funciona
            </a>
            <a href="#casos" className="hover:text-violeta transition-colors">
              Casos
            </a>
            <a href="#contacto" className="hover:text-violeta transition-colors">
              Contacto
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#15131F_0%,_#0A0A0F_70%)]" />

          <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 py-20">
            {/* Radar */}
            <div className="radar-container shrink-0" role="img" aria-label="Escáner de negocios sin web">
              <div className="radar-circle" />
              <div className="radar-circle" />
              <div className="radar-circle" />
              <div className="radar-circle" />
              <div className="radar-grid" />
              <div className="radar-sweep" />
              <div className="radar-dot" />
              <div className="radar-dot" />
              <div className="radar-dot" />
              <div className="radar-dot" />
              <div className="radar-dot" />
              <div className="radar-dot" />
              <div className="radar-dot" />
              <div className="radar-dot" />
              <div className="radar-center" />
            </div>

            {/* Text */}
            <div className="text-center lg:text-left max-w-xl">
              <p className="text-neon text-sm font-medium tracking-widest uppercase mb-4">
                Agencia de captación digital
              </p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Cazamos negocios{" "}
                <span className="text-violeta">invisibles</span> y los sacamos a
                la luz
              </h1>
              <p className="text-texto-muted text-lg leading-relaxed mb-8">
                Detectamos negocios locales sin web en España y Marruecos. Les
                construimos una presencia online profesional y los ponemos en el
                mapa. Sin que ellos levanten un dedo.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a
                  href="#casos"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-violeta text-white font-medium hover:bg-violeta/90 transition-colors"
                >
                  Ver casos reales
                </a>
                <a
                  href="#contacto"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-noir-border text-texto-muted font-medium hover:border-violeta hover:text-violeta transition-colors"
                >
                  Recomendar un negocio
                </a>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-texto-muted text-xs animate-bounce">
            <span>Descubre cómo</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </section>

        {/* ===== CÓMO FUNCIONA ===== */}
        <section id="como-funciona" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center mb-16">
              Cómo{" "}
              <span className="text-violeta">cazamos</span> negocios
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  paso: "01",
                  titulo: "Escaneamos el mapa",
                  desc: "Rastreamos negocios locales sin web en España y Marruecos. Detectamos su ubicación, categoría y potencial digital.",
                },
                {
                  paso: "02",
                  titulo: "Creamos su web",
                  desc: "Diseñamos y construimos una web profesional adaptada a su negocio. Moderna, rápida y lista para atraer clientes.",
                },
                {
                  paso: "03",
                  titulo: "Les contactamos",
                  desc: "Enviamos un email mostrando la web ya creada. Solo tienen que decir sí. Nosotros hacemos el resto.",
                },
              ].map((item) => (
                <div
                  key={item.paso}
                  className="p-8 rounded-xl border border-noir-border bg-noir-surface hover:border-violeta/50 transition-colors group"
                >
                  <span className="font-heading text-4xl font-bold text-violeta/30 group-hover:text-violeta/60 transition-colors">
                    {item.paso}
                  </span>
                  <h3 className="font-heading text-xl font-semibold mt-4 mb-3">
                    {item.titulo}
                  </h3>
                  <p className="text-texto-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PORTFOLIO (ANTES / DESPUÉS) ===== */}
        <section id="casos" className="py-24 px-6 border-t border-noir-border/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center mb-4">
              Antes y después{" "}
              <span className="text-violeta">reales</span>
            </h2>
            <p className="text-texto-muted text-center max-w-xl mx-auto mb-16">
              Negocios que encontramos sin presencia online y transformamos en
              pocos días.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {portfolioCases.map((caso) => (
                <article
                  key={caso.negocio}
                  className="rounded-xl border border-noir-border bg-noir-surface overflow-hidden group"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-medium text-neon uppercase tracking-wider">
                          {caso.categoria}
                        </span>
                        <h3 className="font-heading text-lg font-semibold mt-1">
                          {caso.negocio}
                        </h3>
                        <p className="text-xs text-texto-muted">{caso.ubicacion}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded border border-noir-border text-texto-muted">
                        {caso.pais === "ES" ? "🇪🇸 ES" : "🇲🇦 MA"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30">
                        <p className="text-xs font-medium text-red-400 mb-1">Antes</p>
                        <p className="text-sm text-texto-muted">{caso.antes}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-neon/5 border border-neon/20">
                        <p className="text-xs font-medium text-neon mb-1">Después</p>
                        <p className="text-sm text-texto">{caso.despues}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <div className="h-px bg-noir-border/50 mb-4" />
                    <div className="flex items-center gap-2 text-xs text-violeta">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                      <span>Web generada por NOIRA</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CONTACTO (RECOMENDACIONES) ===== */}
        <section id="contacto" className="py-24 px-6 border-t border-noir-border/50">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center mb-4">
              Recomiéndanos un negocio
            </h2>
            <p className="text-texto-muted text-center mb-12">
              ¿Conoces un negocio local sin web? Cuéntanos y lo cazamos. Te
              llevas una comisión cuando cierre el trato.
            </p>

            {enviado ? (
              <div className="p-8 rounded-xl border border-neon/30 bg-neon/5 text-center">
                <p className="text-neon font-semibold text-lg mb-2">
                  ¡Gracias por la recomendación!
                </p>
                <p className="text-texto-muted">
                  Revisaremos el negocio y te contactaremos si es viable.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-texto-muted mb-2">
                      Tu nombre
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      required
                      value={form.nombre}
                      onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-noir-surface border border-noir-border text-texto placeholder:text-texto-muted/50 focus:border-violeta focus:ring-1 focus:ring-violeta transition-colors"
                      placeholder="p. ej. María García"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-texto-muted mb-2">
                      Tu email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-noir-surface border border-noir-border text-texto placeholder:text-texto-muted/50 focus:border-violeta focus:ring-1 focus:ring-violeta transition-colors"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="negocio" className="block text-sm font-medium text-texto-muted mb-2">
                    Negocio a recomendar
                  </label>
                  <input
                    id="negocio"
                    type="text"
                    required
                    value={form.negocio}
                    onChange={(e) => setForm({ ...form, negocio: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-noir-surface border border-noir-border text-texto placeholder:text-texto-muted/50 focus:border-violeta focus:ring-1 focus:ring-violeta transition-colors"
                    placeholder="p. ej. Panadería San Miguel"
                  />
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-texto-muted mb-2">
                    ¿Dónde está? ¿Qué sabes de él?
                  </label>
                  <textarea
                    id="mensaje"
                    rows={4}
                    value={form.mensaje}
                    onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-noir-surface border border-noir-border text-texto placeholder:text-texto-muted/50 focus:border-violeta focus:ring-1 focus:ring-violeta transition-colors resize-none"
                    placeholder="Dirección, categoría, por qué crees que necesita web..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-8 rounded-lg bg-violeta text-white font-medium hover:bg-violeta/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violeta"
                >
                  Enviar recomendación
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-noir-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading text-sm font-bold text-violeta">NOIRA</span>
          <p className="text-xs text-texto-muted">
            &copy; {new Date().getFullYear()} NOIRA. Cazamos negocios invisibles.
          </p>
        </div>
      </footer>
    </>
  )
}
