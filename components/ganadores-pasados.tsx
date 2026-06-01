"use client"

import { useState, useEffect } from "react"
import {
  Trophy,
  Calendar,
  Hash,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GanadorPasado } from "@/lib/supabase"
import { obtenerGanadoresPasados } from "@/lib/database"

interface GanadorCardProps {
  ganador: GanadorPasado
  imagenes: string[]
  formatearFecha: (fecha: string) => string
}

function GanadorCard({ ganador, imagenes, formatearFecha }: GanadorCardProps) {
  const [imagenActual, setImagenActual] = useState(0)

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev + 1) % imagenes.length)
  }

  const anteriorImagen = () => {
    setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length)
  }

  return (
    <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-zinc-800 overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Columna de la imagen con carrusel */}
          <div className="relative bg-zinc-950 aspect-square md:aspect-[4/3] min-h-[400px]">
            {imagenes.length > 0 ? (
              <>
                {/* Imagen principal */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <img
                    src={imagenes[imagenActual]}
                    alt={`${ganador.nombre_ganador} - Imagen ${
                      imagenActual + 1
                    }`}
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>

                {/* Controles del carrusel */}
                {imagenes.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={anteriorImagen}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={siguienteImagen}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>

                    {/* Indicadores */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {imagenes.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setImagenActual(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === imagenActual
                              ? "bg-yellow-500 w-6"
                              : "bg-zinc-600 hover:bg-zinc-500"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <div className="w-32 h-32 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Trophy className="h-16 w-16 text-yellow-500/50" />
                </div>
              </div>
            )}
          </div>

          {/* Columna de información */}
          <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
            {/* Badge de Ganador */}
            <Badge
              variant="outline"
              className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 w-fit"
            >
              <Trophy className="h-3 w-3 mr-1" />
              Ganador
            </Badge>

            {/* Nombre */}
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {ganador.nombre_ganador}
              </h3>
              <div className="h-1 w-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"></div>
            </div>

            {/* Premio */}
            <div className="space-y-3">
              <p className="text-xl text-white font-semibold leading-relaxed">
                {ganador.premio}
              </p>
              <Badge
                variant="outline"
                className="bg-green-500/10 text-green-400 border-green-500/20 text-base px-4 py-1"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                {ganador.precio_premio}
              </Badge>
            </div>

            {/* Info adicional */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Calendar className="h-4 w-4" />
                  <span>Fecha</span>
                </div>
                <p className="text-white font-semibold">
                  {formatearFecha(ganador.fecha_sorteo)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Hash className="h-4 w-4" />
                  <span>Número Ganador</span>
                </div>
                <p className="font-mono font-bold text-2xl text-yellow-500">
                  {ganador.numero_ganador}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function GanadoresPasados() {
  const [ganadores, setGanadores] = useState<GanadorPasado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarGanadores()
  }, [])

  const cargarGanadores = async () => {
    try {
      const data = await obtenerGanadoresPasados()
      setGanadores(data)
    } catch (error) {
      console.error("Error cargando ganadores:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatearFecha = (fecha: string) => {
    // Parsear la fecha como local para evitar problemas de zona horaria
    const [year, month, day] = fecha.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
  }

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-black via-zinc-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-full mb-4">
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Ganadores Anteriores
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Cargando...</p>
          </div>
        </div>
      </section>
    )
  }

  if (ganadores.length === 0) {
    return null
  }

  return (
    <>
      <div className="py-12 bg-black text-center">
        <p className="text-white text-lg font-semibold mb-4">Consultas👇🏻</p>
        <a
          href="https://wa.me/5491139554443"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-full text-lg transition-colors"
        >
          WHATSAPP
        </a>
      </div>
      <section
        id="ganadores"
        className="py-20 bg-gradient-to-b from-black via-zinc-900 to-black"
      >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500/10 rounded-full mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Ganadores Anteriores
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Conocé a las personas que ya ganaron con nosotros
          </p>
        </div>

        <div className="space-y-16 max-w-6xl mx-auto">
          {ganadores.map((ganador) => {
            // Recopilar todas las imágenes disponibles
            const imagenes = [
              ganador.imagen_1_url,
              ganador.imagen_2_url,
              ganador.imagen_3_url,
            ].filter(Boolean) as string[]

            return (
              <GanadorCard
                key={ganador.id}
                ganador={ganador}
                imagenes={imagenes}
                formatearFecha={formatearFecha}
              />
            )
          })}
        </div>
      </div>
    </section>
    </>
  )
}
