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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
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

  const handleApproveWeb = async (webId: string) => {
    await fetch('/api/approve-web', { method: 'POST', body: JSON.stringify({ webId }), headers: { 'Content-Type': 'application/json' } })
    fetchData()
  }

  const handleRejectWeb = async (webId: string) => {
    await fetch('/api/reject-web', { method: 'POST', body: JSON.stringify({ webId }), headers: { 'Content-Type': 'application/json' } })
    fetchData()
  }

  const handleApproveEmail = async (emailId: string) => {
    const res = await fetch('/api/approve-email', { method: 'POST', body: JSON.stringify({ emailId }), headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    if (data.cola) {
      alert('Límite diario alcanzado. El email queda en cola.')
    } else if (data.ok) {
      alert('Email enviado correctamente.')
    } else {
      alert('Error: ' + (data.error || 'desconocido'))
    }
    fetchData()
  }

  const handleRejectEmail = async (emailId: string) => {
    await fetch('/api/reject-email', { method: 'POST', body: JSON.stringify({ emailId }), headers: { 'Content-Type': 'application/json' } })
    fetchData()
  }

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
            <span style={{ color: sentToday >= dailyLimit ? '#39FF88' : '#8B85A8' }}>
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
            <div style={{ width: `${limitBar}%`, height: '100%', background: sentToday >= dailyLimit ? '#39FF88' : '#6C4CE0', borderRadius: 4, transition: 'width 0.3s' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* WEBS PENDING REVIEW */}
          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
              Webs pendientes <span style={{ color: '#8B85A8', fontSize: 14, fontWeight: 400 }}>({webs.length})</span>
            </h2>
            {webs.length === 0 ? (
              <p style={{ color: '#8B85A8', fontSize: 14, padding: 24, textAlign: 'center', background: '#15131F', borderRadius: 12, border: '1px solid #2A2640' }}>
                No hay webs pendientes de revisión
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {webs.map(w => (
                  <div key={w.id} style={{ background: '#15131F', border: '1px solid #2A2640', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, margin: 0 }}>{w.leads?.nombre_negocio || '—'}</h3>
                        <p style={{ color: '#8B85A8', fontSize: 13, margin: '4px 0 0' }}>{w.leads?.categoria} · {w.leads?.pais}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleApproveWeb(w.id)} style={{ background: '#39FF88', color: '#0A0A0F', border: 'none', padding: '6px 16px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                          Aprobar
                        </button>
                        <button onClick={() => handleRejectWeb(w.id)} style={{ background: 'transparent', color: '#F87171', border: '1px solid #F87171', padding: '6px 16px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                          Rechazar
                        </button>
                        <button onClick={() => setPreviewUrl(previewUrl === w.url_demo ? null : w.url_demo)} style={{ background: 'transparent', color: '#6C4CE0', border: '1px solid #6C4CE0', padding: '6px 16px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                          {previewUrl === w.url_demo ? 'Cerrar' : 'Preview'}
                        </button>
                      </div>
                    </div>
                    <p style={{ color: '#9B84F0', fontSize: 12, margin: 0 }}>
                      <a href={w.url_demo} target="_blank" rel="noopener noreferrer" style={{ color: '#9B84F0' }}>{w.url_demo}</a>
                    </p>
                    {previewUrl === w.url_demo && (
                      <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid #2A2640' }}>
                        <iframe src={w.url_demo} style={{ width: '100%', height: 400, border: 'none', background: '#fff' }} title="Preview" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* EMAILS PENDING REVIEW */}
          <section>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
              Emails en borrador <span style={{ color: '#8B85A8', fontSize: 14, fontWeight: 400 }}>({emails.length})</span>
            </h2>
            {emails.length === 0 ? (
              <p style={{ color: '#8B85A8', fontSize: 14, padding: 24, textAlign: 'center', background: '#15131F', borderRadius: 12, border: '1px solid #2A2640' }}>
                No hay emails pendientes
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {emails.map(e => (
                  <div key={e.id} style={{ background: '#15131F', border: '1px solid #2A2640', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, margin: 0, fontSize: 15 }}>{e.asunto}</h3>
                        <p style={{ color: '#8B85A8', fontSize: 13, margin: '4px 0 0' }}>Para: {e.leads?.nombre_negocio || '—'}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleApproveEmail(e.id)} style={{ background: '#6C4CE0', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                          Aprobar y enviar
                        </button>
                        <button onClick={() => handleRejectEmail(e.id)} style={{ background: 'transparent', color: '#F87171', border: '1px solid #F87171', padding: '6px 16px', borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                          Rechazar
                        </button>
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
