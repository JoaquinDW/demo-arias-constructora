"use client"

import { useState, useEffect } from "react"
import { obtenerGanadoresExpress } from "@/lib/database"
import type { GanadorExpress } from "@/lib/supabase"
import { Trophy } from "lucide-react"

interface GanadoresExpressProps {
  sorteoId?: string
}

export function GanadoresExpress({ sorteoId }: GanadoresExpressProps) {
  const [ganadores, setGanadores] = useState<GanadorExpress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarGanadores()
  }, [sorteoId])

  const cargarGanadores = async () => {
    try {
      const data = await obtenerGanadoresExpress(sorteoId)
      setGanadores(data)
    } catch (error) {
      console.error("Error cargando ganadores express:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (ganadores.length === 0) {
    return null
  }

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-black/80 to-black/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2 flex items-center justify-center gap-2 md:gap-3">
            <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
            Ganadores de premios express
          </h2>
          {/* <p className="text-gray-400 text-sm">instantáneos</p> */}
          {/* <div className="flex items-center justify-center gap-1.5 md:gap-2 mt-1 md:mt-2">
            <span className="text-white text-lg md:text-xl font-bold">
              {ganadores.length}
            </span>
            <span className="text-gray-400 text-sm md:text-base">/</span>
            <span className="text-gray-500 text-sm md:text-base">30</span>
          </div> */}
        </div>

        <div className="max-w-4xl mx-auto space-y-2 md:space-y-3">
          {ganadores.map((ganador, index) => (
            <div
              key={ganador.id}
              className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl md:rounded-2xl p-2 md:p-4 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 md:justify-between shadow-lg hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Layout móvil: horizontal compacto */}
              <div className="flex items-center justify-between gap-1.5 md:hidden w-full">
                {/* Número Ganador - móvil */}
                <div className="bg-white/95 rounded-lg px-2.5 py-1.5 flex-shrink-0">
                  <p className="text-black text-base font-bold">
                    {ganador.numero_ganador}
                  </p>
                </div>

                {/* Monto del Premio - móvil */}
                <div className="flex-1 text-center px-1">
                  <p className="text-white text-sm font-bold">
                    {ganador.premio_monto}
                  </p>
                </div>

                {/* Nombre y trofeo - móvil */}
                <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2.5 py-1.5 flex-shrink-0 max-w-[120px]">
                  <p className="text-white text-xs font-bold truncate">
                    {ganador.nombre_ganador || "Anónimo"}
                  </p>
                  <Trophy className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                </div>
              </div>

              {/* Layout desktop: horizontal espacioso */}
              <div className="hidden md:flex items-center justify-between w-full">
                {/* Número Ganador - desktop */}
                <div className="bg-white/95 rounded-xl px-6 py-3 min-w-[140px]">
                  <p className="text-black text-2xl font-bold text-center">
                    {ganador.numero_ganador}
                  </p>
                </div>

                {/* Monto del Premio - desktop */}
                <div className="flex-1 text-center px-4">
                  <p className="text-white text-xl lg:text-2xl font-bold">
                    {ganador.premio_monto}
                  </p>
                </div>

                {/* Nombre del Ganador - desktop */}
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-6 py-3 min-w-[200px] justify-end">
                  <p className="text-white text-lg lg:text-xl font-bold truncate">
                    {ganador.nombre_ganador || "Anónimo"}
                  </p>
                  <Trophy className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
