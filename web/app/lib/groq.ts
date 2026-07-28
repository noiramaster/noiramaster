export interface GroqRateLimit {
  remaining: number
  total: number
  reset: number
}

export async function validateGroqKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    if (res.ok) return { valid: true }
    if (res.status === 401) return { valid: false, error: 'Clave inválida. Verifica que la hayas copiado bien.' }
    return { valid: false, error: `Error de API: ${res.status}` }
  } catch (err: any) {
    return { valid: false, error: `No se pudo conectar con Groq: ${err.message}` }
  }
}

export interface WebGenInput {
  nombre: string
  categoria: string
  descripcion?: string
  telefono?: string
  direccion?: string
  horario?: string
  servicios?: string[]
  idiomas: string[]
}

const LANG_NAMES: Record<string, string> = {
  es: 'español', en: 'inglés', fr: 'francés', pt: 'portugués',
  de: 'alemán', it: 'italiano', ar: 'árabe'
}

export async function generateWebCopy(
  apiKey: string,
  input: WebGenInput
): Promise<{ copy: Record<string, any> | null; rateLimit?: GroqRateLimit; error?: string }> {
  const serviciosText = input.servicios?.length ? `Servicios:\n${input.servicios.map(s => `- ${s}`).join('\n')}` : ''
  const langs = input.idiomas.length ? input.idiomas : ['es']

  const prompt = `Eres un traductor profesional. Genera contenido para la web de "${input.nombre}" (${input.categoria}).
${input.descripcion ? `Descripción: ${input.descripcion}` : ''}
${input.direccion ? `Dirección: ${input.direccion}` : ''}
${input.horario ? `Horario: ${input.horario}` : ''}
${serviciosText}

Genera el contenido en los siguientes idiomas: ${langs.map(l => LANG_NAMES[l] || l).join(', ')}.
Responde SOLO con un JSON donde cada clave es el código del idioma y el valor es el contenido en ese idioma:
{
  "es": { "hero_title": "...", "hero_subtitle": "...", "services": [...], "about": "...", "cta": "..." },
  "en": { ... },
  ...
}`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    const rateLimit: GroqRateLimit = {
      remaining: parseInt(res.headers.get('x-ratelimit-remaining-requests') || '0'),
      total: parseInt(res.headers.get('x-ratelimit-limit-requests') || '0'),
      reset: parseInt(res.headers.get('x-ratelimit-reset-requests') || '0')
    }

    if (!res.ok) {
      const body = await res.json()
      if (res.status === 429 || res.status === 402) {
        return { copy: null, rateLimit, error: 'Has usado todos tus intentos gratis de hoy. Vuelve mañana o mejora tu plan en Groq.' }
      }
      return { copy: null, rateLimit, error: `Error de Groq: ${body.error?.message || res.status}` }
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return { copy: null, rateLimit, error: 'Respuesta inesperada de Groq. Intenta de nuevo.' }

    const parsed = JSON.parse(jsonMatch[0])

    // Fill missing languages with Spanish fallback
    const copy: Record<string, any> = {}
    for (const l of langs) {
      copy[l] = parsed[l] || parsed.es || { hero_title: input.nombre, hero_subtitle: '', services: input.servicios || ['Servicio 1', 'Servicio 2', 'Servicio 3', 'Servicio 4'], about: input.descripcion || '', cta: 'Contáctanos' }
    }

    return { copy, rateLimit }
  } catch (err: any) {
    return { copy: null, error: `Error de conexión: ${err.message}` }
  }
}
