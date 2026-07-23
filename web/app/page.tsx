"use client"

import { useState, useEffect } from "react"

const LANG = {
  es: {
    hero_tag: "Agencia de captación digital",
    hero_title_1: "Cazamos negocios",
    hero_title_2: "invisibles",
    hero_title_3: " y los sacamos a la luz",
    hero_desc: "Detectamos negocios locales sin web en España y Marruecos. Les construimos una presencia online profesional y los ponemos en el mapa. Sin que ellos levanten un dedo.",
    hero_cta_1: "Ver casos reales",
    hero_cta_2: "Recomendar un negocio",
    scroll_hint: "Descubre cómo",
    nav_1: "Cómo funciona",
    nav_2: "Casos",
    nav_3: "Contacto",
    how_title_1: "Cómo",
    how_title_2: "cazamos",
    how_title_3: " negocios",
    step_1_title: "Escaneamos el mapa",
    step_1_desc: "Rastreamos negocios locales sin web en España y Marruecos. Detectamos su ubicación, categoría y potencial digital.",
    step_2_title: "Creamos su web",
    step_2_desc: "Diseñamos y construimos una web profesional adaptada a su negocio. Moderna, rápida y lista para atraer clientes.",
    step_3_title: "Les contactamos",
    step_3_desc: "Enviamos un email mostrando la web ya creada. Solo tienen que decir sí. Nosotros hacemos el resto.",
    portfolio_title_1: "Antes y después",
    portfolio_title_2: "reales",
    portfolio_desc: "Negocios que encontramos sin presencia online y transformamos en pocos días.",
    portfolio_before: "Antes",
    portfolio_after: "Después",
    portfolio_tag: "Web generada por NOIRA",
    contact_title: "Recomiéndanos un negocio",
    contact_desc: "¿Conoces un negocio local sin web? Cuéntanos y lo cazamos. Te llevas una comisión cuando cierre el trato.",
    contact_thanks: "¡Gracias por la recomendación!",
    contact_thanks_desc: "Revisaremos el negocio y te contactaremos si es viable.",
    form_name: "Tu nombre",
    form_name_ph: "p. ej. María García",
    form_email: "Tu email",
    form_email_ph: "tu@email.com",
    form_business: "Negocio a recomendar",
    form_business_ph: "p. ej. Panadería San Miguel",
    form_info: "¿Dónde está? ¿Qué sabes de él?",
    form_info_ph: "Dirección, categoría, por qué crees que necesita web...",
    form_submit: "Enviar recomendación",
    form_sending: "Enviando...",
    footer: "Cazamos negocios invisibles.",
    lang_es: "ES",
    lang_fr: "FR",
  },
  fr: {
    hero_tag: "Agence de capture numérique",
    hero_title_1: "Nous chassons les",
    hero_title_2: "invisibles",
    hero_title_3: " et les révélons au grand jour",
    hero_desc: "Nous détectons les commerces locaux sans site web en Espagne et au Maroc. Nous leur créons une présence en ligne professionnelle et les mettons sur la carte. Sans qu'ils lèvent le petit doigt.",
    hero_cta_1: "Voir des cas réels",
    hero_cta_2: "Recommander un commerce",
    scroll_hint: "Découvrez comment",
    nav_1: "Fonctionnement",
    nav_2: "Cas",
    nav_3: "Contact",
    how_title_1: "Comment nous",
    how_title_2: "chassons",
    how_title_3: " les commerces",
    step_1_title: "Nous scannons la carte",
    step_1_desc: "Nous repérons les commerces locaux sans site web en Espagne et au Maroc. Nous détectons leur emplacement, catégorie et potentiel numérique.",
    step_2_title: "Nous créons leur site",
    step_2_desc: "Nous concevons et construisons un site web professionnel adapté à leur activité. Moderne, rapide et prêt à attirer des clients.",
    step_3_title: "Nous les contactons",
    step_3_desc: "Nous envoyons un email présentant le site déjà créé. Ils n'ont qu'à dire oui. Nous faisons le reste.",
    portfolio_title_1: "Avant et après",
    portfolio_title_2: "réels",
    portfolio_desc: "Des commerces que nous avons trouvés sans présence en ligne et transformés en quelques jours.",
    portfolio_before: "Avant",
    portfolio_after: "Après",
    portfolio_tag: "Site web créé par NOIRA",
    contact_title: "Recommandez-nous un commerce",
    contact_desc: "Vous connaissez un commerce local sans site web ? Dites-le nous et nous le chassons. Vous touchez une commission lorsque l'affaire est conclue.",
    contact_thanks: "Merci pour votre recommandation !",
    contact_thanks_desc: "Nous examinerons le commerce et vous contacterons s'il est viable.",
    form_name: "Votre nom",
    form_name_ph: "ex. Marie García",
    form_email: "Votre email",
    form_email_ph: "votre@email.com",
    form_business: "Commerce à recommander",
    form_business_ph: "ex. Boulangerie Saint-Michel",
    form_info: "Où se trouve-t-il ? Que savez-vous de lui ?",
    form_info_ph: "Adresse, catégorie, pourquoi pensez-vous qu'il a besoin d'un site web...",
    form_submit: "Envoyer la recommandation",
    form_sending: "Envoi en cours...",
    footer: "Nous chassons les commerces invisibles.",
    lang_es: "ES",
    lang_fr: "FR",
  },
}

const portfolioCases = [
  { negocio: "Carnicería El Toro", ubicacion_es: "Málaga, España", ubicacion_fr: "Málaga, Espagne", antes_es: 'Sin web, solo recomendación boca a boca. Perdía clientes nuevos que buscaban "carnicería cerca de mí".', antes_fr: 'Sans site web, seulement le bouche à oreille. Perdait de nouveaux clients qui cherchaient "boucherie près de chez moi".', despues_es: "Web con carta, horarios y ubicación. +40% de consultas en el primer mes.", despues_fr: "Site avec carte, horaires et localisation. +40% de demandes le premier mois.", categoria: "Alimentación", categoria_fr: "Alimentation", pais: "ES" },
  { negocio: "Coiffure Amira", ubicacion_es: "Tánger, Marruecos", ubicacion_fr: "Tanger, Maroc", antes_es: "Sin presencia online. Clientes solo de paso, sin poder reservar cita online.", antes_fr: "Sans présence en ligne. Clients de passage seulement, sans pouvoir réserver en ligne.", despues_es: "Landing con galería de trabajos y botón de WhatsApp. +25 reservas/semana.", despues_fr: "Landing avec galerie de travaux et bouton WhatsApp. +25 réservations/semaine.", categoria: "Peluquería", categoria_fr: "Coiffure", pais: "MA" },
  { negocio: "Talleres Ramírez", ubicacion_es: "Granada, España", ubicacion_fr: "Grenade, Espagne", antes_es: "Dependía del teléfono. Sin web ni redes. Clientes jóvenes no lo encontraban.", antes_fr: "Dépendait du téléphone. Sans site ni réseaux. Les jeunes clients ne le trouvaient pas.", despues_es: "Web con presupuesto online, Google Maps y testimonios. +60% de clientes <35 años.", despues_fr: "Site avec devis en ligne, Google Maps et témoignages. +60% de clients <35 ans.", categoria: "Mecánica", categoria_fr: "Mécanique", pais: "ES" },
]

export default function Home() {
  const [form, setForm] = useState({ nombre: "", email: "", negocio: "", mensaje: "" })
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [lang, setLang] = useState("es")

  useEffect(() => {
    const saved = localStorage.getItem("noira_lang")
    if (saved === "es" || saved === "fr") { setLang(saved); return }
    const accept = navigator.language || ""
    if (accept.startsWith("fr")) setLang("fr")
    localStorage.setItem("noira_lang", lang)
  }, [])

  useEffect(() => { localStorage.setItem("noira_lang", lang) }, [lang])

  const t = LANG[lang as keyof typeof LANG]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setEnviando(true)
    try {
      const res = await fetch('/api/recomendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al enviar')
      setEnviado(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-noir-border/50 bg-noir-bg/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-heading text-xl font-bold text-violeta">NOIRA</span>
          <div className="flex items-center gap-6">
            <nav className="flex gap-8 text-sm text-texto-muted">
              <a href="#como-funciona" className="hover:text-violeta transition-colors">{t.nav_1}</a>
              <a href="#casos" className="hover:text-violeta transition-colors">{t.nav_2}</a>
              <a href="#contacto" className="hover:text-violeta transition-colors">{t.nav_3}</a>
            </nav>
            <div className="flex gap-1 text-xs border border-noir-border rounded-lg overflow-hidden">
              <button onClick={() => setLang("es")} className={`px-2 py-1 ${lang === "es" ? "bg-violeta text-white" : "text-texto-muted hover:text-white"} transition-colors`}>{t.lang_es}</button>
              <button onClick={() => setLang("fr")} className={`px-2 py-1 ${lang === "fr" ? "bg-violeta text-white" : "text-texto-muted hover:text-white"} transition-colors`}>{t.lang_fr}</button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#15131F_0%,_#0A0A0F_70%)]" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 py-20">
            <div className="radar-container shrink-0" role="img" aria-label="Escáner de negocios sin web">
              <div className="radar-circle" /><div className="radar-circle" /><div className="radar-circle" /><div className="radar-circle" />
              <div className="radar-grid" /><div className="radar-sweep" /><div className="radar-dot" /><div className="radar-dot" /><div className="radar-dot" />
              <div className="radar-dot" /><div className="radar-dot" /><div className="radar-dot" /><div className="radar-dot" /><div className="radar-center" />
            </div>
            <div className="text-center lg:text-left max-w-xl">
              <p className="text-neon text-sm font-medium tracking-widest uppercase mb-4">{t.hero_tag}</p>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                {t.hero_title_1} <span className="text-violeta">{t.hero_title_2}</span>{t.hero_title_3}
              </h1>
              <p className="text-texto-muted text-lg leading-relaxed mb-8">{t.hero_desc}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#casos" className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-violeta text-white font-medium hover:bg-violeta/90 transition-colors">{t.hero_cta_1}</a>
                <a href="#contacto" className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-noir-border text-texto-muted font-medium hover:border-violeta hover:text-violeta transition-colors">{t.hero_cta_2}</a>
              </div>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-texto-muted text-xs animate-bounce">
            <span>{t.scroll_hint}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
        </section>

        <section id="como-funciona" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center mb-16">{t.how_title_1} <span className="text-violeta">{t.how_title_2}</span>{t.how_title_3}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { paso: "01", titulo_es: "Escaneamos el mapa", titulo_fr: "Nous scannons la carte", desc_es: "Rastreamos negocios locales sin web en España y Marruecos. Detectamos su ubicación, categoría y potencial digital.", desc_fr: "Nous repérons les commerces locaux sans site web en Espagne et au Maroc. Nous détectons leur emplacement, catégorie et potentiel numérique." },
                { paso: "02", titulo_es: "Creamos su web", titulo_fr: "Nous créons leur site", desc_es: "Diseñamos y construimos una web profesional adaptada a su negocio. Moderna, rápida y lista para atraer clientes.", desc_fr: "Nous concevons et construisons un site web professionnel adapté à leur activité. Moderne, rapide et prêt à attirer des clients." },
                { paso: "03", titulo_es: "Les contactamos", titulo_fr: "Nous les contactons", desc_es: "Enviamos un email mostrando la web ya creada. Solo tienen que decir sí. Nosotros hacemos el resto.", desc_fr: "Nous envoyons un email présentant le site déjà créé. Ils n'ont qu'à dire oui. Nous faisons le reste." },
              ].map((item) => (
                <div key={item.paso} className="p-8 rounded-xl border border-noir-border bg-noir-surface hover:border-violeta/50 transition-colors group">
                  <span className="font-heading text-4xl font-bold text-violeta/30 group-hover:text-violeta/60 transition-colors">{item.paso}</span>
                  <h3 className="font-heading text-xl font-semibold mt-4 mb-3">{lang === "es" ? item.titulo_es : item.titulo_fr}</h3>
                  <p className="text-texto-muted leading-relaxed">{lang === "es" ? item.desc_es : item.desc_fr}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="casos" className="py-24 px-6 border-t border-noir-border/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center mb-4">{t.portfolio_title_1} <span className="text-violeta">{t.portfolio_title_2}</span></h2>
            <p className="text-texto-muted text-center max-w-xl mx-auto mb-16">{t.portfolio_desc}</p>
            <div className="grid md:grid-cols-3 gap-6">
              {portfolioCases.map((caso) => (
                <article key={caso.negocio} className="rounded-xl border border-noir-border bg-noir-surface overflow-hidden group">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-medium text-neon uppercase tracking-wider">{lang === "es" ? caso.categoria : caso.categoria_fr}</span>
                        <h3 className="font-heading text-lg font-semibold mt-1">{caso.negocio}</h3>
                        <p className="text-xs text-texto-muted">{lang === "es" ? caso.ubicacion_es : caso.ubicacion_fr}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded border border-noir-border text-texto-muted">{caso.pais === "ES" ? "🇪🇸 ES" : "🇲🇦 MA"}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30">
                        <p className="text-xs font-medium text-red-400 mb-1">{t.portfolio_before}</p>
                        <p className="text-sm text-texto-muted">{lang === "es" ? caso.antes_es : caso.antes_fr}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-neon/5 border border-neon/20">
                        <p className="text-xs font-medium text-neon mb-1">{t.portfolio_after}</p>
                        <p className="text-sm text-texto">{lang === "es" ? caso.despues_es : caso.despues_fr}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="h-px bg-noir-border/50 mb-4" />
                    <div className="flex items-center gap-2 text-xs text-violeta">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      <span>{t.portfolio_tag}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="py-24 px-6 border-t border-noir-border/50">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center mb-4">{t.contact_title}</h2>
            <p className="text-texto-muted text-center mb-12">{t.contact_desc}</p>
            {enviado ? (
              <div className="p-8 rounded-xl border border-neon/30 bg-neon/5 text-center">
                <p className="text-neon font-semibold text-lg mb-2">{t.contact_thanks}</p>
                <p className="text-texto-muted">{t.contact_thanks_desc}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-texto-muted mb-2">{t.form_name}</label>
                    <input id="nombre" type="text" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-noir-surface border border-noir-border text-texto placeholder:text-texto-muted/50 focus:border-violeta focus:ring-1 focus:ring-violeta transition-colors" placeholder={t.form_name_ph} />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-texto-muted mb-2">{t.form_email}</label>
                    <input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-noir-surface border border-noir-border text-texto placeholder:text-texto-muted/50 focus:border-violeta focus:ring-1 focus:ring-violeta transition-colors" placeholder={t.form_email_ph} />
                  </div>
                </div>
                <div>
                  <label htmlFor="negocio" className="block text-sm font-medium text-texto-muted mb-2">{t.form_business}</label>
                  <input id="negocio" type="text" required value={form.negocio} onChange={(e) => setForm({ ...form, negocio: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-noir-surface border border-noir-border text-texto placeholder:text-texto-muted/50 focus:border-violeta focus:ring-1 focus:ring-violeta transition-colors" placeholder={t.form_business_ph} />
                </div>
                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-texto-muted mb-2">{t.form_info}</label>
                  <textarea id="mensaje" rows={4} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-noir-surface border border-noir-border text-texto placeholder:text-texto-muted/50 focus:border-violeta focus:ring-1 focus:ring-violeta transition-colors resize-none" placeholder={t.form_info_ph} />
                </div>
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button type="submit" disabled={enviando} className="w-full py-3 px-8 rounded-lg bg-violeta text-white font-medium hover:bg-violeta/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violeta disabled:opacity-50 disabled:cursor-not-allowed">{enviando ? t.form_sending : t.form_submit}</button>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-noir-border/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-heading text-sm font-bold text-violeta">NOIRA</span>
          <div className="flex gap-4 text-xs text-texto-muted">
            <a href="/terminos" className="hover:text-violeta transition-colors">Términos</a>
            <a href="/privacidad" className="hover:text-violeta transition-colors">Privacidad</a>
          </div>
          <p className="text-xs text-texto-muted">&copy; {new Date().getFullYear()} NOIRA. {t.footer}</p>
        </div>
      </footer>
    </>
  )
}
