import { CityConfig, CategoryConfig } from './types'

export const CITIES: CityConfig[] = [
  { name: 'Madrid', pais: 'ES', idioma: 'es', bbox: [-3.833, 40.350, -3.550, 40.500] },
  { name: 'Barcelona', pais: 'ES', idioma: 'es', bbox: [2.050, 41.320, 2.230, 41.470] },
  { name: 'Valencia', pais: 'ES', idioma: 'es', bbox: [-0.420, 39.430, -0.310, 39.500] },
  { name: 'Sevilla', pais: 'ES', idioma: 'es', bbox: [-6.030, 37.350, -5.920, 37.420] },
  { name: 'Málaga', pais: 'ES', idioma: 'es', bbox: [-4.450, 36.690, -4.390, 36.750] },
  { name: 'Casablanca', pais: 'MA', idioma: 'fr', bbox: [-7.700, 33.520, -7.540, 33.600] },
  { name: 'Rabat', pais: 'MA', idioma: 'fr', bbox: [-6.870, 33.970, -6.810, 34.040] },
  { name: 'Marrakech', pais: 'MA', idioma: 'fr', bbox: [-8.050, 31.600, -7.950, 31.670] },
  { name: 'Tánger', pais: 'MA', idioma: 'fr', bbox: [-5.850, 35.740, -5.760, 35.800] },
]

export const CATEGORIES: CategoryConfig[] = [
  {
    name: 'restaurante',
    osmTags: ['"amenity"="restaurant"', '"amenity"="fast_food"', '"amenity"="cafe"'],
    googleCategory: 'restaurant',
  },
  {
    name: 'peluqueria',
    osmTags: ['"shop"="hairdresser"', '"shop"="beauty"', '"amenity"="barber"'],
    googleCategory: 'hair salon',
  },
  {
    name: 'abogado',
    osmTags: ['"office"="lawyer"'],
    googleCategory: 'lawyer',
  },
  {
    name: 'gimnasio',
    osmTags: ['"leisure"="fitness_centre"', '"leisure"="sports_centre"'],
    googleCategory: 'gym',
  },
  {
    name: 'taller',
    osmTags: ['"shop"="car_repair"', '"amenity"="car_wash"'],
    googleCategory: 'auto repair',
  },
  {
    name: 'clinica',
    osmTags: ['"amenity"="clinic"', '"amenity"="dentist"', '"healthcare"="doctor"'],
    googleCategory: 'clinic',
  },
  {
    name: 'tienda',
    osmTags: ['"shop"="convenience"', '"shop"="supermarket"', '"shop"="bakery"', '"shop"="butcher"'],
    googleCategory: 'store',
  },
  {
    name: 'genérico',
    osmTags: ['"shop"="*"', '"amenity"="*"'],
    googleCategory: 'local business',
  },
]

export const MAX_LEADS_PER_RUN = 30
export const PLAYWRIGHT_DELAY_MIN = 3000
export const PLAYWRIGHT_DELAY_MAX = 8000
