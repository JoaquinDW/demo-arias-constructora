"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Clock, Star, Trophy } from "lucide-react"
import Link from "next/link"
import { CompraModalNuevo } from "@/components/compra-modal-nuevo"
import { Header } from "@/components/header"
import { TShirtMockup } from "@/components/tshirt-mockup"
import { GanadoresPasados } from "@/components/ganadores-pasados"
import { GanadoresExpress } from "@/components/ganadores-express"
import dynamic from "next/dynamic"

const IphoneCarousel = dynamic(() => import("@/components/iphone-carousel"), {
  ssr: false,
})
import {
  obtenerSorteoActivo,
  obtenerEstadisticasSorteo,
  generarNumerosUnicos,
} from "@/lib/database"
import type { Sorteo } from "@/lib/supabase"
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

    // Filtrar solo los packs visibles
    return allPacks.filter((pack) => pack.visible)
  }

  useEffect(() => {
    cargarDatos()
    const timer = setTimeout(() => setAnimacionVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const cargarDatos = async () => {
    try {
      const sorteoActivo = await obtenerSorteoActivo()
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
      // Verificar disponibilidad de números
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

      // Guardar datos en localStorage
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

      // Mostrar loading
      toast({
        title: "Preparando pago...",
        description: "Te redirigiremos a MercadoPago en un momento",
      })

      // Crear preferencia de pago
      const response = await fetch("/api/crear-preferencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosCompra),
      })

      if (!response.ok) {
        throw new Error("Error creando preferencia de pago")
      }

      const { preferenceId, paymentUrl } = await response.json()

      // Guardar preference ID en localStorage
      const datosActualizados = { ...datosCompra, preferenceId }
      localStorage.setItem(
        "sorteo_compra_pendiente",
        JSON.stringify(datosActualizados),
      )

      // Redirigir a MercadoPago
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
      // Detectar si es teléfono (WhatsApp) o Instagram
      const esWhatsApp = /^[\d\s+()-]+$/.test(data.contacto.trim())

      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append("sorteoId", sorteo.id)
      formData.append("nombre", data.nombre)
      if (data.email) {
        formData.append("email", data.email)
      }
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

      if (!response.ok) {
        throw new Error("Error procesando transferencia")
      }

      const resultado = await response.json()

      toast({
        title: "¡Transferencia registrada!",
        description:
          "Tu pago está pendiente de confirmación. Te notificaremos por email cuando sea aprobado.",
        duration: 5000,
      })

      // Actualizar estadísticas localmente para mostrar el cambio
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
    setPackSeleccionado({
      ...pack,
      sorteoId: sorteo?.id,
    })
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
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-4 neon-glow"></div>
          <p className="text-lg text-gray-300">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!sorteo) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-300">
            No hay chances activas en este momento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#ff0040]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-red-400/5 to-transparent rounded-full"></div>
        </div>

        <div className="relative container mx-auto px-4 py-10 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* iPhone Carousel a la izquierda */}
            <div
              className={`relative transition-all duration-1000 ${
                animacionVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-10"
              }`}
            >
              <div className="relative group">
                {/* Glow effect behind carousel */}
                <div className="absolute -inset-8 bg-gradient-to-r from-red-400/20 to-orange-400/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-1000 animate-pulse"></div>

                {/* iPhone Carousel */}
                <div className="relative">
                  <IphoneCarousel />
                </div>

                {/* Texto principal */}
                <div className="text-center mt-8 space-y-4">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl uppercase font-black text-[#ff0040]">
                    {/* COMPRANDO MI REMERA DIGITAL */}
                    ¡PARTICIPA POR UNA HONDA WAVE 2026 0KM!
                  </h2>
                  {/* <h3 className="text-xl lg:text-2xl font-bold text-red-500 glow-red">
                    PARTICIPAS GRATIS DEL IPHONE 14 pro Max NUEVO EN CAJA
                  </h3> */}
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 inset-x-0 mx-auto w-fit lg:inset-x-auto lg:right-24 lg:mx-0 xl:-right-4 bg-neon-gradient text-black px-4 py-2 rounded-full font-bold text-sm animate-bounce z-30">
                  <Trophy className="w-4 h-4 inline mr-1" />
                  PREMIO EXCLUSIVO
                </div>
              </div>
            </div>

            {/* Contenido a la derecha */}
            <div
              className={`space-y-8 transition-all duration-1000 delay-300 ${
                animacionVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-10"
              }`}
            >
              {/* Badge y título */}
              <div className="space-y-2">
                {/* <Badge className="bg-neon-gradient text-black hover:bg-neon-gradient text-sm font-bold px-6 py-3 animate-glow">
                  <Zap className="w-4 h-4 mr-2" />
                  Chances limitadas
                </Badge> */}

                {/* <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                  <span className="text-white">GONZA MAS MOTOS</span>
                  <br />
                  <span className="neon-text text-center uppercase animate-neon-pulse">
                    EXCLUSIVO
                    Edición limitada.
                  </span>
                </h1> */}

                {sorteo?.estado !== "sorteado" && (
                  <p className="text-xl lg:text-3xl text-gray-300  font-medium max-w-lg">
                    Compra que se van volando!
                  </p>
                )}
              </div>

              {/* Progress Bar / Evento finalizado */}
              {sorteo?.estado === "sorteado" ? (
                <div className="bg-card-dark backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 neon-border text-center">
                  <p className="text-xl sm:text-2xl font-bold text-gray-300">
                    Evento finalizado
                  </p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6 bg-card-dark backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 neon-border">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold text-white">
                      Chances vendidas
                    </span>
                    {/* <span className="text-lg font-bold neon-text">
                      {chancesVendidas}/{TOTAL_CHANCES}
                    </span> */}
                  </div>
                  <AnimatedProgress value={porcentajeVendido} className="h-8" />
                  <div className="text-center">
                    <span className="text-2xl sm:text-3xl font-black text-[#ff0040]">
                      {porcentajeVendido.toFixed(1)}%
                    </span>
                    <span className="text-base sm:text-lg ml-2 text-gray-300">
                      completado
                    </span>
                  </div>
                </div>
              )}

              {/* Stats */}
              {/* <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-card-dark backdrop-blur-sm rounded-xl p-6 neon-border hover:neon-glow transition-all duration-300">
                  <Users className="h-8 w-8 mx-auto mb-3 neon-text" />
                  <div className="text-3xl font-bold text-white">
                    {totalCompradores}
                  </div>
                  <div className="text-sm text-gray-400">Participantes</div>
                </div>
                <div className="text-center bg-card-dark backdrop-blur-sm rounded-xl p-6 neon-border hover:neon-glow transition-all duration-300">
                  <Clock className="h-8 w-8 mx-auto mb-3 neon-text" />
                  <div className="text-3xl font-bold text-white">{TOTAL_CHANCES - chancesVendidas}</div>
                  <div className="text-sm text-gray-400">Disponibles</div>
                </div>
                <div className="text-center bg-card-dark backdrop-blur-sm rounded-xl p-6 neon-border hover:neon-glow transition-all duration-300">
                  <Star className="h-8 w-8 mx-auto mb-3 neon-text" />
                  <div className="text-3xl font-bold text-white">1</div>
                  <div className="text-sm text-gray-400">Ganador</div>
                </div>
              </div> */}

              {/* Mensaje de sorteo completo */}
              {sorteoCompleto && (
                <div className="space-y-4">
                  {/* Estado: Completo - Esperando sorteo */}
                  {sorteo?.estado === "completo" && (
                    <div className="bg-yellow-900/20 border border-yellow-500/50 text-yellow-300 px-6 py-4 rounded-xl text-center backdrop-blur-sm">
                      <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                        <Clock className="w-6 h-6" />
                        ¡Todas las prendas vendidas!
                      </h3>
                      <p className="mb-2">
                        El sorteo se realizará mañana a las{" "}
                        <strong>14:00 hs</strong> según el primer número de la{" "}
                        <strong>Quiniela de Buenos Aires</strong>
                      </p>
                      {sorteo.fecha_sorteo_realizado && (
                        <p className="text-sm opacity-80">
                          Prendas completadas el{" "}
                          {new Date(
                            sorteo.fecha_sorteo_realizado,
                          ).toLocaleDateString("es-AR")}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Estado: Sorteado - Mostrar ganador */}
                  {sorteo?.estado === "sorteado" && (
                    <div className="bg-green-900/20 border border-green-500/50 text-green-300 px-6 py-4 rounded-xl text-center backdrop-blur-sm">
                      <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                        <Trophy className="w-6 h-6" />
                        Resultados!
                      </h3>
                      {sorteo.numero_ganador && (
                        <div className="space-y-2">
                          {sorteo.ganador_nombre && (
                            <p className="text-xl font-semibold text-white">
                              Ganador:{" "}
                              <span className="text-green-400">
                                {sorteo.ganador_nombre}
                              </span>
                            </p>
                          )}
                          <p className="text-2xl font-bold text-white">
                            Número Ganador:{" "}
                            <span className="text-green-400">
                              {sorteo.numero_ganador}
                            </span>
                          </p>
                          <p className="text-sm">
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

                  {/* Estado: Cerrado o por defecto */}
                  {(sorteo?.estado === "cerrado" ||
                    (sorteo?.estado &&
                      !sorteo.estado.match(/completo|sorteado/))) && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-6 py-4 rounded-xl text-center backdrop-blur-sm">
                      <h3 className="text-xl font-bold mb-2">
                        ¡Gracias por participar!
                      </h3>
                      {/* <p>Gracias por participar y mucha suerte a todos!</p> */}
                      <p>Mucha suerte a todos y siempre con fe!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Botones de compra */}
              {!sorteoCompleto && (
                <div className="grid gap-4">
                  {PACKS.map((pack, index) => (
                    <div
                      key={pack.chances}
                      className={`relative group transition-all duration-300 ${
                        animacionVisible
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-10"
                      }`}
                      style={{ transitionDelay: `${(index + 4) * 200}ms` }}
                    >
                      {pack.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <Badge className="bg-neon-gradient text-black px-4 py-1 font-bold animate-pulse">
                            MÁS POPULAR
                          </Badge>
                        </div>
                      )}

                      <div
                        className={`bg-card-dark rounded-2xl p-4 sm:p-6 neon-border hover:neon-glow transition-all duration-300 ${
                          pack.popular ? "scale-100" : "scale-95"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="text-xl sm:text-2xl font-bold text-white">
                                {pack.chances} Chances
                              </div>
                              <div
                                className={`text-sm font-semibold mt-1 line-clamp-2 ${
                                  pack.descripcion
                                    ? "text-yellow-400"
                                    : "text-gray-400"
                                }`}
                              >
                                {pack.descripcion ||
                                  `${pack.chances} números asignados`}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl sm:text-2xl font-extrabold text-[#ff0040]">
                              ${pack.precio.toLocaleString()}
                            </div>
                            <Button
                              onClick={() => handleCompra(pack)}
                              className="btn-neon mt-2 px-6 py-2"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Comprar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Solo mostrar el texto de más chances si hay múltiples packs visibles */}
              {!sorteoCompleto && PACKS.length > 1 && (
                <p className="text-base px-2 text-gray-400 text-center mt-4">
                  Mientras más chances compras, más posibilidades de ganar! 🤩
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Premios */}
      <section className="py-16 bg-gradient-to-b from-black/50 to-black/80">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {/* <Trophy className="w-10 h-10 inline mr-3 text-yellow-400" /> */}
              Premios
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* 1er Premio */}
            <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 text-center">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">
                1er Premio
              </h3>
              <p className="text-2xl lg:text-3xl font-bold uppercase text-white">
                {/* HONDA XR 150 2024! */}
                HONDA WAVE 2026 0KM!
              </p>
            </div>

            {/* 2do Premio */}
            <div className="bg-gray-900/50 rounded-2xl p-6 md:p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-300 mb-4 flex items-center justify-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                PREMIOS SECUNDARIOS
              </h3>

              <div className="flex flex-col items-center gap-4">
                <p className="text-lg font-bold text-yellow-300 tracking-widest text-center">
                  NÚMEROS BENDECIDOS 🙏🏻✨
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {["8899", "6868", "828", "168", "33"].map((num) => (
                    <span
                      key={num}
                      className="bg-yellow-400/10 border border-yellow-400/40 text-yellow-300 font-extrabold text-2xl rounded-xl px-5 py-2"
                    >
                      {num}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-300 text-center mt-1">
                  Si te toca alguno de estos números ganás{" "}
                  <span className="font-bold text-white">$50 mil</span> 🎁✅
                </p>
              </div>
            </div>

            {/* 3er Premio */}
            {/* <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-700 hover:border-gray-600 transition-all duration-300 text-center">
              <h3 className="text-2xl font-bold text-orange-400 mb-4">
                3er Premio
              </h3>
              <p className="text-2xl lg:text-3xl font-bold text-white">
                $50.000
              </p>
            </div> */}
          </div>
        </div>
      </section>

      {/* Sección de Preguntas Frecuentes */}
      <section className="py-16 bg-gradient-to-b from-black/80 to-black/50">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-10 text-center">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                ¿CUÁNDO SE REALIZA EL EVENTO?
              </h3>
              <div className="bg-card-dark rounded-xl p-4 neon-border text-center">
                <span className="text-white text-lg font-bold">
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

            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                ¿EN DÓNDE VEMOS EL GANADOR?
              </h3>
              <Link
                href="https://www.loteriasmundiales.com.ar/Quinielas/buenos-aires"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-card-dark rounded-xl p-4 neon-border text-center hover:neon-glow transition-all duration-300 cursor-pointer">
                  <span className="text-[#ff0040] text-lg font-bold glow-red">
                    POR QUINIELA DE BUENOS AIRES LA PREVIA — 10:15 hs
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Consultá tus números */}
      <section className="py-16 bg-gradient-to-b from-black/50 to-black/80">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 text-center">
            ¿Ya participaste?
          </h2>
          <p className="text-center text-gray-400 mb-10 text-lg">
            Ingresá el email con el que compraste y consultá tus números
            asignados.
          </p>
          <form
            onSubmit={consultarMisNumeros}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <input
              type="email"
              value={consultaEmail}
              onChange={(e) => setConsultaEmail(e.target.value)}
              placeholder="tucorreo@email.com"
              disabled={consultaLoading}
              className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:border-[#ff0040] focus:ring-1 focus:ring-[#ff0040] transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={consultaLoading || !consultaEmail.trim()}
              className="bg-[#ff0040] text-white font-bold px-8 py-3 rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {consultaLoading ? "Buscando..." : "Consultar"}
            </button>
          </form>

          {consultaError && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-center text-red-400 mb-4">
              {consultaError}
            </div>
          )}

          {consultaResultados !== null && consultaResultados.length === 0 && (
            <div className="bg-card-dark rounded-xl p-6 neon-border text-center">
              <p className="text-gray-400 text-lg">
                No encontramos participaciones confirmadas para ese email.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Si pagaste por transferencia, tu pago puede estar pendiente de
                aprobación.
              </p>
            </div>
          )}

          {consultaResultados !== null && consultaResultados.length > 0 && (
            <div className="space-y-4">
              {consultaResultados.map((p) => (
                <div
                  key={p.id}
                  className="bg-card-dark rounded-xl p-6 neon-border"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <p className="text-white font-bold text-lg">{p.nombre}</p>
                      <p className="text-gray-400 text-sm">{p.sorteo_nombre}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(p.created_at).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                    Tus {p.cantidad_chances} números asignados
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[...p.numeros_asignados]
                      .sort((a, b) => a - b)
                      .map((numero) => (
                        <span
                          key={numero}
                          className="bg-gray-900 border border-[#ff0040] text-[#ff0040] font-bold px-3 py-1 rounded-lg text-sm"
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

      {/* Sección de Ganadores Express */}
      {sorteo && <GanadoresExpress sorteoId={sorteo.id} />}

      {/* Sección de Ganadores Pasados */}
      <GanadoresPasados />

      {/* Footer minimalista */}
      <footer className="bg-black/50 backdrop-blur-sm border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h3 className="text-xl font-bold neon-text">Sosa Motos</h3>
            </div>
            <div className="flex space-x-6">
              {/* <Link
                href="/backoffice"
                className="text-gray-400 hover:neon-text transition-colors"
              >
                Admin
              </Link> */}
              <Link
                href={"https://wa.me/5493795152063"}
                className="text-gray-400 hover:neon-text transition-colors"
              >
                Contacto
              </Link>
              <Link
                href="/terminos"
                className="text-gray-400 hover:neon-text transition-colors"
              >
                Términos
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-gray-500">
            <p>&copy; 2025 Sosa Motos. Todos los derechos reservados.</p>
            <p className="mt-2">
              <Link
                href={"https://linktr.ee/deweertstudio"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:neon-text transition-colors"
              >
                Desarrollado por De Weert Studio
              </Link>
            </p>
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
