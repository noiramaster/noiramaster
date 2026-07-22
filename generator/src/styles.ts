import { StylePreset } from './types'

export const STYLES: StylePreset[] = [
  {
    name: 'fuego',
    categories: ['restaurante'],
    accentColor: '#E85D3A',
    heroGradient: 'linear-gradient(135deg, #0A0A0F 0%, #1A0F0D 100%)',
  },
  {
    name: 'rosa',
    categories: ['peluqueria', 'barbería'],
    accentColor: '#D946EF',
    heroGradient: 'linear-gradient(135deg, #0A0A0F 0%, #1A0D1A 100%)',
  },
  {
    name: 'acero',
    categories: ['abogado', 'notaría'],
    accentColor: '#4F6F8F',
    heroGradient: 'linear-gradient(135deg, #0A0A0F 0%, #0D111A 100%)',
  },
  {
    name: 'verde',
    categories: ['gimnasio', 'deporte'],
    accentColor: '#39FF88',
    heroGradient: 'linear-gradient(135deg, #0A0A0F 0%, #0D1A11 100%)',
  },
  {
    name: 'ámbar',
    categories: ['taller', 'mecánico'],
    accentColor: '#F59E0B',
    heroGradient: 'linear-gradient(135deg, #0A0A0F 0%, #1A140D 100%)',
  },
  {
    name: 'cian',
    categories: ['clinica', 'salud', 'dentista'],
    accentColor: '#06B6D4',
    heroGradient: 'linear-gradient(135deg, #0A0A0F 0%, #0D151A 100%)',
  },
  {
    name: 'violeta',
    categories: ['tienda', 'retail'],
    accentColor: '#8B5CF6',
    heroGradient: 'linear-gradient(135deg, #0A0A0F 0%, #140D1A 100%)',
  },
  {
    name: 'noira',
    categories: ['genérico'],
    accentColor: '#6C4CE0',
    heroGradient: 'linear-gradient(135deg, #0A0A0F 0%, #13101A 100%)',
  },
]

export function getStyleForCategory(category: string): StylePreset {
  const cat = category.toLowerCase().trim()
  const found = STYLES.find((s) => s.categories.includes(cat))
  return found || STYLES[STYLES.length - 1]
}
