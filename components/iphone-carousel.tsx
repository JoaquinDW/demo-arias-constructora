"use client"

import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import { obtenerSorteoActivo } from "@/lib/database"
import type { Sorteo } from "@/lib/supabase"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function IphoneCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [sorteo, setSorteo] = useState<Sorteo | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const cargarSorteo = async () => {
      try {
        const sorteoActivo = await obtenerSorteoActivo()
        setSorteo(sorteoActivo)
      } catch (error) {
        console.error("Error cargando sorteo:", error)
      }
    }
    cargarSorteo()
  }, [])

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

  // Usar imágenes del carrusel si están disponibles
  const slides = [
    sorteo?.carousel_image_1,
    sorteo?.carousel_image_2,
    sorteo?.carousel_image_3,
    sorteo?.carousel_image_4,
    sorteo?.carousel_image_5,
    sorteo?.carousel_image_6,
    sorteo?.carousel_image_7,
    sorteo?.carousel_image_8,
  ].filter((img): img is string => Boolean(img)) // Filtrar nulls/undefined con type guard

  // Si no hay imágenes del carousel, usar placeholders por defecto
  const finalSlides: string[] =
    slides.length > 0
      ? slides
      : [
          "/placeholder.jpg",
          "/white-t-shirt-mockup-t-shirt-with-short-sleeves-ai-generative-free-png.webp",
          "/placeholder-user.jpg",
        ]

  return (
    <div className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
      <div className="overflow-hidden border-2 border-[#171717] hard-shadow bg-white" ref={emblaRef as any}>
        <div className="flex">
          {finalSlides.map((src, idx) => (
            <div key={idx} className="min-w-full flex-shrink-0">
              <div className="relative overflow-hidden h-[500px] sm:h-[600px] md:h-[700px]">
                {/* Imagen de fondo difuminada para llenar los espacios */}
                <div className="absolute inset-0">
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover blur-2xl scale-110 opacity-30"
                  />
                </div>
                {/* Imagen principal */}
                <div className="relative w-full h-full">
                  <Image
                    src={src}
                    alt={`Slide ${idx + 1}`}
                    fill
                    className="object-contain"
                    priority={idx === 0}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controles de navegación */}
      {finalSlides.length > 1 && (
        <>
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white border-2 border-[#171717] hover:bg-[#72BF44] text-[#171717] p-2 transition-colors duration-150 z-10"
            onClick={scrollPrev}
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white border-2 border-[#171717] hover:bg-[#72BF44] text-[#171717] p-2 transition-colors duration-150 z-10"
            onClick={scrollNext}
            aria-label="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots indicadores */}
          <div className="flex justify-center mt-5 space-x-2">
            {finalSlides.map((_, idx) => (
              <button
                key={idx}
                className={`h-3 border-2 border-[#171717] transition-all duration-200 ${
                  idx === currentIndex
                    ? "bg-[#72BF44] w-7"
                    : "bg-white hover:bg-neutral-200 w-3"
                }`}
                onClick={() => emblaApi?.scrollTo(idx)}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
