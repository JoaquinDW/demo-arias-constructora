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
  const [premiosSecundarios, setPremiosSecundarios] = useState<PremiosSecundarios | null>(null)
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
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#ff0040] border-t-transparent rounded-full animate-spin mx-auto opacity-80"></div>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Cargando</p>
        </div>
      </div>
    )
  }

  if (!sorteo) {
    return (
      <div className="min-h-screen bg-dark-gradient flex flex-col">
        <Header marca={contenido.marca} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-gray-700 mx-auto">
              <img src="/sosamotos.jpeg" alt={contenido.marca} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-display tracking-wider text-white uppercase">{contenido.proximamente_titulo}</h2>
              <p className="text-gray-500 text-sm">{contenido.proximamente_descripcion}</p>
            </div>
            <Link
              href={contenido.whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block btn-neon px-6 py-3 rounded-lg font-semibold text-sm tracking-wide"
            >
              {contenido.proximamente_boton}
            </Link>
          </div>
        </div>
        <RedesSociales contenido={contenido} />
        <footer className="bg-black border-t border-gray-900 py-6">
          <div className="container mx-auto px-4 text-center text-gray-600 text-xs tracking-wide">
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
        {/* Background Effects — muy sutiles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-80 h-80 bg-[#ff0040]/4 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#ff0040]/3 rounded-full blur-3xl"></div>
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
                <div className="absolute -top-4 inset-x-0 mx-auto w-fit lg:inset-x-auto lg:right-16 lg:mx-0 xl:-right-2 bg-[#ff0040] text-white px-4 py-1.5 rounded-full font-semibold text-xs tracking-widest uppercase z-30 flex items-center gap-1.5">
                  <Trophy className="w-3 h-3" />
                  {contenido.hero_badge}
                </div>
              </div>

              {/* Título bajo el carousel */}
              <div className="text-center mt-8">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display tracking-widest text-[#ff0040] uppercase">
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
                <p className="order-1 lg:order-1 text-2xl lg:text-3xl text-gray-300 font-light leading-snug">
                  {contenido.hero_subtitulo}
                </p>
              )}

              {/* Progress Bar / Evento finalizado */}
              {sorteo?.estado === "sorteado" ? (
                <div className="order-3 lg:order-2 bg-[#111] border border-gray-800 rounded-xl p-6 text-center">
                  <p className="text-lg font-semibold text-gray-300">
                    Evento finalizado
                  </p>
                </div>
              ) : (
                <div className="order-3 lg:order-2 space-y-4 bg-[#111] border border-gray-800 rounded-xl p-5 sm:p-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                      {contenido.hero_chances_label}
                    </span>
                  </div>
                  <AnimatedProgress value={porcentajeVendido} className="h-3" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-display tracking-wide text-[#ff0040]">
                      {porcentajeVendido.toFixed(1)}%
                    </span>
                    <span className="text-sm text-gray-500">{contenido.hero_completado_label}</span>
                  </div>
                </div>
              )}

              {/* Estados: completo / sorteado / cerrado */}
              {sorteoCompleto && (
                <div className="order-4 lg:order-3 space-y-4">
                  {sorteo?.estado === "completo" && (
                    <div className="bg-yellow-950/30 border border-yellow-800/40 text-yellow-300 px-5 py-4 rounded-xl">
                      <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {contenido.hero_completo_titulo}
                      </h3>
                      <p className="text-sm text-yellow-300/70">
                        {contenido.hero_completo_descripcion}
                      </p>
                      {sorteo.fecha_sorteo_realizado && (
                        <p className="text-xs opacity-60 mt-1">
                          Prendas completadas el{" "}
                          {new Date(sorteo.fecha_sorteo_realizado).toLocaleDateString("es-AR")}
                        </p>
                      )}
                    </div>
                  )}

                  {sorteo?.estado === "sorteado" && (
                    <div className="bg-green-950/30 border border-green-800/40 text-green-300 px-5 py-4 rounded-xl">
                      <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4" />
                        {contenido.hero_sorteado_titulo}
                      </h3>
                      {sorteo.numero_ganador && (
                        <div className="space-y-1.5">
                          {sorteo.ganador_nombre && (
                            <p className="text-sm text-white">
                              Ganador:{" "}
                              <span className="font-semibold text-green-400">
                                {sorteo.ganador_nombre}
                              </span>
                            </p>
                          )}
                          <p className="text-sm text-white">
                            Número Ganador:{" "}
                            <span className="font-mono font-bold text-green-400 text-lg">
                              {sorteo.numero_ganador}
                            </span>
                          </p>
                          <p className="text-xs text-green-300/60">
                            Según la Quiniela de Buenos Aires del{" "}
                            {sorteo.updated_at &&
                              new Date(sorteo.updated_at).toLocaleDateString("es-AR")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {(sorteo?.estado === "cerrado" ||
                    (sorteo?.estado && !sorteo.estado.match(/completo|sorteado/))) && (
                    <div className="bg-[#ff0040]/10 border border-[#ff0040]/20 text-white px-5 py-4 rounded-xl">
                      <h3 className="text-base font-semibold mb-1">
                        {contenido.hero_cerrado_titulo}
                      </h3>
                      <p className="text-sm text-gray-400">{contenido.hero_cerrado_descripcion}</p>
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
                        <div className="mb-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#ff0040] pl-1">
                            {contenido.packs_popular_label}
                          </span>
                        </div>
                      )}

                      <div
                        className={`rounded-xl p-4 sm:p-5 transition-all duration-200 ${
                          pack.popular
                            ? "bg-[#ff0040]/8 border border-[#ff0040]/35 hover:border-[#ff0040]/60"
                            : "bg-[#111] border border-gray-800 hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-lg sm:text-xl font-semibold text-white">
                              {pack.chances} Chances
                            </div>
                            <div
                              className={`text-xs font-medium mt-0.5 line-clamp-2 ${
                                pack.descripcion ? "text-yellow-400/80" : "text-gray-500"
                              }`}
                            >
                              {pack.descripcion || `${pack.chances} números asignados`}
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <div className="text-xl sm:text-2xl font-semibold text-[#ff0040]">
                              ${pack.precio.toLocaleString()}
                            </div>
                            <Button
                              onClick={() => handleCompra(pack)}
                              size="sm"
                              className="btn-neon mt-2 px-5 py-1.5 text-xs rounded-lg h-auto"
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
                <p className="order-5 lg:order-5 text-xs text-gray-600 text-center tracking-wide">
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
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff0040] mb-3">
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
            {premiosSecundarios?.visible && premiosSecundarios.numeros.length > 0 && (
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
                  {contenido.premios_sec_descripcion.split("{monto}").map((parte, i, partes) => (
                    <span key={i}>
                      {parte}
                      {i < partes.length - 1 && (
                        <span className="font-semibold text-gray-300">{premiosSecundarios.monto}</span>
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
      <section className="order-3 lg:order-2 py-16 border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-xl">
          <h2 className="text-4xl lg:text-5xl font-display tracking-wider text-white mb-10">
            {contenido.faq_titulo}
          </h2>

          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
                {contenido.faq_pregunta_fecha}
              </p>
              <div className="border-l-2 border-[#ff0040]/40 pl-4">
                <span className="text-white text-lg font-medium">
                  {sorteo?.fecha_sorteo
                    ? new Date(sorteo.fecha_sorteo + "T12:00:00").toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Próximamente"}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
                {contenido.faq_pregunta_ganador}
              </p>
              <Link
                href={contenido.faq_link_quiniela}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="border-l-2 border-[#ff0040]/40 pl-4 hover:border-[#ff0040] transition-colors duration-200">
                  <span className="text-[#ff0040] text-base font-medium">
                    {contenido.faq_respuesta_ganador}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Consultá tus números */}
      <section className="order-1 lg:order-3 py-16 border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#ff0040] mb-3">
              {contenido.consulta_kicker}
            </p>
            <h2 className="text-4xl lg:text-5xl font-display tracking-wider text-white mb-2">
              {contenido.consulta_titulo}
            </h2>
            <p className="text-gray-500 text-sm">
              {contenido.consulta_descripcion}
            </p>
          </div>

          <form
            onSubmit={consultarMisNumeros}
            className="flex flex-col sm:flex-row gap-2 mb-6"
          >
            <input
              type="email"
              value={consultaEmail}
              onChange={(e) => setConsultaEmail(e.target.value)}
              placeholder={contenido.consulta_placeholder}
              disabled={consultaLoading}
              className="flex-1 bg-[#111] border border-gray-800 text-white placeholder:text-gray-600 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#ff0040]/60 focus:ring-1 focus:ring-[#ff0040]/30 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={consultaLoading || !consultaEmail.trim()}
              className="btn-neon px-7 py-3 rounded-lg text-sm font-semibold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none whitespace-nowrap"
            >
              {consultaLoading ? "Buscando..." : contenido.consulta_boton}
            </button>
          </form>

          {consultaError && (
            <div className="bg-red-950/30 border border-red-900/40 rounded-lg p-4 text-center text-red-400 text-sm mb-4">
              {consultaError}
            </div>
          )}

          {consultaResultados !== null && consultaResultados.length === 0 && (
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-500 text-sm">
                {contenido.consulta_vacio}
              </p>
              <p className="text-gray-600 text-xs mt-2">
                {contenido.consulta_vacio_nota}
              </p>
            </div>
          )}

          {consultaResultados !== null && consultaResultados.length > 0 && (
            <div className="space-y-4">
              {consultaResultados.map((p) => (
                <div key={p.id} className="bg-[#111] border border-gray-800 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <p className="text-white font-semibold">{p.nombre}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{p.sorteo_nombre}</p>
                    </div>
                    <span className="text-xs text-gray-600">
                      {new Date(p.created_at).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 mb-3">
                    Tus {p.cantidad_chances} números asignados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[...p.numeros_asignados]
                      .sort((a, b) => a - b)
                      .map((numero) => (
                        <span
                          key={numero}
                          className="bg-[#ff0040]/10 text-[#ff0040] font-mono font-semibold px-3 py-1 rounded text-sm border border-[#ff0040]/15"
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
      {sorteo && <GanadoresExpress sorteoId={sorteo.id} contenido={contenido} />}

      {/* Ganadores Pasados */}
      <GanadoresPasados contenido={contenido} />

      {/* Links de interés / Redes sociales */}
      <RedesSociales contenido={contenido} />

      {/* QR */}
      <div className="bg-black flex flex-col items-center gap-3 py-10">
        <img
          src="/sosa-qr.jpeg"
          alt="Código QR"
          className="w-32 h-32 rounded-lg opacity-90"
        />
        <p className="text-gray-400 text-xs font-semibold tracking-wide uppercase">
          Escanea y participa gratis
        </p>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-900 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-base font-semibold text-white tracking-wide">
              {contenido.marca}
            </span>
            <div className="flex space-x-6">
              <Link
                href={contenido.whatsapp_url}
                className="text-gray-600 hover:text-gray-300 transition-colors text-sm"
              >
                Contacto
              </Link>
              <Link
                href="/terminos"
                className="text-gray-600 hover:text-gray-300 transition-colors text-sm"
              >
                Términos
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-900 mt-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-gray-700 text-xs">{contenido.footer_copyright}</p>
            <Link
              href="https://linktr.ee/deweertstudio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-500 transition-colors text-xs"
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
