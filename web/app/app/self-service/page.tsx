"use client"

import { useState, useEffect, useRef } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { SessionProvider } from "next-auth/react"

const LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "es", label: "ES", name: "Español" },
  { code: "pt", label: "PT", name: "Português" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "it", label: "IT", name: "Italiano" },
  { code: "ar", label: "AR", name: "العربية" },
]

const T = {
  en: { title: "NOIRA Self-Service", subtitle: "Create your professional website in 2 minutes. You only need a free Groq account.", login: "Continue with Google", key_title: "Connect your Groq API", key_step1: "Step 1: Get your free key", key_step1_1: "Go to console.groq.com/keys", key_step1_2: "Sign in with your Google account", key_step1_3: 'Click "Create API Key"', key_step1_4: "Copy the code starting with gsk_", key_step2: "Step 2: Paste your key here", key_placeholder: "gsk_...", key_btn: "Connect key", key_verifying: "Verifying...", form_title: "Create my website", logout: "Sign out", remaining: "You have {n} attempts today", active_demos: "You have {n} demo(s) active:", view: "View", name_label: "Business name *", name_ph: "e.g. San Miguel Bakery", category_label: "Category *", desc_label: "Description (optional)", desc_ph: "Brief description of your business...", phone_label: "Phone / WhatsApp (optional)", phone_ph: "+34 612 345 678", lang_label: "Website language(s)", lang_hint: "Choose 1 or more languages for your site", submit: "Generate my free website", generating: "Generating website...", done_title: "Website generated!", done_desc: "Your website is ready. You have {t} to decide.", view_site: "View my website", price: "Price", status: "Status", demo: "Demo", remaining_groq: "Groq attempts today", pay_btn: "Pay €19/month — Publish forever", discard: "or discard (it will auto-delete in 24h)", loading: "Loading...", expires: "Expired", close: "Close", },
  es: { title: "NOIRA Self-Service", subtitle: "Crea tu web profesional en 2 minutos. Solo necesitas una cuenta gratis de Groq.", login: "Continúa con Google", key_title: "Conecta tu API de Groq", key_step1: "Paso 1: Consigue tu clave gratis", key_step1_1: "Ve a console.groq.com/keys", key_step1_2: "Inicia sesión con tu cuenta de Google", key_step1_3: 'Haz clic en "Create API Key"', key_step1_4: "Copia el código que empieza por gsk_", key_step2: "Paso 2: Pega tu clave aquí", key_placeholder: "gsk_...", key_btn: "Conectar clave", key_verifying: "Verificando...", form_title: "Crear mi web", logout: "Cerrar sesión", remaining: "Te quedan {n} intentos hoy", active_demos: "Tienes {n} demo(s) activa(s):", view: "Ver", name_label: "Nombre del negocio *", name_ph: "p. ej. Panadería San Miguel", category_label: "Categoría *", desc_label: "Descripción (opcional)", desc_ph: "Breve descripción de tu negocio...", phone_label: "Teléfono / WhatsApp (opcional)", phone_ph: "+34 612 345 678", lang_label: "Idioma(s) de la web", lang_hint: "Elige 1 o más idiomas para tu web", submit: "Generar mi web gratis", generating: "Generando web...", done_title: "¡Web generada!", done_desc: "Tu web está lista. Tienes {t} para decidir.", view_site: "Ver mi web", price: "Precio", status: "Estado", demo: "Demo", remaining_groq: "Intentos Groq hoy", pay_btn: "Pagar 19€/mes — Publicar para siempre", discard: "o descartar (se borrará sola en 24h)", loading: "Cargando...", expires: "Expirada", close: "Cerrar", },
  fr: { title: "NOIRA Self-Service", subtitle: "Créez votre site pro en 2 minutes. Il vous suffit d'un compte Groq gratuit.", login: "Continuer avec Google", key_title: "Connectez votre API Groq", key_step1: "Étape 1: Obtenez votre clé gratuite", key_step1_1: "Allez sur console.groq.com/keys", key_step1_2: "Connectez-vous avec Google", key_step1_3: 'Cliquez sur "Create API Key"', key_step1_4: "Copiez le code commençant par gsk_", key_step2: "Étape 2: Collez votre clé ici", key_placeholder: "gsk_...", key_btn: "Connecter la clé", key_verifying: "Vérification...", form_title: "Créer mon site", logout: "Déconnexion", remaining: "Il vous reste {n} tentatives aujourd'hui", active_demos: "Vous avez {n} démo(s) active(s):", view: "Voir", name_label: "Nom de l'entreprise *", name_ph: "ex. Boulangerie Saint-Michel", category_label: "Catégorie *", desc_label: "Description (optionnelle)", desc_ph: "Brève description...", phone_label: "Téléphone / WhatsApp (optionnel)", phone_ph: "+33 6 12 34 56 78", lang_label: "Langue(s) du site", lang_hint: "Choisissez 1 ou plusieurs langues", submit: "Générer mon site gratuit", generating: "Génération...", done_title: "Site généré !", done_desc: "Votre site est prêt. Vous avez {t} pour décider.", view_site: "Voir mon site", price: "Prix", status: "Statut", demo: "Démo", remaining_groq: "Tentatives Groq aujourd'hui", pay_btn: "Payer 19€/mois — Publier pour toujours", discard: "ou ignorer (supprimé dans 24h)", loading: "Chargement...", expires: "Expirée", close: "Fermer", },
  pt: { title: "NOIRA Self-Service", subtitle: "Crie seu site profissional em 2 minutos. Só precisa de uma conta Groq grátis.", login: "Continuar com Google", key_title: "Conecte sua API Groq", key_step1: "Passo 1: Obtenha sua chave grátis", key_step1_1: "Acesse console.groq.com/keys", key_step1_2: "Faça login com sua conta Google", key_step1_3: 'Clique em "Create API Key"', key_step1_4: "Copie o código que começa com gsk_", key_step2: "Passo 2: Cole sua chave aqui", key_placeholder: "gsk_...", key_btn: "Conectar chave", key_verifying: "Verificando...", form_title: "Criar meu site", logout: "Sair", remaining: "Você tem {n} tentativas hoje", active_demos: "Você tem {n} demo(s) ativa(s):", view: "Ver", name_label: "Nome do negócio *", name_ph: "ex. Padaria São Miguel", category_label: "Categoria *", desc_label: "Descrição (opcional)", desc_ph: "Breve descrição...", phone_label: "Telefone / WhatsApp (opcional)", phone_ph: "+55 11 99999-9999", lang_label: "Idioma(s) do site", lang_hint: "Escolha 1 ou mais idiomas", submit: "Gerar meu site grátis", generating: "Gerando...", done_title: "Site gerado!", done_desc: "Seu site está pronto. Você tem {t} para decidir.", view_site: "Ver meu site", price: "Preço", status: "Status", demo: "Demo", remaining_groq: "Tentativas Groq hoje", pay_btn: "Pagar €19/mês — Publicar para sempre", discard: "ou descartar (auto-delete em 24h)", loading: "Carregando...", expires: "Expirada", close: "Fechar", },
  de: { title: "NOIRA Self-Service", subtitle: "Erstellen Sie Ihre Website in 2 Minuten. Sie brauchen nur ein kostenloses Groq-Konto.", login: "Weiter mit Google", key_title: "Verbinden Sie Ihre Groq-API", key_step1: "Schritt 1: Holen Sie sich Ihren kostenlosen Schlüssel", key_step1_1: "Gehen Sie zu console.groq.com/keys", key_step1_2: "Melden Sie sich mit Google an", key_step1_3: 'Klicken Sie auf "Create API Key"', key_step1_4: "Kopieren Sie den Code, der mit gsk_ beginnt", key_step2: "Schritt 2: Fügen Sie Ihren Schlüssel ein", key_placeholder: "gsk_...", key_btn: "Schlüssel verbinden", key_verifying: "Prüfe...", form_title: "Meine Website erstellen", logout: "Abmelden", remaining: "Sie haben {n} Versuche heute", active_demos: "Sie haben {n} Demo(s) aktiv:", view: "Ansehen", name_label: "Unternehmensname *", name_ph: "z.B. Bäckerei Schmidt", category_label: "Kategorie *", desc_label: "Beschreibung (optional)", desc_ph: "Kurze Beschreibung...", phone_label: "Telefon / WhatsApp (optional)", phone_ph: "+49 123 456789", lang_label: "Sprache(n) der Website", lang_hint: "Wählen Sie 1 oder mehrere Sprachen", submit: "Kostenlose Website erstellen", generating: "Erstelle...", done_title: "Website erstellt!", done_desc: "Ihre Website ist bereit. Sie haben {t} Zeit.", view_site: "Meine Website ansehen", price: "Preis", status: "Status", demo: "Demo", remaining_groq: "Groq-Versuche heute", pay_btn: "€19/Monat zahlen — Für immer veröffentlichen", discard: "oder verwerfen (automatische Löschung in 24h)", loading: "Lade...", expires: "Abgelaufen", close: "Schließen", },
  it: { title: "NOIRA Self-Service", subtitle: "Crea il tuo sito professionale in 2 minuti. Ti serve solo un account Groq gratuito.", login: "Continua con Google", key_title: "Connetti la tua API Groq", key_step1: "Passo 1: Ottieni la tua chiave gratuita", key_step1_1: "Vai su console.groq.com/keys", key_step1_2: "Accedi con il tuo account Google", key_step1_3: 'Clicca su "Create API Key"', key_step1_4: "Copia il codice che inizia con gsk_", key_step2: "Passo 2: Incolla la chiave qui", key_placeholder: "gsk_...", key_btn: "Connetti chiave", key_verifying: "Verifico...", form_title: "Crea il mio sito", logout: "Esci", remaining: "Hai {n} tentativi oggi", active_demos: "Hai {n} demo attive:", view: "Vedi", name_label: "Nome attività *", name_ph: "es. Panetteria San Marco", category_label: "Categoria *", desc_label: "Descrizione (opzionale)", desc_ph: "Breve descrizione...", phone_label: "Telefono / WhatsApp (opzionale)", phone_ph: "+39 123 4567890", lang_label: "Lingua/e del sito", lang_hint: "Scegli 1 o più lingue", submit: "Genera il mio sito gratis", generating: "Genero...", done_title: "Sito generato!", done_desc: "Il tuo sito è pronto. Hai {t} per decidere.", view_site: "Vedi il mio sito", price: "Prezzo", status: "Stato", demo: "Demo", remaining_groq: "Tentativi Groq oggi", pay_btn: "Paga €19/mese — Pubblica per sempre", discard: "o scarta (auto-eliminazione in 24h)", loading: "Carico...", expires: "Scaduto", close: "Chiudi", },
  ar: { title: "NOIRA Self-Service", subtitle: "أنشئ موقعك الإلكتروني الاحترافي في دقيقتين. كل ما تحتاجه هو حساب Groq مجاني.", login: "المتابعة مع Google", key_title: "Connect your Groq API", key_step1: "Passo 1: Get your free key", key_step1_1: "Go to console.groq.com/keys", key_step1_2: "Sign in with Google", key_step1_3: 'Click "Create API Key"', key_step1_4: "Copy the gsk_ code", key_step2: "Passo 2: Paste your key", key_placeholder: "gsk_...", key_btn: "Connect", key_verifying: "Verifying...", form_title: "Create my website", logout: "Logout", remaining: "You have {n} attempts today", active_demos: "You have {n} demo(s) active:", view: "View", name_label: "Business name *", name_ph: "e.g. San Miguel Bakery", category_label: "Category *", desc_label: "Description (optional)", desc_ph: "Brief description...", phone_label: "Phone / WhatsApp (optional)", phone_ph: "+34 612 345 678", lang_label: "Website language(s)", lang_hint: "Choose 1 or more languages", submit: "Generate my free website", generating: "Generating...", done_title: "Website generated!", done_desc: "Your website is ready. You have {t} to decide.", view_site: "View my website", price: "Price", status: "Status", demo: "Demo", remaining_groq: "Groq attempts today", pay_btn: "Pay €19/month — Publish forever", discard: "or discard (auto-delete in 24h)", loading: "Loading...", expires: "Expired", close: "Close", },
}

function SelfServiceInner() {
  const { data: session, status } = useSession()
  const [lang, setLang] = useState("en")
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef<HTMLDivElement>(null)
  const langCodes = LANGS.map(l => l.code)
  const [step, setStep] = useState<"loading" | "login" | "key" | "form" | "done">("loading")
  const [hasKey, setHasKey] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [keyError, setKeyError] = useState("")
  const [keySaving, setKeySaving] = useState(false)
  const [form, setForm] = useState({ nombre: "", categoria: "generico", descripcion: "", telefono: "", idiomas: ["es"] })

  useEffect(() => {
    const saved = localStorage.getItem("noira_ss_lang")
    if (saved && langCodes.includes(saved)) { setLang(saved); return }
    const accept = navigator.language || ""
    const matched = langCodes.find(c => accept.startsWith(c))
    setLang(matched || "en")
  }, [])

  useEffect(() => { localStorage.setItem("noira_ss_lang", lang) }, [lang])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const t = T[lang as keyof typeof T] || T.en
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [genError, setGenError] = useState("")
  const [rateLimit, setRateLimit] = useState<any>(null)
  const [myWebs, setMyWebs] = useState<any[]>([])

  useEffect(() => {
    if (status === "loading") return
    if (!session) { setStep("login"); return }
    fetch("/api/self-service/key").then(r => r.text()).then(text => {
      try {
        const d = JSON.parse(text)
        setHasKey(d.hasKey)
        setStep(d.hasKey ? "form" : "key")
        if (d.hasKey) loadMyWebs()
      } catch {
        setStep("key")
      }
    }).catch(() => setStep("key"))
  }, [status, session])

  function loadMyWebs() {
    fetch("/api/self-service/generate").then(r => r.text()).then(text => {
      try { setMyWebs(JSON.parse(text)) } catch {}
    }).catch(() => {})
  }

  async function handleSaveKey() {
    setKeyError("")
    if (!apiKey.startsWith("gsk_")) { setKeyError("La clave debe empezar por gsk_"); return }
    setKeySaving(true)
    try {
      const res = await fetch("/api/self-service/key", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey })
      })
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch { throw new Error('Respuesta inválida del servidor: ' + text.substring(0, 100)) }
      setKeySaving(false)
      if (!res.ok) { setKeyError(data.error || 'Error del servidor'); return }
      setHasKey(true)
      setStep("form")
      loadMyWebs()
    } catch (err: any) {
      setKeySaving(false)
      console.error('[handleSaveKey]', err?.stack || err?.message || JSON.stringify(err))
      setKeyError(err.message || 'Error al conectar con el servidor')
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    setGenError("")
    setRateLimit(null)
    try {
      const res = await fetch("/api/self-service/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch { throw new Error('Respuesta inválida del servidor: ' + text.substring(0, 100)) }
      setGenerating(false)
      if (!res.ok) { setGenError(data.error); if (data.rateLimit) setRateLimit(data.rateLimit); return }
      setResult(data)
      setRateLimit(data.rateLimit)
      setStep("done")
      loadMyWebs()
    } catch (err: any) {
      setGenerating(false)
      setGenError(err.message || 'Error al conectar con el servidor')
    }
  }

  function formatCountdown(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return t.expires
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return `${h}h ${m}m`
  }

  if (status === "loading" || step === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-black text-[#e0e0e0]"><p className="font-mono text-sm">{t.loading}</p></div>
  }

  if (step === "login") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#e0e0e0] p-6">
        <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: '#39ff14' }}>&gt; {t.title}</h1>
        <p className="text-[#666] mb-8 text-center max-w-md">{t.subtitle}</p>
        <button onClick={() => signIn("google")} className="flex items-center gap-3 px-6 py-3 rounded-lg border border-[#222] hover:border-[#39ff14] transition-colors bg-[#111]">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t.login}
        </button>
      </div>
    )
  }

  if (step === "key") {
    return (
      <div className="min-h-screen bg-black text-[#e0e0e0] p-6">
        <div className="max-w-lg mx-auto pt-12">
          <h1 className="font-heading text-2xl font-bold mb-6" style={{ color: '#39ff14' }}>{t.key_title}</h1>
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-[#222] bg-[#111]">
              <h2 className="font-semibold mb-2">{t.key_step1}</h2>
              <ol className="text-sm text-[#666] space-y-1 list-decimal list-inside">
                <li>{t.key_step1_1}: <a href="https://console.groq.com/keys" target="_blank" className="text-[#39ff14] underline">console.groq.com/keys</a></li>
                <li>{t.key_step1_2}</li>
                <li>{t.key_step1_3}</li>
                <li>{t.key_step1_4}: <code className="text-[#39ff14]">gsk_</code></li>
              </ol>
            </div>
            <div className="p-4 rounded-lg border border-[#222] bg-[#111]">
              <h2 className="font-semibold mb-2">{t.key_step2}</h2>
              <input
                type="text" value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder={t.key_placeholder}
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#222] text-[#e0e0e0] placeholder:text-[#666] focus:border-[#39ff14] focus:ring-1 focus:ring-[#39ff14] transition-colors mt-3 font-mono text-sm"
              />
              {keyError && <p className="text-red-400 text-sm mt-2">{keyError}</p>}
              <button onClick={handleSaveKey} disabled={keySaving || !apiKey}
                className="mt-4 w-full py-3 px-8 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{ background: '#39ff14', color: '#000' }}>
                {keySaving ? t.key_verifying : t.key_btn}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === "form") {
    const pendingWebs = myWebs.filter(w => w.estado_pago === 'demo' && new Date(w.fecha_caducidad) > new Date())
    return (
      <div className="min-h-screen bg-black text-[#e0e0e0] p-6">
        <div className="max-w-lg mx-auto pt-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h1 className="font-heading text-2xl font-bold" style={{ color: '#39ff14' }}>{t.form_title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative font-mono text-xs" ref={langRef}>
                <button onClick={() => setLangOpen(!langOpen)} className="text-[#666] hover:text-[#e0e0e0] transition-colors cursor-pointer px-2 py-1 border border-[#222] rounded">
                  [{LANGS.find(l => l.code === lang)?.label || "EN"} ▾]
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-[#111] border border-[#222] rounded-lg shadow-lg z-50 py-1">
                    {LANGS.map(l => (
                      <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false) }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#222] transition-colors ${lang === l.code ? "text-[#39ff14]" : "text-[#666]"}`}>
                        [{l.label}] {l.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => signOut()} className="text-xs text-[#666] hover:text-[#e0e0e0] transition-colors">{t.logout}</button>
            </div>
          </div>

          {rateLimit && (
            <div className="mb-4 p-3 rounded-lg border border-[#222] bg-[#111] text-sm text-center" style={{ color: '#39ff14' }}>
              {t.remaining.replace("{n}", String(rateLimit.remaining))}
            </div>
          )}

          {pendingWebs.length > 0 && (
            <div className="mb-6 p-4 rounded-lg border border-[#39ff14]/30 bg-[#111]">
              <p className="text-sm font-medium mb-2" style={{ color: '#39ff14' }}>{t.active_demos.replace("{n}", String(pendingWebs.length))}</p>
              {pendingWebs.map((w: any) => (
                <div key={w.id} className="flex justify-between items-center py-2 border-b border-[#222] last:border-0">
                  <span className="text-sm">{w.nombre_negocio}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#666]">{formatCountdown(w.fecha_caducidad)}</span>
                    <a href={w.url_demo} target="_blank" className="text-xs underline" style={{ color: '#39ff14' }}>{t.view}</a>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#666] mb-1">{t.name_label}</label>
              <input type="text" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#222] text-[#e0e0e0] placeholder:text-[#666] focus:border-[#39ff14] transition-colors"
                placeholder={t.name_ph} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#666] mb-1">{t.category_label}</label>
              <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#222] text-[#e0e0e0] focus:border-[#39ff14] transition-colors">
                <option value="restaurante">Restaurante</option>
                <option value="peluqueria">Peluquería</option>
                <option value="abogado">Abogado / Notaría</option>
                <option value="gimnasio">Gimnasio / Deporte</option>
                <option value="taller">Taller / Mecánico</option>
                <option value="clinica">Clínica / Salud</option>
                <option value="tienda">Tienda / Retail</option>
                <option value="generico">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#666] mb-1">{t.desc_label}</label>
              <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={3}
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#222] text-[#e0e0e0] placeholder:text-[#666] focus:border-[#39ff14] transition-colors resize-none"
                placeholder={t.desc_ph} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#666] mb-1">{t.phone_label}</label>
              <input type="text" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#222] text-[#e0e0e0] placeholder:text-[#666] focus:border-[#39ff14] transition-colors"
                placeholder={t.phone_ph} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#666] mb-1">{t.lang_label}</label>
              <div className="text-xs text-[#666] mb-2">{t.lang_hint}</div>
              <div className="flex flex-wrap gap-2">
                {LANGS.map(l => {
                  const selected = form.idiomas.includes(l.code)
                  return (
                    <button key={l.code} type="button" onClick={() => {
                      if (selected && form.idiomas.length > 1) {
                        setForm({ ...form, idiomas: form.idiomas.filter(c => c !== l.code) })
                      } else if (!selected) {
                        setForm({ ...form, idiomas: [...form.idiomas, l.code] })
                      }
                    }}
                      className={`px-3 py-1.5 rounded text-xs font-mono border transition-colors ${selected ? 'border-[#39ff14] text-[#39ff14] bg-[#39ff14]/10' : 'border-[#222] text-[#666] hover:border-[#39ff14]'}`}>
                      {l.label}
                    </button>
                  )
                })}
              </div>
            </div>
            {genError && <p className="text-red-400 text-sm text-center">{genError}</p>}
            <button type="submit" disabled={generating}
              className="w-full py-3 px-8 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ background: '#39ff14', color: '#000' }}>
              {generating ? t.generating : t.submit}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (step === "done" && result) {
    return (
      <div className="min-h-screen bg-black text-[#e0e0e0] p-6">
        <div className="max-w-lg mx-auto pt-12 text-center">
          <h1 className="font-heading text-2xl font-bold mb-4" style={{ color: '#39ff14' }}>{t.done_title}</h1>
          <p className="text-[#666] mb-6">{t.done_desc.replace("{t}", formatCountdown(result.expiraEn))}</p>
          <a href={result.url} target="_blank"
            className="inline-block px-8 py-3 rounded-lg font-medium mb-4"
            style={{ background: '#39ff14', color: '#000' }}>
            {t.view_site}
          </a>
          <div className="p-4 rounded-lg border border-[#222] bg-[#111] text-left text-sm space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-[#666]">{t.price}</span>
              <span className="font-semibold">19€/mes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#666]">{t.status}</span>
              <span style={{ color: '#39ff14' }}>{t.demo} — {formatCountdown(result.expiraEn)}</span>
            </div>
            {rateLimit && (
              <div className="flex items-center justify-between">
                <span className="text-[#666]">{t.remaining_groq}</span>
                <span style={{ color: '#39ff14' }}>{rateLimit.remaining}</span>
              </div>
            )}
          </div>
          <div className="mt-8 space-y-3">
            <button
              className="w-full py-3 px-8 rounded-lg font-medium transition-colors"
              style={{ background: '#39ff14', color: '#000' }}>
              {t.pay_btn}
            </button>
            <button onClick={() => { setResult(null); setStep("form") }}
              className="w-full py-3 px-8 rounded-lg border border-[#222] text-[#666] hover:text-[#e0e0e0] transition-colors">
              {t.discard}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function SelfServicePage() {
  return <SessionProvider><SelfServiceInner /></SessionProvider>
}
