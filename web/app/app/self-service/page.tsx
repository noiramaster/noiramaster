"use client"

import { useState, useEffect } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { SessionProvider } from "next-auth/react"

function SelfServiceInner() {
  const { data: session, status } = useSession()
  const [step, setStep] = useState<"loading" | "login" | "key" | "form" | "done">("loading")
  const [hasKey, setHasKey] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [keyError, setKeyError] = useState("")
  const [keySaving, setKeySaving] = useState(false)
  const [form, setForm] = useState({ nombre: "", categoria: "generico", descripcion: "", telefono: "", idioma: "es" })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [genError, setGenError] = useState("")
  const [rateLimit, setRateLimit] = useState<any>(null)
  const [myWebs, setMyWebs] = useState<any[]>([])

  useEffect(() => {
    if (status === "loading") return
    if (!session) { setStep("login"); return }
    fetch("/api/self-service/key").then(r => r.json()).then(d => {
      setHasKey(d.hasKey)
      setStep(d.hasKey ? "form" : "key")
      if (d.hasKey) loadMyWebs()
    })
  }, [status, session])

  function loadMyWebs() {
    fetch("/api/self-service/generate").then(r => r.json()).then(setMyWebs)
  }

  async function handleSaveKey() {
    setKeyError("")
    if (!apiKey.startsWith("gsk_")) { setKeyError("La clave debe empezar por gsk_"); return }
    setKeySaving(true)
    const res = await fetch("/api/self-service/key", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey })
    })
    const data = await res.json()
    setKeySaving(false)
    if (!res.ok) { setKeyError(data.error); return }
    setHasKey(true)
    setStep("form")
    loadMyWebs()
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    setGenError("")
    setRateLimit(null)
    const res = await fetch("/api/self-service/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setGenerating(false)
    if (!res.ok) { setGenError(data.error); if (data.rateLimit) setRateLimit(data.rateLimit); return }
    setResult(data)
    setRateLimit(data.rateLimit)
    setStep("done")
    loadMyWebs()
  }

  function formatCountdown(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return "Expirada"
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    return `${h}h ${m}m`
  }

  if (status === "loading" || step === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-black text-[#e0e0e0]"><p className="font-mono text-sm">Cargando...</p></div>
  }

  if (step === "login") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-[#e0e0e0] p-6">
        <h1 className="font-heading text-3xl font-bold mb-2" style={{ color: '#39ff14' }}>&gt; NOIRA Self-Service</h1>
        <p className="text-[#666] mb-8 text-center max-w-md">Crea tu web profesional en 2 minutos. Solo necesitas una cuenta gratis de Groq.</p>
        <button onClick={() => signIn("google")} className="flex items-center gap-3 px-6 py-3 rounded-lg border border-[#222] hover:border-[#39ff14] transition-colors bg-[#111]">
          <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continúa con Google
        </button>
      </div>
    )
  }

  if (step === "key") {
    return (
      <div className="min-h-screen bg-black text-[#e0e0e0] p-6">
        <div className="max-w-lg mx-auto pt-12">
          <h1 className="font-heading text-2xl font-bold mb-6" style={{ color: '#39ff14' }}>Conecta tu API de Groq</h1>
          <div className="space-y-6">
            <div className="p-4 rounded-lg border border-[#222] bg-[#111]">
              <h2 className="font-semibold mb-2">Paso 1: Consigue tu clave gratis</h2>
              <ol className="text-sm text-[#666] space-y-1 list-decimal list-inside">
                <li>Ve a <a href="https://console.groq.com/keys" target="_blank" className="text-[#39ff14] underline">console.groq.com/keys</a></li>
                <li>Inicia sesión con tu cuenta de Google</li>
                <li>Haz clic en "Create API Key"</li>
                <li>Copia el código que empieza por <code className="text-[#39ff14]">gsk_</code></li>
              </ol>
            </div>
            <div className="p-4 rounded-lg border border-[#222] bg-[#111]">
              <h2 className="font-semibold mb-2">Paso 2: Pega tu clave aquí</h2>
              <input
                type="text" value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#222] text-[#e0e0e0] placeholder:text-[#666] focus:border-[#39ff14] focus:ring-1 focus:ring-[#39ff14] transition-colors mt-3 font-mono text-sm"
              />
              {keyError && <p className="text-red-400 text-sm mt-2">{keyError}</p>}
              <button onClick={handleSaveKey} disabled={keySaving || !apiKey}
                className="mt-4 w-full py-3 px-8 rounded-lg font-medium transition-colors disabled:opacity-50"
                style={{ background: '#39ff14', color: '#000' }}>
                {keySaving ? "Verificando..." : "Conectar clave"}
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
            <h1 className="font-heading text-2xl font-bold" style={{ color: '#39ff14' }}>Crear mi web</h1>
            <button onClick={() => signOut()} className="text-xs text-[#666] hover:text-[#e0e0e0] transition-colors">Cerrar sesión</button>
          </div>

          {rateLimit && (
            <div className="mb-4 p-3 rounded-lg border border-[#222] bg-[#111] text-sm text-center" style={{ color: '#39ff14' }}>
              Te quedan {rateLimit.remaining} intentos hoy
            </div>
          )}

          {pendingWebs.length > 0 && (
            <div className="mb-6 p-4 rounded-lg border border-[#39ff14]/30 bg-[#111]">
              <p className="text-sm font-medium mb-2" style={{ color: '#39ff14' }}>Tienes {pendingWebs.length} demo(s) activa(s):</p>
              {pendingWebs.map((w: any) => (
                <div key={w.id} className="flex justify-between items-center py-2 border-b border-[#222] last:border-0">
                  <span className="text-sm">{w.nombre_negocio}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#666]">{formatCountdown(w.fecha_caducidad)}</span>
                    <a href={w.url_demo} target="_blank" className="text-xs underline" style={{ color: '#39ff14' }}>Ver</a>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#666] mb-1">Nombre del negocio *</label>
              <input type="text" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#222] text-[#e0e0e0] placeholder:text-[#666] focus:border-[#39ff14] transition-colors"
                placeholder="p. ej. Panadería San Miguel" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#666] mb-1">Categoría *</label>
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
              <label className="block text-sm font-medium text-[#666] mb-1">Descripción (opcional)</label>
              <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={3}
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#222] text-[#e0e0e0] placeholder:text-[#666] focus:border-[#39ff14] transition-colors resize-none"
                placeholder="Breve descripción de tu negocio..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#666] mb-1">Teléfono / WhatsApp (opcional)</label>
              <input type="text" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#222] text-[#e0e0e0] placeholder:text-[#666] focus:border-[#39ff14] transition-colors"
                placeholder="+34 612 345 678" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#666] mb-1">Idioma</label>
              <select value={form.idioma} onChange={e => setForm({ ...form, idioma: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-black border border-[#222] text-[#e0e0e0] focus:border-[#39ff14] transition-colors">
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            {genError && <p className="text-red-400 text-sm text-center">{genError}</p>}
            <button type="submit" disabled={generating}
              className="w-full py-3 px-8 rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ background: '#39ff14', color: '#000' }}>
              {generating ? "Generando web..." : "Generar mi web gratis"}
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
          <h1 className="font-heading text-2xl font-bold mb-4" style={{ color: '#39ff14' }}>¡Web generada!</h1>
          <p className="text-[#666] mb-6">Tu web está lista para ver. Tienes <strong className="text-[#e0e0e0]">{formatCountdown(result.expiraEn)}</strong> para decidir.</p>
          <a href={result.url} target="_blank"
            className="inline-block px-8 py-3 rounded-lg font-medium mb-4"
            style={{ background: '#39ff14', color: '#000' }}>
            Ver mi web
          </a>
          <div className="p-4 rounded-lg border border-[#222] bg-[#111] text-left text-sm space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <span className="text-[#666]">Precio</span>
              <span className="font-semibold">19€/mes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#666]">Estado</span>
              <span style={{ color: '#39ff14' }}>Demo — {formatCountdown(result.expiraEn)} restantes</span>
            </div>
            {rateLimit && (
              <div className="flex items-center justify-between">
                <span className="text-[#666]">Intentos Groq hoy</span>
                <span style={{ color: '#39ff14' }}>{rateLimit.remaining} restantes</span>
              </div>
            )}
          </div>
          <div className="mt-8 space-y-3">
            <button
              className="w-full py-3 px-8 rounded-lg font-medium transition-colors"
              style={{ background: '#39ff14', color: '#000' }}>
              Pagar 19€/mes — Publicar para siempre
            </button>
            <button onClick={() => { setResult(null); setStep("form") }}
              className="w-full py-3 px-8 rounded-lg border border-[#222] text-[#666] hover:text-[#e0e0e0] transition-colors">
              o descartar (se borrará sola en 24h)
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
