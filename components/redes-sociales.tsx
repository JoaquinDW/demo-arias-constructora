"use client"

import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Send,
  MessageCircle,
  Music2,
  Globe,
  type LucideIcon,
} from "lucide-react"
import type { ContenidoSitio, TipoRed } from "@/lib/contenido"

const ICONOS: Record<TipoRed, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  tiktok: Music2,
  youtube: Youtube,
  x: Twitter,
  whatsapp: MessageCircle,
  telegram: Send,
  web: Globe,
}

export function RedesSociales({ contenido }: { contenido: ContenidoSitio }) {
  const redes = (contenido.redes ?? []).filter((red) => red.url.trim())

  if (redes.length === 0) return null

  return (
    <section className="py-20 border-t-2 border-[#171717]">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <span className="kicker mx-auto mb-3">{contenido.redes_kicker}</span>
        <h2 className="text-4xl lg:text-5xl font-display font-bold tracking-tight uppercase text-[#171717] mb-3">
          {contenido.redes_titulo}
        </h2>
        {contenido.redes_descripcion && (
          <p className="text-neutral-600 text-sm max-w-md mx-auto">
            {contenido.redes_descripcion}
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {redes.map((red, index) => {
            const Icono = ICONOS[red.tipo] ?? Globe
            return (
              <a
                key={`${red.url}-${index}`}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-white border-2 border-[#171717] hard-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 text-[#171717] px-5 py-3 text-sm font-display font-semibold uppercase tracking-wide transition-transform duration-150"
              >
                <Icono className="w-4 h-4 text-[#72BF44]" />
                {red.etiqueta || red.url}
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
