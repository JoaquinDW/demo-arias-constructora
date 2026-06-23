import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// Supabase renombró la "anon key" a "publishable key". Aceptamos ambos nombres.
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (o NEXT_PUBLIC_SUPABASE_ANON_KEY) environment variable",
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para TypeScript
export interface Sorteo {
  id: string
  nombre: string
  descripcion: string | null
  total_chances: number
  cantidad_pack_1: number
  cantidad_pack_2: number
  cantidad_pack_3: number
  precio_6_chances: number
  precio_12_chances: number
  precio_24_chances: number
  pack_1_visible: boolean // Configurar si el pack 1 es visible
  pack_2_visible: boolean // Configurar si el pack 2 es visible
  pack_3_visible: boolean // Configurar si el pack 3 es visible
  descripcion_pack_1: string // Descripción personalizable del pack 1
  descripcion_pack_2: string // Descripción personalizable del pack 2
  descripcion_pack_3: string // Descripción personalizable del pack 3
  cantidad_pack_4: number
  precio_pack_4: number
  pack_4_visible: boolean
  descripcion_pack_4: string
  cantidad_pack_5: number
  precio_pack_5: number
  pack_5_visible: boolean
  descripcion_pack_5: string
  fecha_sorteo: string | null
  estado: string // 'activo', 'completo', 'sorteado', 'cerrado'
  imagen_url: string | null
  titulo_remera: string // Added titulo_remera field
  carousel_image_1: string | null
  carousel_image_2: string | null
  carousel_image_3: string | null
  carousel_image_4: string | null
  carousel_image_5: string | null
  carousel_image_6: string | null
  carousel_image_7: string | null
  carousel_image_8: string | null
  ganador_id: string | null
  numero_ganador: number | null
  ganador_nombre: string | null
  fecha_sorteo_realizado: string | null
  created_at: string
  updated_at: string
}

export interface Comprador {
  id: string
  sorteo_id: string
  nombre: string
  email?: string // Opcional - el usuario puede elegir no proporcionar email
  telefono?: string // Opcional - solo requerido si elige WhatsApp como método de contacto
  celular?: string
  instagram_username?: string // Opcional - solo requerido si elige Instagram como método de contacto
  cantidad_chances: number
  numeros_asignados: number[]
  precio_pagado: number
  estado_pago: string // 'pendiente', 'pagado', 'cancelado', 'expirado'
  mercadopago_id?: string | null // Para pagos de MercadoPago o URL de comprobante temporal
  metodo_pago?: string // 'mercadopago', 'transferencia'
  comprobante_url?: string
  estado_transferencia?: string // 'pendiente', 'aprobado', 'rechazado'
  fecha_transferencia?: string
  admin_revisor?: string
  notas_admin?: string
  es_ganador: boolean
  created_at: string
  updated_at: string
}

export interface GanadorPasado {
  id: string
  nombre_ganador: string
  premio: string
  precio_premio: string
  fecha_sorteo: string
  numero_ganador: number
  imagen_1_url: string | null
  imagen_2_url: string | null
  imagen_3_url: string | null
  orden: number
  visible: boolean
  created_at: string
  updated_at: string
}

export interface ConfiguracionTransferencia {
  alias: string
  titular: string
}

export interface GanadorExpress {
  id: string
  sorteo_id: string
  numero_ganador: number
  nombre_ganador: string | null
  premio_monto: string
  fecha_premio: string
  visible: boolean
  created_at: string
  updated_at: string
}
