import { chromium } from 'playwright'
import { DiscoveredBusiness } from './types'
import { PLAYWRIGHT_DELAY_MIN, PLAYWRIGHT_DELAY_MAX } from './config'

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function randomDelay(): Promise<void> {
  const ms = Math.floor(
    Math.random() * (PLAYWRIGHT_DELAY_MAX - PLAYWRIGHT_DELAY_MIN) + PLAYWRIGHT_DELAY_MIN
  )
  return sleep(ms)
}

const GOOGLE_CACHE = new Map<string, { rating: number; reviews: number; phone?: string }>()

async function checkGoogleMaps(
  browser: any,
  name: string,
  city: string
): Promise<{ rating: number; reviews: number; phone?: string } | null> {
  const cacheKey = `${name}|${city}`.toLowerCase()
  if (GOOGLE_CACHE.has(cacheKey)) {
    return GOOGLE_CACHE.get(cacheKey)!
  }

  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'es-ES',
  })

  try {
    const page = await context.newPage()
    const query = encodeURIComponent(`${name} ${city}`)
    await page.goto(`https://www.google.com/maps/search/${query}`, {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    await randomDelay()

    const result = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[role="article"]'))
      for (const card of cards) {
        const text = card.textContent || ''
        const ratingMatch = text.match(/(\d+[,.]?\d*)\s*★/)
        const reviewsMatch = text.match(/\((\d+)\)/)
        const phoneMatch = text.match(/(\+?\d[\d\s-]{7,})/)

        if (ratingMatch) {
          return {
            rating: parseFloat(ratingMatch[1].replace(',', '.')),
            reviews: reviewsMatch ? parseInt(reviewsMatch[1], 10) : 0,
            phone: phoneMatch ? phoneMatch[1].trim() : undefined,
          }
        }
      }
      return null
    })

    if (result) {
      GOOGLE_CACHE.set(cacheKey, result)
    }
    return result
  } catch {
    return null
  } finally {
    await context.close()
  }
}

export async function enrichWithGoogleData(
  leads: DiscoveredBusiness[]
): Promise<DiscoveredBusiness[]> {
  const browser = await chromium.launch({ headless: true })
  const enriched: DiscoveredBusiness[] = []

  try {
    for (const lead of leads) {
      const googleData = await checkGoogleMaps(browser, lead.nombre_negocio, lead.ubicacion.split(',')[0] || lead.ubicacion)

      if (googleData) {
        lead.num_resenas = googleData.reviews
        if (googleData.phone) {
          lead.telefono = googleData.phone
        }
        enriched.push(lead)
      }

      await randomDelay()
    }
  } finally {
    await browser.close()
  }

  return enriched
}
