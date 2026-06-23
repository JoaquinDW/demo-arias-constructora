"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Clock, Trophy } from "lucide-react"
import Link from "next/link"
import { CompraModalNuevo } from "@/components/compra-modal-nuevo"
import { Header } from "@/components/header"
import { GanadoresPasados } from "@/components/ganadores-pasados"
import { GanadoresExpress } from "@/components/ganadores-express"
import { RedesSociales } from "@/components/redes-sociales"
import dynamic from "next/dynamic"

const IphoneCarousel = dynamic(() => import("@/components/iphone-carousel"), {
  ssr: false,
})
import {
  obtenerSorteoActivo,
  obtenerEstadisticasSorteo,
  generarNumerosUnicos,
  obtenerPremiosSecundarios,
} from "@/lib/database"
import type { Sorteo } from "@/lib/supabase"
import type { PremiosSecundarios } from "@/lib/database"
import {
  obtenerContenido,
  conPlaceholders,
  CONTENIDO_DEFAULTS,
  type ContenidoSitio,
} from "@/lib/contenido"
import { AnimatedProgress } from "@/components/animated-progress"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function LandingPage() {
  const [sorteo, setSorteo] = useState<Sorteo | null>(null)
  const [chancesVendidas, setChancesVendidas] = useState(0)
  const [totalCompradores, setTotalCompradores] = useState(0)
  const [totalRecaudado, setTotalRecaudado] = useState(0)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [packSeleccionado, setPackSeleccionado] = useState<{
    chances: number
    precio: number
    sorteoId?: string
  } | null>(null)
  const [animacionVisible, setAnimacionVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [consultaEmail, setConsultaEmail] = useState("")
  const [consultaLoading, setConsultaLoading] = useState(false)
  const [consultaResultados, setConsultaResultados] = useState<Array<{
    id: string
    nombre: string
    numeros_asignados: number[]
    cantidad_chances: number
    sorteo_nombre: string
    created_at: string
  }> | null>(null)
  const [consultaError, setConsultaError] = useState<string | null>(null)
  const [premiosSecundarios, setPremiosSecundarios] =
    useState<PremiosSecundarios | null>(null)
  const [contenido, setContenido] = useState<ContenidoSitio>(CONTENIDO_DEFAULTS)
  const { toast } = useToast()

  const getPacks = () => {
    if (!sorteo) return []

    const allPacks = [
      {
        chances: sorteo.cantidad_pack_1 || 10,
        precio: sorteo.precio_6_chances || 21000,
        color: "from-green-400 to-green-600",
        descripcion: sorteo.descripcion_pack_1 || "Honda Wave 2025",
        visible: sorteo.pack_1_visible ?? true,
      },
      {
        chances: sorteo.cantidad_pack_2 || 25,
        precio: sorteo.precio_12_chances || 42000,
        color: "from-lime-400 to-green-500",
        popular: true,
        descripcion:
          sorteo.descripcion_pack_2 ||
          "Honda Wave 2025 + 5 chances en pre-venta New Titan 2018",
        visible: sorteo.pack_2_visible ?? true,
      },
      {
        chances: sorteo.cantidad_pack_3 || 50,
        precio: sorteo.precio_24_chances || 84000,
        color: "from-emerald-400 to-lime-500",
        descripcion:
          sorteo.descripcion_pack_3 ||
          "Honda Wave 2025 + 5 chances pre-venta New Titan 2018",
        visible: sorteo.pack_3_visible ?? true,
      },
      {
        chances: sorteo.cantidad_pack_4 || 0,
        precio: sorteo.precio_pack_4 || 0,
        color: "from-teal-400 to-emerald-600",
        descripcion: sorteo.descripcion_pack_4 || "",
        visible: sorteo.pack_4_visible ?? false,
      },
      {
        chances: sorteo.cantidad_pack_5 || 0,
        precio: sorteo.precio_pack_5 || 0,
        color: "from-cyan-400 to-teal-600",
        descripcion: sorteo.descripcion_pack_5 || "",
        visible: sorteo.pack_5_visible ?? false,
      },
    ]

    return allPacks.filter((pack) => pack.visible)
  }

  useEffect(() => {
    cargarDatos()
    const timer = setTimeout(() => setAnimacionVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const cargarDatos = async () => {
    try {
      const [sorteoActivo, premios, contenidoSitio] = await Promise.all([
        obtenerSorteoActivo(),
        obtenerPremiosSecundarios(),
        obtenerContenido(),
      ])
      setPremiosSecundarios(premios)
      setContenido(contenidoSitio)
      if (sorteoActivo) {
        setSorteo(sorteoActivo)
        const estadisticas = await obtenerEstadisticasSorteo(sorteoActivo.id)
        setChancesVendidas(estadisticas.chancesVendidas)
        setTotalCompradores(estadisticas.totalCompradores)
        setTotalRecaudado(estadisticas.totalRecaudado)
      } else {
        console.error("No se pudo cargar el sorteo")
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  const procesarCompra = async (
    nombre: string,
    email: string,
    telefono: string,
  ) => {
    if (!packSeleccionado || !sorteo) return

    try {
      const numerosDisponibles = await generarNumerosUnicos(
        sorteo.id,
        packSeleccionado.chances,
      )

      if (numerosDisponibles.length < packSeleccionado.chances) {
        toast({
          variant: "destructive",
          title: "Error en la compra",
          description: "No hay suficientes números disponibles",
        })
        return
      }

      const datosCompra = {
        sorteoId: sorteo.id,
        nombre,
        email,
        telefono,
        chances: packSeleccionado.chances,
        precio: packSeleccionado.precio,
        timestamp: Date.now(),
      }

      localStorage.setItem(
        "sorteo_compra_pendiente",
        JSON.stringify(datosCompra),
      )

      toast({
        title: "Preparando pago...",
        description: "Te redirigiremos a MercadoPago en un momento",
      })

      const response = await fetch("/api/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosCompra),
      })

      if (!response.ok) throw new Error("Error creando preferencia de pago")

      const { preferenceId, paymentUrl } = await response.json()

      const datosActualizados = { ...datosCompra, preferenceId }
      localStorage.setItem(
        "sorteo_compra_pendiente",
        JSON.stringify(datosActualizados),
      )

      window.location.href = paymentUrl
    } catch (error) {
      console.error("Error procesando compra:", error)
      toast({
        variant: "destructive",
        title: "Error en la compra",
        description: "Ocurrió un error inesperado. Intenta nuevamente.",
      })
    }

    setModalAbierto(false)
    setPackSeleccionado(null)
  }

  const procesarTransferencia = async (data: {
    nombre: string
    email: string
    contacto: string
    comprobanteFile: File
  }) => {
    if (!packSeleccionado || !sorteo) return

    try {
      const esWhatsApp = /^[\d\s+()-]+$/.test(data.contacto.trim())

      const formData = new FormData()
      formData.append("sorteoId", sorteo.id)
      formData.append("nombre", data.nombre)
      if (data.email) formData.append("email", data.email)
      if (esWhatsApp) {
        formData.append("telefono", data.contacto)
      } else {
        formData.append("instagram_username", data.contacto.replace("@", ""))
      }
      formData.append("cantidadChances", packSeleccionado.chances.toString())
      formData.append("comprobante", data.comprobanteFile)

      toast({
        title: "Procesando...",
        description: "Estamos registrando tu transferencia",
      })

      const response = await fetch("/api/transferencia", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Error procesando transferencia")

      toast({
        title: "¡Transferencia registrada!",
        description:
          "Tu pago está pendiente de confirmación. Te notificaremos por email cuando sea aprobado.",
        duration: 5000,
      })

      await cargarDatos()
    } catch (error) {
      console.error("Error procesando transferencia:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "Ocurrió un error procesando tu transferencia. Intenta nuevamente.",
      })
    }

    setModalAbierto(false)
    setPackSeleccionado(null)
  }

  const TOTAL_CHANCES = sorteo?.total_chances || 9999
  const porcentajeVendido = (chancesVendidas / TOTAL_CHANCES) * 100
  const sorteoCompleto =
    sorteo?.estado === "completo" ||
    sorteo?.estado === "sorteado" ||
    chancesVendidas >= TOTAL_CHANCES

  const PACKS = getPacks()

  const handleCompra = (pack: (typeof PACKS)[0]) => {
    if (sorteoCompleto) return
    setPackSeleccionado({ ...pack, sorteoId: sorteo?.id })
    setModalAbierto(true)
  }

  const consultarMisNumeros = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailTrimmed = consultaEmail.trim()
    if (!emailTrimmed) return
    setConsultaLoading(true)
    setConsultaResultados(null)
    setConsultaError(null)
    try {
      const response = await fetch(
        `/api/mis-numeros?email=${encodeURIComponent(emailTrimmed)}`,
      )
      const data = await response.json()
      if (!response.ok) {
        setConsultaError(data.error || "Ocurrió un error. Intenta nuevamente.")
        return
      }
      setConsultaResultados(data.participaciones)
    } catch {
      setConsultaError(
        "No se pudo conectar. Revisá tu conexión e intentá de nuevo.",
      )
    } finally {
      setConsultaLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center space-y-5">
          <div className="w-12 h-12 border-[3px] border-[#171717] border-t-[#72BF44] animate-spin mx-auto"></div>
          <p className="text-neutral-500 text-xs font-display font-semibold tracking-[0.3em] uppercase">
            Cargando
          </p>
        </div>
      </div>
    )
  }

  if (!sorteo) {
    return (
      <div className="min-h-screen bg-dark-gradient flex flex-col">
        <Header marca={contenido.marca} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-7 max-w-md">
            <div className="w-24 h-24 bg-white border-2 border-[#171717] hard-shadow overflow-hidden mx-auto p-2">
              <img
                src="/delfos-logo.png"
                alt={contenido.marca}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-3">
              <span className="kicker mx-auto">En obra</span>
              <h2 className="text-4xl font-display font-bold tracking-tight text-[#171717] uppercase">
                {contenido.proximamente_titulo}
              </h2>
              <p className="text-neutral-600 text-sm max-w-xs mx-auto">
                {contenido.proximamente_descripcion}
              </p>
            </div>
            <Link
              href={contenido.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block btn-neon px-7 py-3.5 text-sm"
            >
              {contenido.proximamente_boton}
            </Link>
          </div>
        </div>
        <RedesSociales contenido={contenido} />
        <footer className="bg-graphite border-t-2 border-[#72BF44] py-6">
          <div className="container mx-auto px-4 text-center text-neutral-400 text-xs tracking-wide">
            <p>{contenido.footer_copyright}</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      <Header marca={contenido.marca} />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Elementos geométricos de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-72 h-72 border-2 border-[#171717]/10 rotate-12"></div>
          <div className="absolute top-32 right-24 w-40 h-40 bg-[#72BF44]/10 rotate-45"></div>
          <div className="absolute bottom-16 left-8 w-24 h-24 border-2 border-[#72BF44]/30"></div>
        </div>

        <div className="relative container mx-auto px-4 py-10 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
            {/* Carousel a la izquierda */}
            <div
              className={`relative transition-all duration-700 ${
                animacionVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <div className="relative">
                <IphoneCarousel />

                {/* Floating badge */}
                <div className="absolute -top-4 inset-x-0 mx-auto w-fit lg:inset-x-auto lg:right-16 lg:mx-0 xl:-right-2 bg-[#72BF44] text-[#171717] border-2 border-[#171717] hard-shadow-sm px-4 py-1.5 font-display font-bold text-xs tracking-widest uppercase z-30 flex items-center gap-1.5">
                  <Trophy className="w-3 h-3" />
                  {contenido.hero_badge}
                </div>
              </div>

              {/* Título bajo el carousel */}
              <div className="text-center mt-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-[#171717] uppercase leading-[0.95]">
                  {conPlaceholders(contenido.hero_titulo, {
                    premio: sorteo.titulo_remera || "Remera Exclusiva",
                  })}
                </h2>
              </div>
            </div>

            {/* Contenido a la derecha */}
            <div
              className={`flex flex-col gap-6 transition-all duration-700 delay-200 ${
                animacionVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              {sorteo?.estado !== "sorteado" && (
                <p className="order-1 lg:order-1 text-2xl lg:text-3xl text-neutral-700 font-light leading-snug">
                  {contenido.hero_subtitulo}
                </p>
              )}

              {/* Progress Bar / Evento finalizado */}
              {sorteo?.estado === "sorteado" ? (
                <div className="order-3 lg:order-2 bg-white border-2 border-[#171717] hard-shadow p-6 text-center">
                  <p className="text-lg font-display font-bold uppercase tracking-tight text-[#171717]">
                    Evento finalizado
                  </p>
                </div>
              ) : (
                <div className="order-3 lg:order-2 space-y-4 bg-white border-2 border-[#171717] hard-shadow p-5 sm:p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-display font-semibold text-neutral-500 uppercase tracking-[0.18em]">
                      {contenido.hero_chances_label}
                    </span>
                  </div>
                  <AnimatedProgress value={porcentajeVendido} className="h-4" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display font-bold tracking-tight text-[#171717] tabular-nums">
                      {porcentajeVendido.toFixed(1)}%
                    </span>
                    <span className="text-sm text-neutral-500">
                      {contenido.hero_completado_label}
                    </span>
                  </div>
                </div>
              )}

              {/* Estados: completo / sorteado / cerrado */}
              {sorteoCompleto && (
                <div className="order-4 lg:order-3 space-y-4">
                  {sorteo?.estado === "completo" && (
                    <div className="bg-white border-2 border-[#171717] border-l-[6px] border-l-amber-500 hard-shadow-sm text-[#171717] px-5 py-4">
                      <h3 className="text-base font-display font-bold uppercase tracking-tight mb-1 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        {contenido.hero_completo_titulo}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {contenido.hero_completo_descripcion}
                      </p>
                      {sorteo.fecha_sorteo_realizado && (
                        <p className="text-xs text-neutral-400 mt-1">
                          Prendas completadas el{" "}
                          {new Date(
                            sorteo.fecha_sorteo_realizado,
                          ).toLocaleDateString("es-AR")}
                        </p>
                      )}
                    </div>
                  )}

                  {sorteo?.estado === "sorteado" && (
                    <div className="bg-white border-2 border-[#171717] border-l-[6px] border-l-[#72BF44] hard-shadow-sm text-[#171717] px-5 py-4">
                      <h3 className="text-base font-display font-bold uppercase tracking-tight mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#72BF44]" />
                        {contenido.hero_sorteado_titulo}
                      </h3>
                      {sorteo.numero_ganador && (
                        <div className="space-y-1.5">
                          {sorteo.ganador_nombre && (
                            <p className="text-sm text-neutral-700">
                              Ganador:{" "}
                              <span className="font-bold text-[#171717]">
                                {sorteo.ganador_nombre}
                              </span>
                            </p>
                          )}
                          <p className="text-sm text-neutral-700">
                            Número Ganador:{" "}
                            <span className="font-mono font-bold text-[#171717] text-lg bg-[#72BF44] px-2 py-0.5 border border-[#171717]">
                              {sorteo.numero_ganador}
                            </span>
                          </p>
                          <p className="text-xs text-neutral-500">
                            Según la Quiniela de Buenos Aires del{" "}
                            {sorteo.updated_at &&
                              new Date(sorteo.updated_at).toLocaleDateString(
                                "es-AR",
                              )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {(sorteo?.estado === "cerrado" ||
                    (sorteo?.estado &&
                      !sorteo.estado.match(/completo|sorteado/))) && (
                    <div className="bg-white border-2 border-[#171717] border-l-[6px] border-l-[#72BF44] hard-shadow-sm text-[#171717] px-5 py-4">
                      <h3 className="text-base font-display font-bold uppercase tracking-tight mb-1">
                        {contenido.hero_cerrado_titulo}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        {contenido.hero_cerrado_descripcion}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Pack cards */}
              {!sorteoCompleto && (
                <div className="order-2 lg:order-4 space-y-3">
                  {PACKS.map((pack, index) => (
                    <div
                      key={pack.chances}
                      className={`transition-all duration-500 ${
                        animacionVisible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-6"
                      }`}
                      style={{ transitionDelay: `${(index + 3) * 150}ms` }}
                    >
                      {pack.popular && (
                        <div className="mb-0 -ml-px">
                          <span className="inline-block bg-[#72BF44] text-[#171717] border-2 border-[#171717] border-b-0 text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1">
                            {contenido.packs_popular_label}
                          </span>
                        </div>
                      )}

                      <div
                        className={`p-4 sm:p-5 transition-all duration-150 border-2 border-[#171717] ${
                          pack.popular
                            ? "bg-[#72BF44]/15 hard-shadow hover:-translate-x-0.5 hover:-translate-y-0.5"
                            : "bg-white hard-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-xl sm:text-2xl font-display font-bold uppercase tracking-tight text-[#171717]">
                              {pack.chances} Chances
                            </div>
                            <div
                              className={`text-xs font-medium mt-1 line-clamp-2 ${
                                pack.descripcion
                                  ? "text-neutral-700"
                                  : "text-neutral-400"
                              }`}
                            >
                              {pack.descripcion ||
                                `${pack.chances} números asignados`}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-xl sm:text-2xl font-display font-bold text-[#171717] tabular-nums">
                              ${pack.precio.toLocaleString()}
                            </div>
                            <Button
                              onClick={() => handleCompra(pack)}
                              size="sm"
                              className="btn-neon mt-2 px-5 py-1.5 text-xs h-auto"
                            >
                              <ShoppingCart className="w-3 h-3 mr-1.5" />
                              {contenido.packs_comprar_boton}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!sorteoCompleto && PACKS.length > 1 && (
                <p className="order-5 lg:order-5 text-xs text-neutral-500 text-center tracking-wide">
                  {contenido.packs_nota}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col">
        {/* Sección de Premios — temporalmente oculta */}
        {false && (
          <section className="order-2 lg:order-1 py-16 border-t border-gray-900">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#72BF44] mb-3">
                  {contenido.premios_kicker}
                </p>
                <h2 className="text-5xl lg:text-7xl font-display tracking-wider text-white">
                  {contenido.premios_titulo}
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {/* 1er Premio */}
                <div className="bg-[#111] border border-gray-800 rounded-xl p-8 text-center hover:border-gray-700 transition-colors duration-200">
                  <p className="text-xs font-semibold uppercase tracking-widest text-yellow-500/70 mb-3">
                    {contenido.premios_primer_label}
                  </p>
                  <p className="text-2xl lg:text-3xl font-display tracking-wide uppercase text-white">
                    {sorteo.titulo_remera || "Remera Exclusiva"}
                  </p>
                </div>

                {/* Premios Secundarios */}
                {premiosSecundarios?.visible &&
                  premiosSecundarios.numeros.length > 0 && (
                    <div className="bg-[#111] border border-yellow-500/20 rounded-xl p-6 md:p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Trophy className="w-4 h-4 text-yellow-500/70" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-yellow-500/70">
                          {contenido.premios_sec_label}
                        </p>
                      </div>

                      <p className="text-base font-semibold text-yellow-300 mb-4">
                        {premiosSecundarios.titulo}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {premiosSecundarios.numeros.map((num) => (
                          <span
                            key={num}
                            className="bg-yellow-400/8 border border-yellow-400/25 text-yellow-300 font-mono font-bold text-xl rounded-lg px-4 py-1.5"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {contenido.premios_sec_descripcion
                          .split("{monto}")
                          .map((parte, i, partes) => (
                            <span key={i}>
                              {parte}
                              {i < partes.length - 1 && (
                                <span className="font-semibold text-gray-300">
                                  {premiosSecundarios.monto}
                                </span>
                              )}
                            </span>
                          ))}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </section>
        )}

        {/* Sección FAQ */}
        <section className="order-3 lg:order-2 py-20 border-t-2 border-[#171717]">
          <div className="container mx-auto px-4 max-w-xl">
            <span className="kicker mb-4">Info</span>
            <h2 className="text-4xl lg:text-5xl font-display font-bold tracking-tight uppercase text-[#171717] mb-10">
              {contenido.faq_titulo}
            </h2>

            <div className="space-y-6">
              <div className="bg-white border-2 border-[#171717] hard-shadow-sm p-5">
                <p className="text-xs font-display font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
                  {contenido.faq_pregunta_fecha}
                </p>
                <div className="border-l-[6px] border-[#72BF44] pl-4">
                  <span className="text-[#171717] text-lg font-semibold">
                    {sorteo?.fecha_sorteo
                      ? new Date(
                          sorteo.fecha_sorteo + "T12:00:00",
                        ).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Próximamente"}
                  </span>
                </div>
              </div>

              <div className="bg-white border-2 border-[#171717] hard-shadow-sm p-5">
                <p className="text-xs font-display font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-2">
                  {contenido.faq_pregunta_ganador}
                </p>
                <Link
                  href={contenido.faq_link_quiniela}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="border-l-[6px] border-[#72BF44] pl-4 group">
                    <span className="text-[#171717] text-base font-semibold group-hover:text-[#5da336] transition-colors duration-150 underline decoration-[#72BF44] decoration-2 underline-offset-4">
                      {contenido.faq_respuesta_ganador}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Sección Consultá tus números */}
        <section className="order-1 lg:order-3 py-20 border-t-2 border-[#171717] bg-graphite">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="mb-8">
              <span className="kicker kicker-on-dark mb-3">
                {contenido.consulta_kicker}
              </span>
              <h2 className="text-4xl lg:text-5xl font-display font-bold tracking-tight uppercase text-white mb-3">
                {contenido.consulta_titulo}
              </h2>
              <p className="text-neutral-400 text-sm">
                {contenido.consulta_descripcion}
              </p>
            </div>

            <form
              onSubmit={consultarMisNumeros}
              className="flex flex-col sm:flex-row gap-3 mb-6"
            >
              <input
                type="email"
                value={consultaEmail}
                onChange={(e) => setConsultaEmail(e.target.value)}
                placeholder={contenido.consulta_placeholder}
                disabled={consultaLoading}
                className="flex-1 bg-white border-2 border-[#171717] text-[#171717] placeholder:text-neutral-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#72BF44] transition-shadow disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={consultaLoading || !consultaEmail.trim()}
                className="btn-neon px-7 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none whitespace-nowrap"
              >
                {consultaLoading ? "Buscando..." : contenido.consulta_boton}
              </button>
            </form>

            {consultaError && (
              <div className="bg-white border-2 border-red-600 border-l-[6px] p-4 text-center text-red-700 text-sm mb-4">
                {consultaError}
              </div>
            )}

            {consultaResultados !== null && consultaResultados.length === 0 && (
              <div className="bg-white border-2 border-[#171717] hard-shadow-sm p-6 text-center">
                <p className="text-neutral-700 text-sm font-medium">
                  {contenido.consulta_vacio}
                </p>
                <p className="text-neutral-500 text-xs mt-2">
                  {contenido.consulta_vacio_nota}
                </p>
              </div>
            )}

            {consultaResultados !== null && consultaResultados.length > 0 && (
              <div className="space-y-4">
                {consultaResultados.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white border-2 border-[#171717] hard-shadow-sm p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <p className="text-[#171717] font-display font-bold uppercase tracking-tight">
                          {p.nombre}
                        </p>
                        <p className="text-neutral-500 text-xs mt-0.5">
                          {p.sorteo_nombre}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-400 tabular-nums">
                        {new Date(p.created_at).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs font-display font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-3">
                      Tus {p.cantidad_chances} números asignados
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[...p.numeros_asignados]
                        .sort((a, b) => a - b)
                        .map((numero) => (
                          <span
                            key={numero}
                            className="bg-[#72BF44] text-[#171717] font-mono font-bold px-3 py-1 text-sm border-2 border-[#171717] tabular-nums"
                          >
                            {numero}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Ganadores Express */}
      {sorteo && (
        <GanadoresExpress sorteoId={sorteo.id} contenido={contenido} />
      )}

      {/* Ganadores Pasados */}
      <GanadoresPasados contenido={contenido} />

      {/* Links de interés / Redes sociales */}
      <RedesSociales contenido={contenido} />

      {/* QR */}
      {/* <div className="bg-dark-gradient flex flex-col items-center gap-4 py-14 border-t-2 border-[#171717]">
        <div className="bg-white border-2 border-[#171717] hard-shadow p-3">
          <img
            src="/delfos-qr.jpeg"
            alt="Código QR"
            className="w-32 h-32"
          />
        </div>
        <p className="text-[#171717] text-xs font-display font-semibold tracking-[0.18em] uppercase">
          Escaneá y participá gratis
        </p>
      </div> */}

      {/* Footer */}
      <footer className="bg-graphite border-t-2 border-[#72BF44] py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-lg font-display font-bold uppercase tracking-tight text-white">
              {contenido.marca}
            </span>
            <div className="flex space-x-8">
              <Link
                href={contenido.whatsapp_url}
                className="text-neutral-400 hover:text-[#72BF44] transition-colors text-sm font-medium"
              >
                Contacto
              </Link>
              <Link
                href="/terminos"
                className="text-neutral-400 hover:text-[#72BF44] transition-colors text-sm font-medium"
              >
                Términos
              </Link>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-neutral-500 text-xs">
              {contenido.footer_copyright}
            </p>
            <Link
              href="https://linktr.ee/deweertstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-300 transition-colors text-xs"
            >
              Desarrollado por De Weert Studio
            </Link>
          </div>
        </div>
      </footer>

      <CompraModalNuevo
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        pack={packSeleccionado}
        onCompraMercadoPago={procesarCompra}
        onCompraTransferencia={procesarTransferencia}
      />

      <Toaster />
    </div>
  )
}
