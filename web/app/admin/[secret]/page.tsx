"use client"

import { useEffect, useState, useCallback } from 'react'

interface WebItem {
  id: string
  lead_id: string
  url_demo: string
  estado: string
  created_at: string
  leads: { nombre_negocio: string; categoria: string; ubicacion: string; pais: string }
}

interface EmailItem {
  id: string
  lead_id: string
  asunto: string
  cuerpo: string
  estado: string
  fecha_enviado: string
  created_at: string
  leads: { nombre_negocio: string }
}

interface Stats {
  total_leads: number
  webs_generadas: number
  emails_enviados: number
  respuestas: number
}

interface Config {
  semana_actual: number
  limite_diario_actual: number
  emails_enviados_hoy: number
}

export default function AdminDashboard() {
  const [webs, setWebs] = useState<WebItem[]>([])
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [stats, setStats] = useState<Stats>({ total_leads: 0, webs_generadas: 0, emails_enviados: 0, respuestas: 0 })
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [websRes, emailsRes, statsRes, configRes] = await Promise.all([
      fetch('/api/admin-data?type=webs'),
      fetch('/api/admin-data?type=emails'),
      fetch('/api/admin-data?type=stats'),
      fetch('/api/admin-data?type=config'),
    ])
    if (websRes.ok) setWebs(await websRes.json())
    if (emailsRes.ok) setEmails(await emailsRes.json())
    if (statsRes.ok) setStats(await statsRes.json())
    if (configRes.ok) setConfig(await configRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0F', color: '#8B85A8' }}>
        <p className="font-heading text-lg">Cargando centro de mando...</p>
      </div>
    )
  }

  const dailyLimit = config?.limite_diario_actual || 15
  const sentToday = config?.emails_enviados_hoy || 0
  const weekNumber = config?.semana_actual || 1
  const limitBar = Math.min((sentToday / dailyLimit) * 100, 100)
  const limitExhausted = sentToday >= dailyLimit

  return (
    <div style={{ background: '#0A0A0F', color: '#F5F3FF', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 28, fontWeight: 700 }}>
            <span style={{ color: '#6C4CE0' }}>NOIRA</span> Centro de Mando
          </h1>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 14 }}>
            <span style={{ color: '#8B85A8' }}>Semana {weekNumber}</span>
            <span style={{ color: limitExhausted ? '#39FF88' : '#8B85A8' }}>
              {sentToday}/{dailyLimit} hoy
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Leads', value: stats.total_leads, color: '#6C4CE0' },
            { label: 'Webs Generadas', value: stats.webs_generadas, color: '#9B84F0' },
            { label: 'Emails Enviados', value: stats.emails_enviados, color: '#39FF88' },
            { label: 'Respuestas', value: stats.respuestas, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} style={{ background: '#15131F', border: '1px solid #2A2640', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ color: '#8B85A8', fontSize: 13, margin: 0 }}>{s.label}</p>
              <p style={{ color: s.color, fontSize: 32, fontWeight: 700, margin: '8px 0 0 0', fontFamily: 'Space Grotesk, sans-serif' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Daily limit bar */}
        <div style={{ background: '#15131F', border: '1px solid #2A2640', borderRadius: 12, padding: '16px 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#8B85A8' }}>
            <span>Límite diario — Semana {weekNumber}: {dailyLimit} emails/día</span>
            <span>{sentToday} enviados</span>
          </div>
          <div style={{ height: 8, background: '#2A2640', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${limitBar}%`, height: '100%', background: limitExhausted ? '#39FF88' : '#6C4CE0', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
          {limitExhausted && (
            <p style={{ color: '#F59E0B', fontSize: 12, marginTop: 8 }}>
              ⚠ Límite diario alcanzado — los nuevos emails se guardarán en borrador y se enviarán mañana automáticamente.
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* WEBS HISTORY (auto-approved, read-only) */}
          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
              Historial de webs <span style={{ color: '#8B85A8', fontSize: 14, fontWeight: 400 }}>({webs.length})</span>
            </h2>
            {webs.length === 0 ? (
              <p style={{ color: '#8B85A8', fontSize: 14, padding: 24, textAlign: 'center', background: '#15131F', borderRadius: 12, border: '1px solid #2A2640' }}>
                No hay webs generadas todavía
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {webs.map(w => (
                  <div key={w.id} style={{ background: '#15131F', border: '1px solid #2A2640', borderRadius: 12, padding: 16 }}>
                    <div style={{ marginBottom: 8 }}>
                      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, margin: 0 }}>{w.leads?.nombre_negocio || '—'}</h3>
                      <p style={{ color: '#8B85A8', fontSize: 13, margin: '4px 0 0' }}>{w.leads?.categoria} · {w.leads?.pais}</p>
                    </div>
                    <p style={{ color: '#9B84F0', fontSize: 12, margin: 0 }}>
                      <a href={w.url_demo} target="_blank" rel="noopener noreferrer" style={{ color: '#9B84F0' }}>{w.url_demo}</a>
                    </p>
                    <p style={{ color: '#39FF88', fontSize: 12, marginTop: 4 }}>
                      Auto-aprobada {new Date(w.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* EMAILS HISTORY (auto-sent, no checkpoint) */}
          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
              Historial de emails <span style={{ color: '#8B85A8', fontSize: 14, fontWeight: 400 }}>({emails.length})</span>
            </h2>
            {emails.length === 0 ? (
              <p style={{ color: '#8B85A8', fontSize: 14, padding: 24, textAlign: 'center', background: '#15131F', borderRadius: 12, border: '1px solid #2A2640' }}>
                No hay emails enviados todavía
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {emails.map(e => (
                  <div key={e.id} style={{ background: '#15131F', border: '1px solid #2A2640', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, margin: 0, fontSize: 15 }}>{e.asunto}</h3>
                        <p style={{ color: '#8B85A8', fontSize: 13, margin: '4px 0 0' }}>
                          Para: {e.leads?.nombre_negocio || '—'}
                        </p>
                        <p style={{ color: '#39FF88', fontSize: 12, margin: '2px 0 0' }}>
                          Enviado {e.fecha_enviado ? new Date(e.fecha_enviado).toLocaleString('es-ES') : '—'}
                        </p>
                      </div>
                    </div>
                    <div style={{ background: '#0A0A0F', borderRadius: 8, padding: 12, fontSize: 13, color: '#8B85A8', whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto', lineHeight: 1.6 }}>
                      {e.cuerpo}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}