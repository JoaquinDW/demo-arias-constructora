"use client"

import { useState, useEffect } from "react"
import {
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GanadorPasado } from "@/lib/supabase"
import { obtenerGanadoresPasados } from "@/lib/database"
import { CONTENIDO_DEFAULTS, type ContenidoSitio } from "@/lib/contenido"

interface GanadorCardProps {
  ganador: GanadorPasado
  imagenes: string[]
}

function GanadorCard({ ganador, imagenes }: GanadorCardProps) {
  const [imagenActual, setImagenActual] = useState(0)

  const siguienteImagen = () => {
    setImagenActual((prev) => (prev + 1) % imagenes.length)
  }

  const anteriorImagen = () => {
    setImagenActual((prev) => (prev - 1 + imagenes.length) % imagenes.length)
  }

  return (
    <Card className="bg-white border-2 border-[#171717] hard-shadow rounded-none overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Columna de imagen */}
          <div className="relative bg-neutral-100 aspect-square md:aspect-[4/3] min-h-[400px] md:border-r-2 md:border-[#171717]">
            {imagenes.length > 0 ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <img
                    src={imagenes[imagenActual]}
                    alt={`${ganador.nombre_ganador} - Imagen ${imagenActual + 1}`}
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                </div>

                {imagenes.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8"
                      onClick={anteriorImagen}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8"
                      onClick={siguienteImagen}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {imagenes.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setImagenActual(index)}
                          className={`h-2 border border-[#171717] transition-all ${
                            index === imagenActual
                              ? "bg-[#72BF44] w-6"
                              : "bg-white hover:bg-neutral-300 w-2"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8">
                <div className="w-24 h-24 bg-[#72BF44]/15 flex items-center justify-center border-2 border-[#171717]">
                  <Trophy className="h-12 w-12 text-[#72BF44]" />
                </div>
              </div>
            )}
          </div>

          {/* Columna de información */}
          <div className="p-8 md:p-10 flex flex-col justify-center space-y-6">
            <Badge
              variant="outline"
              className="bg-[#72BF44] text-[#171717] border-2 border-[#171717] rounded-none w-fit text-xs font-display font-bold uppercase tracking-wide"
            >
              <Trophy className="h-3 w-3 mr-1" />
              Ganador
            </Badge>

            <div>
              <h3 className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tight text-[#171717] mb-3">
                {ganador.nombre_ganador}
              </h3>
              <div className="h-1 w-16 bg-[#72BF44] border border-[#171717]"></div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function GanadoresPasados({
  contenido = CONTENIDO_DEFAULTS,
}: {
  contenido?: ContenidoSitio
}) {
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
      <section className="py-20 border-t-2 border-[#171717]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#72BF44]/15 border-2 border-[#171717] mb-4">
              <Trophy className="h-6 w-6 text-[#72BF44]" />
            </div>
            <h2 className="text-4xl font-display font-bold uppercase tracking-tight text-[#171717] mb-4">
              {contenido.pasados_titulo}
            </h2>
            <p className="text-neutral-500 text-sm">Cargando...</p>
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
      {/* CTA de contacto */}
      <div className="py-12 border-t-2 border-[#171717] text-center bg-graphite">
        <p className="text-neutral-400 text-sm mb-4 tracking-wide">{contenido.pasados_cta_texto}</p>
        <a
          href={contenido.whatsapp_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 btn-neon px-8 py-3 text-sm"
        >
          {contenido.pasados_cta_boton}
        </a>
      </div>

      <section
        id="ganadores"
        className="py-20 border-t-2 border-[#171717]"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="kicker mx-auto mb-3">{contenido.pasados_kicker}</span>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#72BF44]/15 border-2 border-[#171717] mb-4 mt-3">
              <Trophy className="h-6 w-6 text-[#72BF44]" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-display font-bold uppercase tracking-tight text-[#171717] mb-3">
              {contenido.pasados_titulo}
            </h2>
            <p className="text-neutral-600 text-sm max-w-md mx-auto">
              {contenido.pasados_descripcion}
            </p>
          </div>

          <div className="space-y-12 max-w-5xl mx-auto">
            {ganadores.map((ganador) => {
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
                />
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
